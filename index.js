// dependencies
const http = require("http")
const https = require('https')
const url = require("url")
const stringdecode = require("string_decoder").StringDecoder
const config = require('./lib/config')
const fs = require('fs')
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')



// instantiating the http server

const httpServer = http.createServer(
 function(req,res){
   unifiedServer(req,res)
})

// start the server 
httpServer.listen(config.httpPort,function(){
    console.log(`the server is listening on ${config.httpPort} `)
})

// initialize the https server
let httpsServerOptions = {
  key : fs.readFileSync('./https/key.pem'),
  cert :fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions,
  function(req,res){
    unifiedServer(req,res)
 })
// start the https server
httpsServer.listen(config.httpsPort,function(){
  console.log(`the server is listening on ${config.httpsPort} `)
})

// the server logic for both http and https
let unifiedServer = function(req,res){
   // get the url and parse it
   const parsedurl = url.parse(req.url,true)

   // get the path
   const path = parsedurl.pathname;
   const trimmedPath = path.replace(/^\/+|\/+$/g, '');

   //get the query string as an object
   const querystringobj = parsedurl.query;

   //get the http method
   const method = req.method.toLocaleLowerCase()

  

   // get the headers as an object
   const headers = req.headers

   // get payload if any
  const decoder = new stringdecode("utf-8")
  let buffer = ''
  req.on("data",function(data){
   buffer += decoder.write(data)
  }) 
  req.on('end',function(){
    buffer += decoder.end()
 

     // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
     var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
     
     // Construct the data object to send to the handler
     var data = {
         'trimmedPath' : trimmedPath,
         'queryStringObject' : querystringobj,
         'method' : method,
         'headers' : headers,
         'payload' : helpers.parseJsonToObject(buffer)
     };

     //route the request to a handler specified on the router
     chosenHandler(data,function(statusCode,payload){
        // use the status code called back by the handler, or defaulft
         statusCode = typeof(statusCode) === 'number'? statusCode : 200;
        
        // use the payload called by the handler or default to an empty object
        payload = typeof(payload) === 'object'? payload : {};

        //converting the pYLOAD TO A STRING
        let payloadstring = JSON.stringify(payload)

        // return response
        res.setHeader('Content-Type','application/json')
        res.writeHead(statusCode)
        res.end(payloadstring)

         // log response path
         console.log(`returning this response: ${statusCode} ${payloadstring}`); 

      })
  
  })
}



// Define the request router
var router = {
  'ping' : handlers.ping,
 'users':handlers.users
};
