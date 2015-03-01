var odinApp = angular.module('odinApp', ['ngRoute', 'cfp.hotkeys']);

odinApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: '/templates/overview',
      controller: 'OverviewController'
    })
    .when('/tasks', {
      templateUrl: '/templates/tasks',
      controller: 'TasksController'
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

odinApp.controller('MenuController', ['$scope', '$location', 'hotkeys', function($scope, $location, hotkeys) {
  hotkeys.bindTo($scope).add({
    combo: 'ctrl+h',
    description: 'Home',
    callback: function() {
      $location.path('/');
    }
  })

  hotkeys.bindTo($scope).add({
    combo: 'ctrl+p',
    description: 'Projects',
    callback: function() {
      $location.path('/projects');
    }
  })

  hotkeys.bindTo($scope).add({
    combo: 'ctrl+u',
    description: 'Users',
    callback: function() {
      $location.path('/users');
    }
  })

  hotkeys.bindTo($scope).add({
    combo: 'ctrl+n',
    description: 'Add new item',
    callback: function() {
      $location.path('/new-item');
    }
  })
}])

odinApp.controller('OverviewController', ['$scope', '$http', '_', function($scope, $http, _) {
  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });

  $http.get('/api/items').then(function(response) {
    $scope.items = response.data.data;
  });
}])

odinApp.controller('TasksController', ['$scope', '$http', '_', function($scope, $http, _) {
  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });

  $http.get('/api/tasks').then(function(response) {
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

odinApp.controller('ItemController', ['$scope', '$routeParams', '$location', '$http', 'hotkeys', '_', function($scope, $routeParams, $location, $http, hotkeys, _) {
  hotkeys.bindTo($scope).add({
    combo: 'ctrl+e',
    description: 'Edit item.',
    callback: function() {
      $location.path('/items/' + $routeParams.itemId + '/edit');
    }
  })

  $http.get('/api/users').then(function(response) {
    $scope.users = response.data.data;
  });

  $http.get('/api/items/' + $routeParams.itemId).then(function(response) {
    var item = response.data.data;
    $scope.item = item;
    $scope.items = item.subItems;

    if (item.assignedUsers && item.assignedUsers.length > 0)
      item.assignedUser = item.assignedUsers[0];
  });

  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });

  $scope.saveState = function() {
    var data = {
      state_id: $scope.item.state.id,
    };

    $http.patch('/api/items/' + $scope.item.id, data).then(function(response) {
    });
  };

  $scope.saveAssignedUser = function() {
    var data = {
      assigned_user_ids: $scope.item.assignedUser ? $scope.item.assignedUser.id : ''
    };

    $http.patch('/api/items/' + $scope.item.id, data).then(function(response) {
    });
  };
}])

odinApp.controller('EditItemController', ['$scope', '$location', '$routeParams', '$http', 'hotkeys', '$', '_', function($scope, $location, $routeParams, $http, hotkeys, $, _) {
  $http.get('/api/items/' + $routeParams.itemId).then(function(response) {
    var item = response.data.data;

    if (item.tags)
      item.tags = item.tags.join(' ');

    if (!item.prerequisiteItems)
      item.prerequisiteItems = [];

    if (!item.subItems)
      item.subItems = [];

    if (!item.links)
      item.links = [];

    $scope.item = item;
  });

  $http.get('/api/projects').then(function(response) {
    $scope.projects = response.data.data;
  });

  $http.get('/api/items').then(function(response) {
    $scope.items = response.data.data;
  });

  $scope.addPrerequisiteItem = function(itemId) {
    $http.get('/api/items/' + itemId).then(function(response) {
      $scope.item.prerequisiteItems.push(response.data.data);
    });
  };

  $scope.removePrerequisiteItem = function(itemIndex) {
    $scope.item.prerequisiteItems.splice(itemIndex, 1);
  };

  $scope.addSubItem = function(itemId) {
    $http.get('/api/items/' + itemId).then(function(response) {
      $scope.item.subItems.push(response.data.data);
    });
  };

  $scope.removeSubItem = function(itemIndex) {
    $scope.item.subItems.splice(itemIndex, 1);
  };

  $scope.addLink = function(url) {
    $scope.item.links.push({
      url: url
    });
  };

  $scope.removeLink = function(linkIndex) {
    $scope.item.links.splice(linkIndex, 1);
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
      links: _.pluck(item.links, 'url').join()
    };

    $http.patch('/api/items/' + item.id, data).then(function(response) {
      $location.path('/items/' + response.data.data.id);
    });
  }
}])

odinApp.controller('NewItemController', ['$scope', '$location', '$http', 'hotkeys', '$', '_', function($scope, $location, $http, hotkeys, $, _) {
  $scope.item = {
    prerequisiteItems: [],
    subItems: [],
    links: []
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

  $scope.addPrerequisiteItem = function(itemId) {
    $http.get('/api/items/' + itemId).then(function(response) {
      $scope.item.prerequisiteItems.push(response.data.data);
    });
  };

  $scope.removePrerequisiteItem = function(itemIndex) {
    $scope.item.prerequisiteItems.splice(itemIndex, 1);
  };

  $scope.addSubItem = function(itemId) {
    $http.get('/api/items/' + itemId).then(function(response) {
      $scope.item.subItems.push(response.data.data);
    });
  };

  $scope.removeSubItem = function(itemIndex) {
    $scope.item.subItems.splice(itemIndex, 1);
  };

  $scope.addLink = function(url) {
    $scope.item.links.push({
      url: url
    });
  };

  $scope.removeLink = function(linkIndex) {
    $scope.item.links.splice(itemIndex, 1);
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
      links: _.pluck(item.links, 'url').join()
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

odinApp.filter('title', ['_', function(_) {
  return function(items, term) {
    if (!term)
      return items;

    return _.filter(items, function(item) {
      return item.title.indexOf(term) != -1;
    });
  };
}])

odinApp.filter('project', ['_', function(_) {
  return function(items, project) {
    if (!project)
      return items;

    return _.filter(items, function(item) {
      return item.project.id === project.id;
    });
  };
}])

odinApp.filter('assignedUser', ['_', function(_) {
  return function(items, assignedUser) {
    if (!assignedUser)
      return items;

    return _.filter(items, function(item) {
      return _.some(item.assignedUsers, function(itemAssignedUser) {
        return itemAssignedUser.id === assignedUser.id;
      });
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

odinApp.filter('projects', ['_', function(_) {
  return function(items) {
    return _.chain(items)
      .map(function(item) { return item.project })
      .uniq(function(project) { return project.id })
      .sortBy(function(project) { return project.name })
      .value();
  };
}])

odinApp.filter('assignedUsers', ['_', function(_) {
  return function(items) {
    return _.chain(items)
      .map(function(item) { return item.assignedUsers || [] })
      .flatten()
      .uniq(function(assignedUser) { return assignedUser.id })
      .sortBy(function(assignedUser) { return assignedUser.name })
      .value();
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

odinApp.directive('autofocus', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link : function($scope, $element) {
      $timeout(function() {
        $element[0].focus();
      });
    }
  }
}]);

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

      scope.$watch(attr.ngModel, function(newValue) {
        if (newValue)
          element.dropdown('set selected', newValue);
        else {
          element.dropdown('restore defaults');
          element.dropdown('clear');
        }
      });

      setTimeout(function() {
        if (model && model.$modelValue)
          element.dropdown('set selected', model.$modelValue);
        else {
          element.dropdown('restore defaults');
          element.dropdown('clear');
        }
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
