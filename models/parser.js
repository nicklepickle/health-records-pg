const fs = require('fs');
const path = require('path');
const less = require('less');
const config = require('../config');

module.exports = {
  parseLess: function(library) {
    var lessPath = path.join(config.server.approot, 'public/css/'+library+'.less');
    var cssPath = path.join(config.server.approot, 'public/css/'+library+'.css');
    var root = path.join(config.server.approot, 'public/css/');

    fs.readFile(lessPath,function (readError, data) {
      if (readError) {
        console.error('Error reading '+ lessPath);
        console.error(readError);
        return;
      }
      let options = {compress:true, filename:lessPath, paths:[root]};
      less.render(data.toString(), options, function(renderError,output){
         if (renderError) {
            console.error('Error rendering '+lessPath);
            console.error(renderError);
            return;
         }
         fs.writeFile(cssPath, output.css, function() {
           console.log('Rendered ' + library + '.less');
         });
      });
    });
  }
};
