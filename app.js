const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const router = require('./router');
const config = require('./config');
const hbs = require('hbs');
const less = require('less');
const fs = require('fs');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(less(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);

app.set('views', path.join(config.server.approot, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper('ID', function (field) {
  return field.replace(' ','-');
});

app.set('port', config.server.port);

fs.readFile(path.join(__dirname, 'public/main.less'),function (readError, data) {
  if (readError) {
    console.error('Error reading main.less');
    console.error(readError);
    return;
  }
  let options = {compress:true, paths:[__dirname]};
  less.render(data.toString(), options, function(renderError,output){
     if (renderError) {
        console.error('Error rendering main.less');
        console.error(readError);
        return;
     }
     fs.writeFile(path.join(__dirname, 'public/main.css'),output.css, function() {
       console.log('Rendered main.css');
     });
  });
});

let server = http.createServer(app);
server.listen(config.server.port);

server.on('listening', function() {
  var addr = server.address();
  var binding = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + binding);
  console.log('Environment is ' + app.get('env'));
});

server.on('error', function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(config.server.port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(config.server.port  + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = app;
