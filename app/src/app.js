// Load express module with `require` directive
var express = require('express')
var path = require('path');

var app = express()
app.use('/assets',  express.static(path.join(__dirname, 'views/assets')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// Define request response in root URL (/)
app.get('/api', function (req, res) {
  res.send('Hello World')
})

app.get('/', function (req, res) {
  res.render('index', { title: 'LiDOP', message: 'Hello LiDOP!'});
});

// Launch listening server on port 80
var server = app.listen(80, function () {
  console.log('App listening on port 80!')
})

// Handle Ctrl+C
process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  server.close();
});
