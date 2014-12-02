var odinApp = angular.module('odinApp', []);

odinApp.factory('_', function() {
  return window._;
});

odinApp.controller('ItemsController', ['$scope', function($scope) {
  $scope.states = [
    { key: 'backlog', title: 'Backlog' },
    { key: 'todo',    title: 'To Do' },
    { key: 'doing',   title: 'Doing' },
    { key: 'done',    title: 'Done' },
  ];

  $scope.items = [];

  $scope.addNewItem = function() {
    this.items.push({
      title: this.newItem.title,
      state: this.states[0],
    });

    this.newItem.title = "";
  };
}])

odinApp.filter('state', ['_', function(_) {
  return function(items, state) {
    return _.filter(items, function(item) {
      return item.state.key === state.key;
    });
  };
}])
