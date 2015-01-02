var odinApp = angular.module('odinApp', ['ngRoute']);

odinApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: '/templates/items',
      controller: 'ItemsController'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

odinApp.factory('_', function() {
  return window._;
});

odinApp.controller('ItemsController', ['$scope', '$http', '_', function($scope, $http, _) {
  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;

    $http.get('/api/items').then(function(response) {
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

odinApp.filter('tag', ['_', function(_) {
  return function(items, tag) {
    if (!tag)
      return items;

    return _.filter(items, function(item) {
      return _.contains(item.tags, tag);
    });
  };
}])

odinApp.filter('tags', ['_', function(_) {
  return function(items) {
    return _.chain(items)
      .map(function(item) { return item.tags || [] })
      .flatten()
      .uniq()
      .sort()
      .value();
  };
}])

odinApp.directive('semanticDropdown', function() {
  return {
    link: function(scope, element, attr) {
      element.dropdown();
    }
  };
})