// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
//----------------------------------- HTTP SERVER -----------------------------------
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)
})

httpServer.listen(config.httpPort, () => {
    console.log('The server is listening in ' + config.httpPort + ' port')
})
//-----------------------------------------------------------------------------------

//----------------------------------- HTTPS SERVER -----------------------------------
const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pe')
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)
})

httpsServer.listen(config.httpsPort, () => {
    console.log('https server')
    console.log('The server is listening in ' + config.httpsPort + ' port')
})
//------------------------------------------------------------------------------------



const unifiedServer = (req, res) => {
    //------------------------URL---------------------------------
    const parsedUrl = url.parse(req.url, true)
    const path = parsedUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '') // remove first and last slash
    //------------------------------------------------------------

    //---------------------HTTP-----------------------------------
    const method = req.method.toLowerCase()
    //------------------------------------------------------------

    //---------------------QUERY string---------------------------
    const queryStringObject = parsedUrl.query
    //------------------------------------------------------------

    //------------------------HEADERS-----------------------------
    const headers = req.headers
    //------------------------------------------------------------

    //----------------------PAYLOAD-------------------------------
    const decoder = new StringDecoder('utf-8')
    var buffer = ''
    req.on('data', data => {
        buffer += decoder.write(data)
    })
    req.on('end', () => {
        buffer += decoder.end()

        // Choose the handler
        const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        // Data to send
        const data = {
            trimmedPath,
            query: queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        }

        // Route the request
        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200
            payload = typeof (payload) == 'object' ? payload : {}
            const payloadString = JSON.stringify(payload)

            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)
        })
        // res.end('path: ' + path + ', method: ' + method + ', query: ' + JSON.stringify(queryStringObject) + ', headers: ' + JSON.stringify(headers))   
        // console.log('payload: ' + buffer)
    })
    //------------------------------------------------------------







    // res.end('path: ' + path + ', method: ' + method + ', query: ' + JSON.stringify(queryStringObject) + ', headers: ' + JSON.stringify(headers))  
}

// Defening request router
const router = {
    'ping': handlers.ping,
    'users': handlers.users
}