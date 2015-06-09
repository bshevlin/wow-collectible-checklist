myApp.controller('inputController', ["$scope", "$http", function ($scope, $http) {

  //input stuff
  $scope.selectedRegion = 'us';
  $scope.regionList = ['us', 'eu'];

  $scope.selectedRealm;
  $scope.realmList = {//arrays of server objects for us and eu
  };

  $scope.selectedCharacter;//selected character, bound to text box

  $scope.submit = function(){//when submit button is clicked
    $http.get("http://localhost:8080/api/"+$scope.selectedRegion+"/"+$scope.selectedRealm+"/"+$scope.selectedCharacter).success(function(data){
      $scope.character = data;
      console.log(data);
    });
  };

  $http.get('http://localhost:8080/api/us').success(function(data) {
   $scope.realmList.us = data.realms;
 });
  $http.get('http://localhost:8080/api/eu').success(function(data) {
   $scope.realmList.eu = data.realms;
 });


  //output stuff
  $scope.character
}]);


