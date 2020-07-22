const http = require('http')
const Url = require('url')
const Server = http.createServer((req, res) => {
    const path = Url.parse(req.url).pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '').toLowerCase()
    if(trimmedPath == 'hello') res.end('Welcome to my first assignment!!')
})
Server.listen(3000, () => console.log('Server Listenening in port 3000'))