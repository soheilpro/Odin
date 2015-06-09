var odinApp = angular.module('odinApp', ['ngRoute', 'cfp.hotkeys']);

odinApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: '/templates/main',
      controller: 'MainController'
    })
    .otherwise({
      redirectTo: '/'
    });
  }]
);

odinApp.factory('_', function() {
  return window._;
});

odinApp.factory('$', function() {
  return window.$;
});

odinApp.controller('MainController', ['$scope', '$http', '_', function($scope, $http, _) {
  $http.get('/api/users').then(function(response) {
    $scope.users = response.data.data;
  });

  $http.get('/api/projects').then(function(response) {
    $scope.projects = response.data.data;
  });

  $http.get('/api/states').then(function(response) {
    $scope.states = response.data.data;
  });

  $http.get('/api/items').then(function(response) {
    $scope.issues = _.filter(response.data.data, function(item) {
      return item.type === 'issue';
    });

    $scope.milestones = _.filter(response.data.data, function(item) {
      return item.type === 'milestone';
    });

    $scope.milestones.forEach(function(milestone) {
      milestone.subItems.forEach(function(item) {
        var issue = _.find($scope.issues, function(issue) {
          return issue.id === item.id;
        });

        issue.milestone = milestone;
      });
    });
  });

  $scope.filter = new Filter();
}])

odinApp.filter('includeMilestones', ['_', function(_) {
  return function(items, milestones) {
    if (milestones.length === 0)
      return items;

    return _.filter(items, function(item) {
      return _.some(milestones, function(milestone) {
        return item.milestone && item.milestone.id === milestone.id;
      });
    });
  };
}])

odinApp.filter('excludeMilestones', ['_', function(_) {
  return function(items, milestones) {
    if (milestones.length === 0)
      return items;

    return _.filter(items, function(item) {
      return !_.some(milestones, function(milestone) {
        return item.milestone && item.milestone.id === milestone.id;
      });
    });
  };
}])

odinApp.filter('includeStates', ['_', function(_) {
  return function(items, states) {
    if (states.length === 0)
      return items;

    return _.filter(items, function(item) {
      return _.some(states, function(state) {
        return item.state.id === state.id;
      });
    });
  };
}])

odinApp.filter('excludeStates', ['_', function(_) {
  return function(items, states) {
    if (states.length === 0)
      return items;

    return _.filter(items, function(item) {
      return !_.some(states, function(state) {
        return item.state.id === state.id;
      });
    });
  };
}])

odinApp.filter('includeAssignedUsers', ['_', function(_) {
  return function(items, users) {
    if (users.length === 0)
      return items;

    return _.filter(items, function(item) {
      return _.some(item.assignedUsers, function(itemAssignedUser) {
        return _.some(users, function(user) {
          return itemAssignedUser.id === user.id;
        });
      });
    });
  };
}])

odinApp.filter('excludeAssignedUsers', ['_', function(_) {
  return function(items, users) {
    if (users.length === 0)
      return items;

    return _.filter(items, function(item) {
      return !_.some(item.assignedUsers, function(itemAssignedUser) {
        return _.some(users, function(user) {
          return itemAssignedUser.id === user.id;
        });
      });
    });
  };
}])

odinApp.filter('includeProjects', ['_', function(_) {
  return function(items, projects) {
    if (projects.length === 0)
      return items;

    return _.filter(items, function(item) {
      return _.some(projects, function(project) {
        return item.project.id === project.id;
      });
    });
  };
}])

odinApp.filter('excludeProjects', ['_', function(_) {
  return function(items, projects) {
    if (projects.length === 0)
      return items;

    return _.filter(items, function(item) {
      return !_.some(projects, function(project) {
        return item.project.id === project.id;
      });
    });
  };
}])

function Filter() {
  var idComparer = function(item1, item2) {
    return item1.id === item2.id;
  };

  this.milestones = new DualSet(idComparer);
  this.states = new DualSet(idComparer);
  this.assignedUsers = new DualSet(idComparer);
  this.projects = new DualSet(idComparer);
}

Filter.prototype.clear = function() {
  this.milestones.clear();
  this.states.clear();
  this.assignedUsers.clear();
  this.projects.clear();
};

function DualSet(comparer) {
  this.include = new Set(comparer);
  this.exclude = new Set(comparer);
  var _this = this;

  this.include.add = function(item) {
    Set.prototype.add.call(_this.include, item);
    _this.exclude.remove(item);
  }

  this.exclude.add = function(item) {
    Set.prototype.add.call(_this.exclude, item);
    _this.include.remove(item);
  }
}

DualSet.prototype.clear = function() {
  this.include.clear();
  this.exclude.clear();
};

function Set(comparer) {
  this.items = [];
  this.comparer = comparer;
}

Set.prototype.clear = function() {
  this.items = [];
};

Set.prototype.set = function(item) {
  this.items = [item];
};

Set.prototype.setAll = function(items) {
  this.items = items;
};

Set.prototype.add = function(item) {
  if (!this.has(item))
    this.items.push(item);
};

Set.prototype.remove = function(item) {
  var _this = this;

  this.items = _.reject(this.items, function(_item) {
    return _this.comparer(_item, item);
  });
};

Set.prototype.toggle = function(item, state) {
  if (state)
    this.add(item);
  else
    this.remove(item);
};

Set.prototype.has = function(item) {
  var _this = this;

  return _.some(this.items, function(_item) {
    return _this.comparer(_item, item);
  });
};
