const http = require('http'), fs = require('fs'), url = require("url"), path = require("path");
const { exec } = require('child_process');

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
      var filename = obj.name + ".png";
      saveBase64ToPng(obj.base64, filename);
      if(obj.name != null && obj.name.length > 0)
        runTesseractOCR(filename, res);
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

function saveBase64ToPng(base64, filename){
  base64 = base64.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(filename, base64, 'base64', function(err) {
    if(err == null) {
      console.log("Images successfully saved as: " + filename);
    } else {
      console.log(err);
    }
  });
}

function runTesseractOCR(filename, res){
  var command = "tesseract " + filename + " stdout --oem 1 --psm 12 -l eng";
  exec(command, (err, stdout, stderr) => {
    if(err){
      console.log("Node.JS was unable to execute the command:");
      console.log(command);
      cosnole.log(err);
    }
    res.write(stdout);
    res.end();
  });
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});