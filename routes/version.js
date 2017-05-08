var express = require("express");
var router = express.Router();

var https = require("https");
var http = require("http");

var request = require("request");

var superagent = require("superagent");
var uuid = require("uuid");
var async = require("async");
var mkdirp = require("mkdirp");
var fs = require("fs");


var config = require("../config.js");


var path = require('path');
 



var username = config.ezid_username;
var password = config.ezid_password;
var bindaas_api_key = config.bindaas_api_key;

var DOI_NAMESPACE = config.DOI_NAMESPACE
var URL_PREFIX = config.URL_PREFIX;


var bindaas_addResourceURL = config.bindaas_addResourceURL;
var bindaas_addVersionURL = config.bindaas_addVersionURL;

var bindaas_getResourcesForDoi = config.bindaas_getResourcesForDoi;

var UPLOAD_PATH = config.UPLOAD_PATH;


fs.mkdirParent = function(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, callback);
      //And then the directory
      fs.mkdirParent(dirPath, mode, callback);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
};



router.get("/createResources", function(req, res, next){
    res.render("version");
});


router.get("/api/getResourcesForDOI", function(req, res) {
    var doi = req.query.doi;

    var url = bindaas_getResourcesForDoi +  "?api_key=" + config.bindaas_api_key+"&doi="+doi;
    console.log(url);
    http.get(url, function(rres){
        var resources = "";
        rres.on("data", function(d){
            resources+=d;
        });
        rres.on("end", function(){
            try{
                resources_json = JSON.parse(resources);
                return res.json(resources_json);
            } catch(e){
                return res.status(500).send("Couldn't fetch resources");
            }   

           
        });
    });
});


function findLatestVersion(doi, callback){
    var getVersionsForDoiURL = config.bindaas_getVersionsForDoiURL; 

    superagent.get(getVersionsForDoiURL + "?api_key="+bindaas_api_key + "&doi="+doi)
        .end(function(ver_err, ver_res){
            //console.log(ver_err);
            //console.log(ver_res);
            if(ver_res.ok) {
                var versions = ver_res.body;
                var fakeVersionID = -999
                var latestVersion = fakeVersionID;


                if(versions.length){
                    for(v in versions){
                        var version = versions[v];
                        if(version.versionID){
                            if(version.versionID > latestVersion){
                                latestVersion = version.versionID;
                            }
                        }

                    }
                }
                var newVersion
                if(latestVersion == fakeVersionID){
                    newVersion = 1;
                } else {
                    newVersion = latestVersion+1;
                }
                callback(newVersion);
            }
        });
}


var resourceIDs = [];
function postResourcesPayload(resource, doi, version, callback){
	var payload = resource;
	payload.resourceID = uuid.v1();
	payload.doi = doi;

	

	//console.log("each");
	resourceIDs.push(payload.resourceID);
	//PUSHED_RESOURCES.push(payload);
	superagent.post(bindaas_addResourceURL+"?api_key="+bindaas_api_key)
		.send(payload)
		.end(function(resource_res){
			//console.log(resource_res);i
			callback();
		});   
}
function postResources(addedResources, doi, version, cb){
  var doi_path = doi.split(".");
  var doi_path = doi_path[doi_path.length - 1];
  var directory = UPLOAD_PATH + "/"+doi_path + "/"+version;
		
  /* Copy all files */
  async.each(FILES, function(file, callbackF){
    var fileName= file.name;
    var fileData = file.data;
    var version = 1;
    mkdirp(directory, function() {
      var path = directory + "/" + fileName;
      fs.writeFile(path, fileData, function(){
      console.log("wrote "+path);
      callbackF();
      });	
    });	
  }, function(errF){
    async.each(addedResources, function(resource, callback){
        if(resource.type == "file"){
            var fileName = resource.info.resourceData;
            var path = directory + "/" + fileName;				

            resource.info.resourceData = path;
            resource.filePath = path;
            resource.fileName = fileName;
        }
        if(resource.type == "shared_list"){
           superagent.post("http://localhost:3001/api/createJNLP")
            .send('shared_list_name='+ resource.info.resourceData)
            .end(function(err, data){
              if(err){
                callback(err);
                //res.status(500).send("Error creating JNLP");
              } else {
                console.log("shared list creating jnlp");
                console.log(data);
                var jnlp = ""+data.body.jnlp;
                console.log("data: "+jnlp);
                resource.info.sharedListName = resource.info.resourceData;
                resource.info.resourceData = jnlp;
                console.log("Resource data: "+resource.info.resourceData);
                postResourcesPayload(resource, doi, version, callback);
              }
            });                  
        } else {
          postResourcesPayload(resource, doi, version, callback);

        }

    }, function(err){
        if(err){
          cb(err);
        } else {
          cb();
        }
        //res.json({"Status": "success"});
    });      
  });		
}



router.post("/api/uploadFile", function(req, res, next){
    console.log("uploading file");
    console.log(req.body);
    req.pipe(req.busboy);
    var resources = {};
    var addedResources = [];
    var previousResources = [];
    resourceIDs = [];
    var doi = "";
    req.busboy.on("field", function(fieldname, val, keyTruncated, valTruncated){
        console.log("field");
        console.log(fieldname);
        if(fieldname == "resources"){
            resources = JSON.parse(val);
            addedResources = resources.addedResources;
            previousResources = resources.previousResources;
            doi = resources.doi;
        }
    });
    FILES = [];
    req.busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
        console.log("uploading: "+fieldname);
        var fileData = "";
        file.on("data", function(data){
            fileData += data;
            console.log(data.length);
            
        });
        file.on("end", function(){
            FILES.push({"name": fieldname, "data": fileData});
            //fstream = fs.cerateWriteStream(
            console.log("Finished file");

        });
    });
    req.busboy.on("finish", function(){
        console.log("Done! Finish");
        console.log(addedResources);
        console.log(previousResources);
        resourceIDs = previousResources;

        for(var i in addedResources){
          var resource = addedResources[i];
          console.log("Resource: "+resource);
          if(resource.type == "shared_list"){
            console.log("creating jnlp");

          }
        }

        findLatestVersion(doi, function(version){
            postResources(addedResources, doi, version, function(err){
                if(err){
                  console.log("Error posting resources");
                  console.log(err);
                  return res.status(500).send("Error");
                }
                var newVersion = version;

                var version_payLoad = {};
                version_payLoad.resourceIDs = resourceIDs;
                //console.log(resourceIDs);
                version_payLoad.timeStamp = Date.now();
                version_payLoad.doi = doi;
                version_payLoad.versionID = newVersion;
                //console.log(bindaas_addVersionURL);
                superagent.post(bindaas_addVersionURL+"?api_key="+bindaas_api_key)
                    .send(version_payLoad)
                    .end(function(version_res){
                        if(version_res.statusCode != 200){
                            console.log("Error")
                            return res.status(500).send("Error");
                        } else {
                          return res.json({"resources":resources});
                        }
                    });

            });
        });

    });
});

var FILES = [];

module.exports = router;
