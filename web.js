var express = require('express');

var app = express.createServer(express.logger());
var fs =  require('fs');

app.get('/', function(request, response) {
//  response.send('Hello World from Saravanan Chinnappa!');
	fs.readFile('index.html', function (err, data) {
  	if (err) throw err;
  	//console.log(data);
	response.send(new Buffer(data).toString());
	});

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
