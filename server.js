var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    port = 8080;

/* Global variables */
var listingData, server;

var requestHandler = function(request, response) {
  var parsedUrl = url.parse(request.url);
  // Return the directory data at the /listings URL for a GET request
  if (parsedUrl.pathname == '/listings' && request.method == 'GET') {
    // Automatically sends a 200 status code
    response.end(listingsData);
  }
  // Otherwise return a 404 error
  response.writeHead(404);
  response.end('Bad gateway error');
};

// Create the server
server = http.createServer(requestHandler);

// Open the listings file and start the server
fs.readFile('listings.json', 'utf8', function(err, data) {
  if (err) {
    console.log("Error opening listings.json: "+err);
    return;
  }
  listingsData = data;
  // the server is now started, listening for requests on port 8080
  server.listen(port, function() {
    // Once the server is listening, this callback function is executed
    console.log('Server listening on: http://127.0.0.1:' + port);
  });
});
