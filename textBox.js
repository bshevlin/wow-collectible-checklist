var serverList//array of server objects
tracker.controller("textBox",['$scope', function($scope){
	$scope.selectedRegion = "us";
	

	updateServers()
}])

var updateServers = function(rg){
	$http.get(rg+".battle.net/api/wow/realm/status").then(function(data){
		serverList = data.realms;
	})
}