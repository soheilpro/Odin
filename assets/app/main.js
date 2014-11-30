var odinApp = angular.module('odinApp', []);

odinApp.controller('ItemsController', ['$scope', function($scope) {
  $scope.items = [
    {
      title: 'Sample'
    },
    {
      title: 'Add x'
    },
    {
      title: 'Do y'
    },
  ];

  $scope.addItem = function(title) {
    this.items.push({
      title: title,
    });
  };
}])
