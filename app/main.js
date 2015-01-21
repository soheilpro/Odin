var odinApp = angular.module('odinApp', ['ngRoute']);

odinApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: '/templates/overview',
      controller: 'OverviewController'
    })
    .when('/users', {
      templateUrl: '/templates/users',
      controller: 'UsersController'
    })
    .when('/users/:userId', {
      templateUrl: '/templates/user',
      controller: 'UserController'
    })
    .when('/projects', {
      templateUrl: '/templates/projects',
      controller: 'ProjectsController'
    })
    .when('/projects/:projectId', {
      templateUrl: '/templates/project',
      controller: 'ProjectController'
    })
    .when('/items/:itemId', {
      templateUrl: '/templates/item',
      controller: 'ItemController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

odinApp.factory('_', function() {
  return window._;
});

odinApp.controller('OverviewController', ['$scope', '$http', '_', function($scope, $http, _) {
  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });

  $http.get('/api/items').then(function(response) {
    $scope.items = response.data.data;
  });
}])

odinApp.controller('UsersController', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/users').then(function(response) {
    $scope.users = response.data.data;
  });
}])

odinApp.controller('UserController', ['$scope', '$routeParams', '$http', '_', function($scope, $routeParams, $http, _) {
  $http.get('/api/users/' + $routeParams.userId).then(function(response) {
    $scope.user = response.data.data;
  });

  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });

  $http.get('/api/users/' + $routeParams.userId + '/items').then(function(response) {
    $scope.items = response.data.data;
  });
}])

odinApp.controller('ProjectsController', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/projects').then(function(response) {
    $scope.projects = response.data.data;
    $scope.groups = _.chain($scope.projects)
      .map(function(project) { return project.group || '' })
      .uniq()
      .sort()
      .value();
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

odinApp.controller('ItemController', ['$scope', '$routeParams', '$http', '_', function($scope, $routeParams, $http, _) {
  $http.get('/api/items/' + $routeParams.itemId).then(function(response) {
    $scope.item = response.data.data;
    $scope.items = $scope.item.subItems;
  });

  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
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

odinApp.filter('group', ['_', function(_) {
  return function(projects, group) {
    return _.filter(projects, function(project) {
      return project.group === group;
    });
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
