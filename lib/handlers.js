//request handlers

// dependencies
const _data = require("./data");
const helpers = require("./helpers");

// Handlers
const handlers = {};

// define the handlers
handlers.ping = (data, callback) => {
  // Callback a http status code, and payload object
  callback(200);
};

handlers.notFound = (data, callback) => {
  callback(404);
};

// users
handlers.users = (data, callback) => {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// container for the users submethods
handlers._users = {};

// Users - post
// required data: firstname, lastname, phone, password, tosAgreement
// optional data: none
handlers._users.post = (data, callback) => {
  //check that all required fields are filled out
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make that the user doesnt already exist
    _data.read("users", phone, (err, data) => {
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
            tosAgreement: true,
          };

          // store the user
          _data.create("users", phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: "could not create the new user" });
            }
          });
        } else {
          callback(500, { Error: "could not hash the password" });
        }
      } else {
        // User already exist
        callback(400, { Error: "A user with that phone number already exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Users - get
// required data: phone
// optional data: none
handlers._users.get = (data, callback) => {
  // check that the phone number is valid
  var phone =
    typeof data.query.phone == "string" && data.query.phone.trim().length == 10
      ? data.query.phone.trim()
      : false;

  if (phone) {
    // get the token from the headers
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // verify that the given token is valid
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // lookup the user
        _data.read("users", phone, (err, data) => {
          if (!err && data) {
            // remove the hashed password from the user object before returning it to the request
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "missing required field" });
  }
};

// Users - put
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
  // check for the required fileds
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;

  // check for the opcional fields
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if the phone is invalid
  if (phone) {
    if (firstName || lastName || password) {
      // get the token from the headers
      var token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      // verify that the given token is valid
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // lookup the user
          _data.read("users", phone, (err, userData) => {
            if (!err && userData) {
              // update the fields necessary
              if (firstName) {
                userData.firstName = firstName;
              }

              if (lastName) {
                userData.lastName = lastName;
              }

              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              // store the new updates
              _data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, { Error: "could not update the user" });
                }
              });
            } else {
              callback(400, { Error: "the specified user does not exist" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header, or token is invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Users - delete
// required data: phone
// TODO Cleanup (delete) any other data fiels associated with this user
handlers._users.delete = (data, callback) => {
  // check that the phone number is valid
  var phone =
    typeof data.query.phone == "string" && data.query.phone.trim().length == 10
      ? data.query.phone.trim()
      : false;

  if (phone) {
    // get the token from the headers
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // verify that the given token is valid
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // lookup the user
        _data.read("users", phone, (err, data) => {
          if (!err && data) {
            _data.delete("users", phone, (err) => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: "Could not delete the specified user" });
              }
            });
          } else {
            callback(400, { Error: "Could not find the specified user" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "missing required field" });
  }
};

// Tokens
handlers.tokens = (data, callback) => {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// container for all methods
handlers._tokens = {};

// Tokens - post
// required data: phone, password
// optional data: none
handlers._tokens.post = (data, callback) => {
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone && password) {
    // lookup for user with that phone number.
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        // Hash the send password, and compare with the password in user store
        var hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          //If valid, create a new token with a random name. Set expiration to 1 hour
          var tokenId = helpers.createRandomString(20);

          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            phone,
            id: tokenId,
            expires,
          };

          // Store the token
          _data.create("tokens", tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: "Could not create the new token" });
            }
          });
        } else {
          callback(400, {
            Error:
              "Password did not match the specified user's stored password",
          });
        }
      } else {
        callback(400, { Error: "Could not find the specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing error fields" });
  }
};

// Tokens - get
// Required data: id
// optional data: none
handlers._tokens.get = (data, callback) => {
  // Check that the id is valid
  var id =
    typeof data.query.id == "string" && data.query.id.trim().length == 20
      ? data.query.id.trim()
      : false;

  if (id) {
    // lookup the user
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "missing required field" });
  }
};

// Tokens - put
// required data: id, extend
// optional data: none
handlers._tokens.put = (data, callback) => {
  var id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  var extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;

  if (id && extend) {
    //lookup the token
    _data.read("tokens", id, (error, tokenData) => {
      if (!error && tokenData) {
        // check to make sure that the token is not already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // store the new updates
          _data.update("tokens", id, tokenData, (error) => {
            if (!error) {
              callback(200);
            } else {
              callback(500, {
                Error: "could not update the token's expiration",
              });
            }
          });
        } else {
          callback(400, {
            Error: "The token as already expired, and cannot be extended",
          });
        }
      } else {
        callback(400, { Error: "Specified token does not exist" });
      }
    });
  } else {
    callback(400, {
      Error: "Missing required field(s) or field(s) are invalid",
    });
  }
};

// Tokens - delete
// Required data: id
// optional data: none
handlers._tokens.delete = (data, callback) => {
  // check that the phone number is valid
  var id =
    typeof data.query.id == "string" && data.query.id.trim().length == 20
      ? data.query.id.trim()
      : false;

  if (id) {
    // lookup the token
    _data.read("tokens", id, (err, data) => {
      if (!err && data) {
        _data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the specified token" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token" });
      }
    });
  } else {
    callback(400, { Error: "missing required field" });
  }
};

// verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // lookup the token
  _data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      // check that the token is for the given user and is not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handlers;
