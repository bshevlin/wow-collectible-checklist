"use strict";

var express = require("express");
var app = express();
var bodyParser = require('body-parser');

var Q = require("q");

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = 8080;

var router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
//app.listen(port);
console.log('Server running on port ' + port);



//calls back with an array of mount json objects from region/server/character combination
var getCharacterMounts = function(region, server, character){
	var http = require("http");
	var deferred = Q.defer();

	http.get("http://"+region+".battle.net/api/wow/character/"+server+"/"+character+"?fields=mounts", function(stream){
		stream.setEncoding("utf8");

		var data = "";
		stream.on("data", function(d){
			data += d;
		});

		stream.on("end", function(){
			var charObj = JSON.parse(data);
			var mountArray = charObj.mounts.collected;
			deferred.resolve(mountArray);
		});
	});
	return deferred.promise;
};

//same as above, but for companions. can include duplicates.
var getCharacterPets = function(region, server, character){
	var http = require("http");
	var deferred = Q.defer();

	http.get("http://"+region+".battle.net/api/wow/character/"+server+"/"+character+"?fields=pets", function(stream){
		stream.setEncoding("utf8");
		var data = "";

		stream.on("data", function(d){
			data += d;
		});

		stream.on("end", function(){
			var charObj = JSON.parse(data);
			var petArray = charObj.pets.collected;
			deferred.resolve(petArray);
		});

	});
	return deferred.promise;
};

//similar to above, but with achievements. Achievements have a much more complicated data structure.
//gives an achievements object, not an array.
var getCharacterAchievements = function(region, server, character){
		var http = require("http");
		var deferred = Q.defer();

		http.get("http://"+region+".battle.net/api/wow/character/"+server+"/"+character+"?fields=achievements", function(stream){
		stream.setEncoding("utf8");

		var data = "";
		stream.on("data", function(d){
			data += d;
		});

		stream.on("end", function(){
			var charObj = JSON.parse(data);
			var achieve = charObj.achievements;
			deferred.resolve(achieve);
		});
	});
	return deferred.promise;
};

//gets an array of achievement objects. one for each major category.
/*
{
	achievements[
		{
			categories[
				{
					achievements[x, y, z]
				}
			]
			achievements[a, b, c]
		}
	]
}
*/
var getAchievementData = function(region){
	var http = require("http");
	var deferred = Q.defer();

	http.get("http://"+region+".battle.net/api/wow/data/character/achievements", function(stream){
		stream.setEncoding("utf8");

		var data = "";
		stream.on("data", function(d){
			data += d;
		});


		stream.on("end", function(){
			var achObj = JSON.parse(data);
			var achieve = achObj.achievements;
			deferred.resolve(achieve);
		});
	});
	return deferred.promise;
};


//checks each achievement in every category, and adds a boolean attribute "completed"
//if false, goes through each criterion and adds the progress
var checkAchievements = function(achievements, charAchieves){
	var deferred = Q.defer();

	var iterateThroughAchievements = function(ary){//recursively goes through the data structure, calling checkAchievement() for each
		var deferred = Q.defer();
		var i;
		for(i=0;i<ary.length;i++){
			
			if("categories" in ary[i]){//ary[i] is a category, not an achievement
				iterateThroughAchievements(ary[i].categories).then(deferred.resolve);
			}
			if("achievements" in ary[i]){
				iterateThroughAchievements(ary[i].achievements).then(deferred.resolve);
			}
			if("points" in ary[i]){//ary[i] is an achievement, not a category
				checkAchievement(ary[i], charAchieves).then(deferred.resolve(true));

			}
		}
		return deferred.promise;
	};
	//checks if an achievement has been earned. takes individual achievement object and character's record
	//calls back with true or false
	var checkAchievement = function(achievement){
		var deferred = Q.defer();
		var id = achievement.id;
		if(getIndex(id, charAchieves.achievementsCompleted) >= 0){
			console.log("checked an achievement");
			achievement.completed = true;
			deferred.resolve(true);
		} else{
			achievement.completed = false;
			checkCriteria(achievement);
			deferred.resolve(false);
		}
		return deferred.promise;
	};
	var checkCriteria = function(achievement){
		var i = 0;
		for(i=0;i<achievement.criteria.length;i++){
			var index = getIndex(achievement.criteria[i].id, charAchieves.criteria)
			if(index >=0){
				achievement.criteria[i].progress = charAchieves.criteriaQuantity[index];
			};
		};
	};
	iterateThroughAchievements(achievements).then(deferred.resolve);

	return deferred.promise;
};



//binary search for a particular number in a sorted array
var getIndex = function(num, array){
	var length = array.length;
	var low = 0;
	var high = length-1;
	var i;

	while(low <= high){
		i = ((high + low) / 2) | 0;
		if(array[i] === num){
			return i;
		} else if(array[i] > num){
			high = i-1;
		} else{
			low = i+1;
		}

	}
	return -1;
}


//main method for testing
var main = function(){
	var rg = "us";
	var srv = "shuhalo";	//these will obviously be changable later
	var character = "rocktarded";
	var characterAchievements;
	var achievementData;
	var characterMounts;
	var characterPets;


	//gets a list of mounts for a given character, etc.
	Q.all([
		getCharacterMounts(rg, srv, character).then(function(data){
			characterMounts = data;
			/*var i;
			console.log("You have "+data.length+" mounts:");
			for(i=0;i<data.length;i++){
				console.log(data[i].name);
			}
			console.log("");*/
		}),

		getCharacterPets(rg, srv, character).then(function(data){
			characterPets = data;
			/*var i;
			console.log("You have "+data.length+" pets:");
			for(i=0;i<data.length;i++){
				console.log(data[i].name);
			}
			console.log("");*/
		}),

		getCharacterAchievements(rg, srv, character).then(function(data){
			characterAchievements = data;
			/*var list = data.achievementsCompleted;
			console.log("You have "+list.length+" achievements. They will not be listed right now, but trust me.\n");
			*/

		}),

		getAchievementData(rg).then(function(data){
			achievementData = data;
			//console.log("There are " +data.length + " categories of achievments.\n");

		})
	]).then(function(){
		console.log("Data gathered.\n");
		/*checkAchievement(achievementData[0].achievements[8], characterAchievements).then(console.log);
		checkAchievement(achievementData[0].achievements[9], characterAchievements).then(console.log);
		checkAchievement(achievementData[0].achievements[10], characterAchievements).then(console.log);*/

		checkAchievements(achievementData, characterAchievements).then(function(){
			console.log(achievementData[0].achievements[8]);
			console.log(achievementData[0].achievements[9]);
			console.log(achievementData[0].achievements[23]);
		}, function(err){
			console.error(err);
		});

	}, function(err){
		console.error(err);
	});

}

main();
