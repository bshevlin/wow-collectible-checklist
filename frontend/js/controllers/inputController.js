myApp.controller('inputController', ["$scope", "$http", function ($scope, $http) {
	/*var updateServers = function(rg){
		return $http.get(rg+".battle.net/api/wow/realm/status");
	}*/	

    $scope.selectedRegion = 'us';

    $scope.regionList = ['us', 'eu'];

    /*$scope.realmList = {//arrays of server objects for us and eu
    	"us":updateServers("us"),
    	"eu":updateServers("eu")
    };*/

    //console.log($http.get("http://"+"us"+".battle.net/api/wow/realm/status"));
    $http.get('api/us').success(function(data) {
   		$scope.realmList.us = data.realms;
   		console.log(scope.realmList.us);
	});
}]);


