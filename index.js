//Barry Shevlin
//
var http = require("http");


var server = "shuhalo";	//these will obviously be changable later
var character = "cowcao";
var battleNetUrl = "http://us.battle.net/api/wow/character/"
var fullUrl = battleNetUrl + server + "/" + character;

var getCharacterMounts = function(server, character){//returns an array of mount json objects
	
}