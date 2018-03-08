const http = require('http'), fs = require('fs'), url = require("url"), path = require("path");

const hostname = '127.0.0.1';
const port = 3000;

const manipulatedImageFilename = "out.png";

const server = http.createServer((req, res) => {
  if(req.method == "POST"){
    handleTesseractPostCall(req, res);
  } else {
    loadIndexHTML(req, res);
    loadResources(req, res, "css");
    loadResources(req, res, "js");
  }
  return;
});

function handleTesseractPostCall(req, res){
  var json = "";
  
  req.on("data", function(data){
    json += data;
  });
  
  req.on("end", function(){
    try {
      console.log("JSON data sucessfully extracted.");
      var obj = JSON.parse(json);
      saveBase64ToPng(obj.base64);
      console.log(manipulatedImageFilename);
      console.log(obj.imgURL);
    } 
    catch(e) {
      console.log("Invalid JSON input detected, aborting request");
      console.log(e);
    }
  });
}

function loadIndexHTML(req, res){
  console.log(req.url);
  if(req.url == "/"){
    fs.readFile('index.html', function(err, file) {  
        if(err) {  
            console.log(err); 
            return;  
        }  
        res.writeHead(200, { 'Content-Type': 'text/html' });  
        res.end(file, "utf-8");  
    });
  }
}

function loadResources(req, res, type){
  if(req.url.endsWith("." + type)){
  var filepath = url.parse(req.url).pathname;   
    fs.readFile(__dirname + filepath, function (err, file) {
      if (err) console.log(err);
      if(type == "js") type = "javascript";
      res.writeHead(200, {'Content-Type': 'text/' + type});
      res.write(file);
      res.end(); 
    });
  }
}

function saveBase64ToPng(base64){
  base64 = base64.replace(/^data:image\/png;base64,/, "");
  
  fs.writeFile(manipulatedImageFilename, base64, 'base64', function(err) {
    if(err == null) {
      console.log("Images successfully saved as " + manipulatedImageFilename);
    } else {
      console.log(err);
    }
  });
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});