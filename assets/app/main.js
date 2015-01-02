var odinApp = angular.module('odinApp', []);

odinApp.factory('_', function() {
  return window._;
});

odinApp.controller('ItemsController', ['$scope', '$http', '_', function($scope, $http, _) {
  $http.get('/db/states.json').then(function(response) {
    $scope.states = response.data.data;

    $http.get('/db/items.json').then(function(response) {
      var items = response.data.data;

      _.each(items, function(item) {
        item.state = _.find($scope.states, function(state) { return state.key === item.state });
      });

      $scope.items = items;
    });
  });

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
