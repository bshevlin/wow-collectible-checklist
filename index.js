var Q = require("q");
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

//checks if an achievement has been earned. takes individual achievement object and character's record
//calls back with true or false
var checkAchievement = function(achievement, charAchieves){
	var deferred = Q.defer();
	var id = achievement.id;
	if(getIndex(id, charAchieves.achievementsCompleted) >= 0){
		deferred.resolve(true);
	} else{
		deferred.resolve(false);
	}
	return deferred.promise;
}



//binary search of a sorted array for a particular number
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


	//prints a list of mounts for a given character, etc.
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
		checkAchievement(achievementData[0].achievements[8], characterAchievements).then(console.log);
		checkAchievement(achievementData[0].achievements[9], characterAchievements).then(console.log);
		checkAchievement(achievementData[0].achievements[10], characterAchievements).then(console.log);

	}, function(err){
		console.error(err);
	});

}

main();
