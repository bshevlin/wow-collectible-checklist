myApp.controller('inputController', ["$scope", "$http", function ($scope, $http) {
	/*var updateServers = function(rg){
		return $http.get(rg+".battle.net/api/wow/realm/status");
	}*/	

    $scope.selectedRegion = 'us';
    $scope.regionList = ['us', 'eu'];

    $scope.selectedRealm;
    $scope.realmList = {//arrays of server objects for us and eu
    };

    $http.get('http://localhost:8080/api/us').success(function(data) {
   		$scope.realmList.us = data.realms;
	});
	$http.get('http://localhost:8080/api/eu').success(function(data) {
   		$scope.realmList.eu = data.realms;
	});
}]);


