//request handlers



// dependencies
const _data = require('./data');
const helpers = require('./helpers');



// Handlers
const handlers = {}

// define the handlers
handlers.ping = (data, callback) => {
  // Callback a http status code, and payload object
  callback(200)
}

handlers.notFound = (data, callback) => {
  callback(404)

}

// users
handlers.users = (data, callback) => {
  var acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback)
  } else {
    callback(405)
  }
}

// container for the users submethods
handlers._users = {}

// Users - post
// required data: firstname, lastname, phone, password, tosAgreement
// optional data: none
handlers._users.post = (data, callback) => {
  //check that all required fields are filled out
  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make that the user doesnt already exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // hash the password
        var hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // create the user object
          var userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true
          };

          // store the user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'could not create the new user' });
            }
          });
        } else {
          callback(500, { 'Error': 'could not hash the password' });
        }
      } else {
        // User already exist
        callback(400, { 'Error': 'A user with that phone number already exist' });
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required fields' })
  }

}

// Users - get
// required data: phone
// optional data: none
// TODO only let an authenticated user access there object. dont let them access anyone other.
handlers._users.get = (data, callback) => {
  // check that the phone number is valid
  var phone = typeof(data.query.phone) == 'string' && data.query.phone.trim().length == 10? data.query.phone.trim() : false

  if(phone) {
    // lookup the user
    _data.read('users', phone, (err, data) => {
      if(!err && data) {
        // remove the hashed password from the user object before returning it to the request
        delete data.hashedPassword;
        callback(200, data);
      }else {
        callback(404)
      }
    })
  }else {
    callback(400, {'Error': 'missing required field'})
  }
}

// Users - put
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
// TODO Only let an authenticated user update their own object. Don't let them anyone does it.
handlers._users.put = (data, callback) => {
  // check for the required fileds
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10? data.payload.phone.trim() : false

  // check for the opcional fields
  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the phone is invalid
  if(phone) {
    if(firstName || lastName || password) {
      // lookup the user
      _data.read('users', phone, (err, userData) => {
        if(!err && userData) {
          // update the fields necessary
          if(firstName) {
            userData.firstName = firstName
          }

          if(lastName) {
            userData.lastName = lastName
          }

          if(password) {
            userData.hashedPassword = helpers.hash(password)
          }

          // store the new updates
          _data.update('users', phone, userData, (err) => {
            if(!err) {
              callback(200);
            }else {
              callback(500, {'Error': 'could not update the user'});
            }
          })
        }else {
          callback(400, {'Error': 'the specified user does not exist'})
        }
      })
    }else {
      callback(400, {'Error': 'missing fields to update'})
    }
  }else {
    callback(400, {'Error': 'Missing required field'})
  }

}

// Users - delete
// required data: phone
// TODO Only let an authenticated user delete their data.
// TODO Cleanup (delete) any other data fiels associated with this user
handlers._users.delete = (data, callback) => {
  // check that the phone number is valid
  var phone = typeof(data.query.phone) == 'string' && data.query.phone.trim().length == 10? data.query.phone.trim() : false

  if(phone) {
    // lookup the user
    _data.read('users', phone, (err, data) => {
      if(!err && data) {
        _data.delete('users', phone, (err) => {
          if(!err) {
            callback(200)
          }else {
            callback(500, {'Error': 'Could not delete the specified user'})
          }
        })
      }else {
        callback(400, {'Error': 'Could not find the specified user'})
      }
    })
  }else {
    callback(400, {'Error': 'missing required field'})
  }

}

module.exports = handlers