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






// export the module
module.exports = helpers