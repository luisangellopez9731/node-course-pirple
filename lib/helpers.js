// Helpers for various tasks

// dependencies
const crypto = require('crypto');
const config = require('./config');


// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
}

// parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
}

// Create a string of alphanumeric character of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength) {
    // Define all the posible character that could go into string
    var posibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';

    for(var i = 1; i <= strLength; i++) {
      // Get a random character from the possibleCharacters
      var randomCharacter = posibleCharacters.charAt(Math.floor(Math.random() * posibleCharacters.length))
      //Append this character to the final string
      str += randomCharacter;
    }

    // Return the final string
    return str;
  }else {
    return false;
  }
}






// export the module
module.exports = helpers