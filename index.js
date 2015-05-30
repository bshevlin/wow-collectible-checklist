//calls back with an array of mount json objects from region/server/character combination
var getCharacterMounts = function(region, server, character, callback){
	var http = require("http");
	http.get("http://"+region+".battle.net/api/wow/character/"+server+"/"+character+"?fields=mounts", function(stream){
		stream.setEncoding("utf8");

		var data = "";
		stream.on("data", function(d){
			data += d;
		});

		stream.on("end", function(){
			var charObj = JSON.parse(data);
			var mountArray = charObj.mounts.collected;
			callback(mountArray);
		});
	});
};



var main = function(){//main method for testing
	var rg = "us";
	var srv = "shuhalo";	//these will obviously be changable later
	var character = "kaocow";

	//prints a list of mounts for a given character, etc.
	getCharacterMounts(rg, srv, character, function(data){
		console.log("You have "+data.length+" mounts:");
		for(i=0;i<data.length;i++){
			console.log(data[i].name);
		}
	});
}
main();
