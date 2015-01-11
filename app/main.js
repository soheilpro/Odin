var odinApp = angular.module('odinApp', ['ngRoute']);

odinApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
    .when('/projects', {
      templateUrl: '/templates/projects',
      controller: 'ProjectsController'
    })
    .when('/projects/:projectId', {
      templateUrl: '/templates/project',
      controller: 'ProjectController'
    })
    .otherwise({
      redirectTo: '/projects'
    });
}]);

odinApp.factory('_', function() {
  return window._;
});

odinApp.controller('ProjectsController', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/projects').then(function(response) {
    $scope.projects = response.data.data;
  });
}])

odinApp.controller('ProjectController', ['$scope', '$routeParams', '$http', '_', function($scope, $routeParams, $http, _) {
  $http.get('/api/projects/' + $routeParams.projectId).then(function(response) {
    $scope.project = response.data.data;
  });

  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });

  $http.get('/api/projects/' + $routeParams.projectId + '/items').then(function(response) {
    $scope.items = response.data.data;
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
      return item.state.id === state.id;
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

odinApp.directive('semanticPopup', function() {
  return {
    link: function(scope, element, attr) {
      element.popup();
    }
  };
})
