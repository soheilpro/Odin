var mongodb = require('mongodb');
var _ = require('underscore');

var _db;

function DB() {
}

DB.prototype.getUsers = function(callback) {
  this.find('users', null, null, null, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var users = _.map(result, documentToUser);
    callback(null, users);
  });
};

DB.prototype.getUserById = function(userId, callback) {
  this.findOne('users', {_id: mongodb.ObjectId(userId)}, null, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var user = documentToUser(result);
    callback(null, user);
  });
};

DB.prototype.getStates = function(callback) {
  this.find('states', null, null, null, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var states = _.map(result, documentToState);
    callback(null, states);
  });
};

DB.prototype.getStateById = function(stateId, callback) {
  this.findOne('states', {_id: mongodb.ObjectId(stateId)}, null, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var state = documentToState(result);
    callback(null, state);
  });
};

DB.prototype.getProjects = function(callback) {
  this.find('projects', null, null, null, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var projects = _.map(result, documentToProject);
    callback(null, projects);
  });
};

DB.prototype.getProjectById = function(projectId, callback) {
  this.findOne('projects', {_id: mongodb.ObjectId(projectId)}, null, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var project = documentToProject(result);
    callback(null, project);
  });
};

DB.prototype.getItems = function(callback) {
  this.find('items', null, null, null, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var items = _.map(result, documentToItem);
    callback(null, items);
  });
};

DB.prototype.getItemById = function(itemId, callback) {
  this.findOne('items', {_id: mongodb.ObjectId(itemId)}, null, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var item = documentToItem(result);
    callback(null, item);
  });
};

DB.prototype.saveItem = function(item, callback) {
  var document = itemToDocument(item);

  this.findAndModify('items', {_id: document._id}, document, {upsert: true, new: true}, function(error, result) {
    if (error) {
      callback(error);
      return;
    }

    var item = documentToItem(result.value);
    callback(null, item);
  });
};

DB.prototype.opendb = function(callback) {
  if (_db) {
    callback(null, _db);
    return;
  }

  mongodb.MongoClient.connect("mongodb://localhost:27017/odin", function(error, db) {
    if (error) {
      callback(error);
      return;
    }

    _db = db;

    callback(null, db);
  });
}

DB.prototype.collection = function(collectionName, callback) {
  this.opendb(function(error, db) {
    if (error) {
      callback(error);
      return;
    }

    db.collection(collectionName, function(error, collection) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, collection, function() {});
    });
  });
}

DB.prototype.insert = function(collectionName, document, callback) {
  this.collection(collectionName, function(error, collection, finalizer) {
    if (error) {
      callback(error);
      return;
    }

    collection.insert(document, function(error) {
      finalizer();

      if (callback)
        callback(error);
    });
  });
}

DB.prototype.update = function(collectionName, query, document, options, callback) {
  this.collection(collectionName, function(error, collection, finalizer) {
    if (error) {
      callback(error);
      return;
    }

    collection.update(query, document, options, function(error, result) {
      finalizer();

      if (callback)
        callback(error, result);
    });
  });
}

DB.prototype.findAndModify = function(collectionName, query, document, options, callback) {
  this.collection(collectionName, function(error, collection, finalizer) {
    if (error) {
      callback(error);
      return;
    }

    collection.findAndModify(query, [], document, options, function(error, result) {
      finalizer();
      callback(error, result);
    });
  });
}

DB.prototype.remove = function(collectionName, query, callback) {
  this.collection(collectionName, function(error, collection, finalizer) {
    if (error) {
      callback(error);
      return;
    }

    collection.remove(query, function(error) {
      finalizer();

      if (callback)
        callback(error);
    });
  });
}

DB.prototype.find = function(collectionName, query, fields, options, callback) {
  this.collection(collectionName, function(error, collection, finalizer) {
    if (error) {
      callback(error);
      return;
    }

    collection.find(query, fields || {}, options).toArray(function(error, result) {
      finalizer();
      callback(error, result);
    });
  });
}


DB.prototype.findOne = function(collectionName, query, fields, callback) {
  this.collection(collectionName, function(error, collection, finalizer) {
    if (error) {
      callback(error);
      return;
    }

    collection.findOne(query, fields || {}, function(error, result) {
      finalizer();
      callback(error, result);
    });
  });
}

DB.prototype.count = function(collectionName, query, callback) {
  this.collection(collectionName, function(error, collection, finalizer) {
    if (error) {
      callback(error);
      return;
    }

    collection.count(query, function(error, count) {
      finalizer();
      callback(error, count);
    });
  });
}

DB.prototype.group = function(collectionName, keys, condition, initial, reduce, callback) {
  this.collection(collectionName, function(error, collection, finalizer) {
    if (error) {
      callback(error);
      return;
    }

    collection.group(keys, condition, initial, reduce, null, true, {}, function(error, result) {
      finalizer();
      callback(error, result);
    });
  });
}

module.exports = DB;

function documentToUser(document) {
  return {
    id: document._id.toString(),
    name: document.name
  };
}

function documentToState(document) {
  return {
    id: document._id.toString(),
    title: document.title,
    type: document.type,
    color: document.color
  };
}

function documentToProject(document) {
  return {
    id: document._id.toString(),
    name: document.name,
    group: document.group
  };
}

function documentToItem(document) {
  return {
    id: document._id.toString(),
    title: document.title,
    type: document.type,
    state: fromRef(document.state),
    project: fromRef(document.project),
    subItems: fromRefArray(document.subItems),
    prerequisiteItems: fromRefArray(document.prerequisiteItems),
    assignedUsers: fromRefArray(document.assignedUsers)
  };
}

function itemToDocument(item) {
  return {
    _id: mongodb.ObjectId(item.id),
    title: item.title,
    type: item.type,
    state: toRef(item.state),
    project: toRef(item.project),
    subItems: toRefArray(item.subItems),
    prerequisiteItems: toRefArray(item.prerequisiteItems),
    assignedUsers: toRefArray(item.assignedUsers),
  };
}

function toRef(entity) {
  if (!entity)
    return undefined;

  return {
    _id: mongodb.ObjectId(entity.id),
  };
}

function toRefArray(entity) {
  if (!entity)
    return undefined;

  var result = _.map(entity, toRef);

  if (result.length === 0)
    return undefined;

  return result;
}

function fromRef(document) {
  if (!document)
    return undefined;

  return {
    id: document._id.toString()
  };
}

function fromRefArray(document) {
  if (!document)
    return undefined;

  var result = _.map(document, fromRef);

  if (result.length === 0)
    return undefined;

  return result;
}