var environments = {}

// Staging
environments.staging = {
    httpPort: 5000,
    httpsPort: 5001,
    hashingSecret: 'thisisasecret',
    envName: 'staging'
}

// Production
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production'
}

var currentEnvironment = typeof(process.env.NODE_ENV) != 'undefined' ? process.env.NODE_ENV.toLowerCase() : ''

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport

