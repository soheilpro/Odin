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
    .when('/items/:itemId/edit', {
      templateUrl: '/templates/edit-item',
      controller: 'EditItemController'
    })
    .when('/new-item', {
      templateUrl: '/templates/new-item',
      controller: 'NewItemController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

odinApp.factory('_', function() {
  return window._;
});

odinApp.factory('$', function() {
  return window.$;
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
}])

odinApp.controller('ItemController', ['$scope', '$routeParams', '$http', '_', function($scope, $routeParams, $http, _) {
  $http.get('/api/items/' + $routeParams.itemId).then(function(response) {
    $scope.item = response.data.data;
    $scope.items = $scope.item.subItems;
  });

  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });
}])

odinApp.controller('EditItemController', ['$scope', '$location', '$routeParams', '$http', '$', '_', function($scope, $location, $routeParams, $http, $, _) {
  $http.get('/api/items/' + $routeParams.itemId).then(function(response) {
    var item = response.data.data;

    if (item.tags)
      item.tags = item.tags.join(' ');

    if (item.assignedUsers && item.assignedUsers.length > 0)
      item.assignedUser = item.assignedUsers[0];

    if (!item.prerequisiteItems)
      item.prerequisiteItems = [];

    if (!item.subItems)
      item.subItems = [];

    $scope.item = item;
  });

  $http.get('/api/projects').then(function(response) {
    $scope.projects = response.data.data;
  });

  $http.get('/api/items').then(function(response) {
    $scope.items = response.data.data;
  });

  $http.get('/api/users').then(function(response) {
    $scope.users = response.data.data;
  });

  $scope.addPrerequisiteItem = function(itemId) {
    $http.get('/api/items/' + itemId).then(function(response) {
      $scope.item.prerequisiteItems.push(response.data.data);
    });
  };

  $scope.removePrerequisiteItem = function(prerequisiteItem) {
    $scope.item.prerequisiteItems = _.reject($scope.item.prerequisiteItems, function(item) {
      return item.id === prerequisiteItem.id;
    });
  };

  $scope.addSubItem = function(itemId) {
    $http.get('/api/items/' + itemId).then(function(response) {
      $scope.item.subItems.push(response.data.data);
    });
  };

  $scope.removeSubItem = function(subItem) {
    $scope.item.subItems = _.reject($scope.item.subItems, function(item) {
      return item.id === subItem.id;
    });
  };

  $scope.save = function(item) {
    $scope.isSaving = true;

    var data = {
      title: item.title,
      description: item.description,
      tags: item.tags,
      project_id: item.project.id,
      prerequisite_item_ids: _.pluck(item.prerequisiteItems, 'id').join(),
      sub_item_ids: _.pluck(item.subItems, 'id').join(),
      assigned_user_ids: item.assignedUser ? item.assignedUser.id : ''
    };

    $http.patch('/api/items/' + item.id, data).then(function(response) {
      $location.path('/items/' + response.data.data.id);
    });
  }
}])

odinApp.controller('NewItemController', ['$scope', '$location', '$http', '$', '_', function($scope, $location, $http, $, _) {
  $scope.item = {
    prerequisiteItems: [],
    subItems: []
  };

  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });

  $http.get('/api/projects').then(function(response) {
    $scope.projects = response.data.data;
  });

  $http.get('/api/items').then(function(response) {
    $scope.items = response.data.data;
  });

  $http.get('/api/users').then(function(response) {
    $scope.users = response.data.data;
  });

  $scope.addPrerequisiteItem = function(itemId) {
    $http.get('/api/items/' + itemId).then(function(response) {
      $scope.item.prerequisiteItems.push(response.data.data);
    });
  };

  $scope.removePrerequisiteItem = function(prerequisiteItem) {
    $scope.item.prerequisiteItems = _.reject($scope.item.prerequisiteItems, function(item) {
      return item.id === prerequisiteItem.id;
    });
  };

  $scope.addSubItem = function(itemId) {
    $http.get('/api/items/' + itemId).then(function(response) {
      $scope.item.subItems.push(response.data.data);
    });
  };

  $scope.removeSubItem = function(subItem) {
    $scope.item.subItems = _.reject($scope.item.subItems, function(item) {
      return item.id === subItem.id;
    });
  };

  $scope.save = function(item) {
    $scope.isSaving = true;

    var data = {
      title: item.title,
      description: item.description,
      tags: item.tags,
      state_id: $scope.states[0].id,
      project_id: item.project.id,
      prerequisite_item_ids: _.pluck(item.prerequisiteItems, 'id').join(),
      sub_item_ids: _.pluck(item.subItems, 'id').join(),
      assigned_user_ids: item.assignedUser ? item.assignedUser.id : ''
    };

    $http.post('/api/items/', data).then(function(response) {
      $location.path('/items/' + response.data.data.id);
    });
  }
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
    require: "?ngModel",
    link: function(scope, element, attr, model) {
      element.dropdown({
        fullTextSearch: true,
        onChange: function(value) {
          if (model)
            model.$setViewValue(value);
        }
      });
      element.dropdown('clear');

      setTimeout(function() {
        if (model != null)
          element.dropdown('set selected', model.$modelValue);
      }, 100);
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
