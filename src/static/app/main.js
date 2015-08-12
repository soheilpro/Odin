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

odinApp.controller('MainController', ['$scope', '$http', '$timeout', 'hotkeys', '_', function($scope, $http, $timeout, hotkeys, _) {
  hotkeys.bindTo($scope)
    .add({
      combo: 'n',
      description: 'New issue',
      callback: function() { $scope.newIssue(); }
    })

  $http.get('/api/users').then(function(response) {
    $scope.users = _.sortBy(response.data.data, 'name');
    $scope.usersNames = _.pluck($scope.users, 'name');
  });

  $http.get('/api/projects').then(function(response) {
    $scope.projects = _.sortBy(response.data.data, 'name');
    $scope.projectsNames = _.pluck($scope.projects, 'name');
  });

  $http.get('/api/states').then(function(response) {
    $scope.states = _.sortBy(response.data.data, 'title');
    $scope.statesTitles = _.pluck($scope.states, 'title');
  });

  $http.get('/api/items').then(function(response) {
    var items = response.data.data;

    $scope.issues = _.filter(items, function(item) {
      return item.type === 'issue';
    });

    $scope.milestones = _.sortBy(_.filter(items, function(item) {
      return item.type === 'milestone';
    }), 'title');

    $scope.milestonesTitles = _.pluck($scope.milestones, 'title');

    $scope.milestones.forEach(function(milestone) {
      milestone.subItems.forEach(function(item) {
        var issue = _.find($scope.issues, function(issue) {
          return issue.id === item.id;
        });

        issue.milestone = milestone;
      });
    });
  });

  $scope.newIssue = function() {
    var data = {
      type: 'issue'
    };

    function getCurrent(filter) {
      if (filter.exclude.items.length !== 0 || filter.include.items.length !== 1)
        return null;

      return filter.include.items[0];
    }

    var currentMilestone = getCurrent($scope.filter.milestones);
    var currentProject = getCurrent($scope.filter.projects);
    var currentState = getCurrent($scope.filter.states);
    var currentAssignedUser = getCurrent($scope.filter.assignedUsers);

    if (currentMilestone)
      data.milestone_id = currentMilestone.id;

    if (currentState)
      data.state_id = currentState.id;

    if (currentProject)
      data.project_id = currentProject.id;

    if (currentAssignedUser)
      data.assigned_user_ids = currentAssignedUser.id;

    $http.post('/api/items', data).then(function(response) {
      var item = response.data.data;

      if (currentMilestone)
        item.milestone = $scope.filter.milestones.include.items[0];

      $scope.issues.push(item);

      $timeout(function() {
        angular.element("table.issues tr#issue-" + item.id + " td.title editable *").scope().startEditing();
      });
    });
  }

  $scope.updateItem = function(item, values) {
    var data = {};

    if (values.title !== undefined) {
      item.title = values.title;
      data.title = values.title;
    }

    if (values.projectName !== undefined) {
      var project = _.find($scope.projects, function(project) {
        return project.name.toLowerCase() === values.projectName.toLowerCase();
      });

      item.project = project;
      data.project_id = project ? project.id : '';
    }

    if (values.stateTitle !== undefined) {
      var state = _.find($scope.states, function(state) {
        return state.title.toLowerCase() === values.stateTitle.toLowerCase();
      });

      item.state = state;
      data.state_id = state ? state.id : '';
    }

    if (values.assignedUserName !== undefined) {
      var user = _.find($scope.users, function(user) {
        return user.name.toLowerCase() === values.assignedUserName.toLowerCase();
      });

      item.assignedUsers = [user];
      data.assigned_user_ids = user ? user.id : '';
    }

    if (!_.isEmpty(data))
      $http.patch('/api/items/' + item.id, data);

    if (values.milestoneTitle !== undefined) {
      if (item.milestone) {
        var data = {
          remove_sub_item_ids: item.id
        };

        $http.patch('/api/items/' + item.milestone.id, data);

        item.milestone = null;
      }

      if (values.milestoneTitle) {
        var milestone = _.find($scope.milestones, function(milestone) {
          return milestone.title.toLowerCase() === values.milestoneTitle.toLowerCase();
        });

        item.milestone = milestone;

        var data = {
          add_sub_item_ids: item.id
        };

        $http.patch('/api/items/' + milestone.id, data);
      }
    }
  };

  $scope.filter = new Filter();
}])

odinApp.filter('reverse', function() {
  return function(items) {
    if (!items)
      return items;

    return items.slice().reverse();
  };
});

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
        return item.state && item.state.id === state.id;
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
        return item.state && item.state.id === state.id;
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
        return item.project && item.project.id === project.id;
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
        return item.project && item.project.id === project.id;
      });
    });
  };
}])

odinApp.directive('editable', function() {
  return {
    restrict: 'E',
    scope: {
      ngModel: '=',
      ngDataSource: '=',
      ngSpanStyle: '@',
      ngInputStyle: '@',
      ngChanged: '&'
    },
    require: "?ngModel",
    template: '<div ng-dblclick="startEditing()"><span ng-bind="ngModel" style="{{ngSpanStyle}}"></span><input ng-model="ngModel" ng-blur="endEditing()" style="{{ngInputStyle}}"></input></div>',
    link: function($scope, element, attrs, ngModel) {
      $scope.startEditing = function() {
        var divElement = angular.element(element.children()[0]);
        var inputElement = angular.element(divElement.children()[1]);

        inputElement.bind('keydown keypress', function(event) {
          if (event.which === 27) {
            ngModel.$setViewValue($scope.originalValue);
            $scope.endEditing();
            return;
          }

          if (event.which === 13) {
            if ($scope.focused)
              return;

            $scope.endEditing();
            return;
          }
        });

        $scope.originalValue = ngModel.$viewValue;
        $scope.focused = false;

        element.addClass('editing');
        inputElement.select();
        inputElement.focus();

        if ($scope.ngDataSource) {
          inputElement.autocomplete({
            source: $scope.ngDataSource,
            delay: 0,
            minLength: 0,
            focus: function(event, ui) {
              $scope.focused = true;
            },
            select: function(event, ui) {
              ngModel.$setViewValue(ui.item.value);
              $scope.endEditing();
            }
          }).autocomplete('search', '');
        }
      };

      $scope.endEditing = function() {
        element.removeClass('editing');

        if ($scope.originalValue === ngModel.$viewValue)
          return;

        $scope.ngChanged();

        // To prevent further events from being fired
        $scope.originalValue = ngModel.$viewValue;
      };
    }
  };
});

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
