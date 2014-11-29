var odinApp = angular.module('odinApp', []);

odinApp.controller('ItemsController', ['$scope', function($scope) {
  $scope.items = [];

  $scope.addItem = function(title) {
    this.items.push({
      title: title,
    });
  };
}])
