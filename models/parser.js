const fs = require('fs');
const path = require('path');
const less = require('less');
const config = require('../config');

module.exports = {
  parseLess: function(library) {
    const root = path.join(config.server.approot, 'public/css/');
    const lessPath = path.join(root, library+'.less');
    const cssPath = path.join(root, library+'.css');

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
