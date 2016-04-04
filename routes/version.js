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



var path = require('path');
 
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



var username = "apitest";
var password = "apitest";
var bindaas_api_key = "4fbb38a3-1821-436c-a44d-8d3bc5efd33e";
var bindaas_post_url = "http://localhost:9099/services/test/DataLoaderApiTest/submit/json";


var DOI_NAMESPACE = "10.5072/FK2";
var URL_PREFIX = "http://localhost:3003/doi?doi=";



var addResourceURL = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_RESOURCES/submit/json";
var addVersionURL = "http://dragon.cci.emory.edu:9099/services/test/DOI_RESOURCE_VERSIONS/submit/json";

var UPLOAD_PATH = "/Users/ganesh/DOI_RESOURCES";


router.get("/createResources", function(req, res, next){
    res.render("version");
});


router.get("/api/getResourcesForDOI", function(req, res) {
    var doi = req.query.doi;
    var url = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_RESOURCES/query/getByDoi?api_key=4fbb38a3-1821-436c-a44d-8d3bc5efd33e&doi="+doi;
    console.log(url);
    http.get(url, function(rres){
        var resources = "";
        rres.on("data", function(d){
            resources+=d;
        });
        rres.on("end", function(){
            res.json(JSON.parse(resources));
           
        });
    });
});


function findLatestVersion(doi, callback){

    //get all versions for this DOI
    var getVersionsForDoiURL = "http://dragon.cci.emory.edu:9099/services/test/DOI_RESOURCE_VERSIONS/query/getVersionsForDoi";

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
	superagent.post(addResourceURL+"?api_key="+bindaas_api_key)
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

                }
                postResourcesPayload(resource, doi, version, callback);
                
                


            }, function(err){
                cb();
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

        //console.log(val);
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
        findLatestVersion(doi, function(version){
            postResources(addedResources, doi, version, function(){
                
                var newVersion = version;

                var version_payLoad = {};
                version_payLoad.resourceIDs = resourceIDs;
                console.log(resourceIDs);
                version_payLoad.timeStamp = Date.now();
                version_payLoad.doi = doi;
                version_payLoad.versionID = newVersion;

                superagent.post(addVersionURL+"?api_key="+bindaas_api_key)
                    .send(version_payLoad)
                    .end(function(version_res){
                        console.log(version_payLoad);
                        console.log("Pushed all resources!!!!! W00t; ");
                        
                        console.log("Done!");
                        //console.log(version_res);
                        res.json({"resources":resources});
                    });

            });
        });

    });
});

var FILES = [];

router.post("/api/createVersion", function(req, res, next){
    var resources = req.body;
    var doi = resources.doi;
    var previousResources = resources.previousResources || [];
    var addedResources = resources.addedResources;
    console.log(req.body);
    console.log("###");
    console.log(resources.addedResources);
    console.log("####");
    console.log(doi);
    console.log(resources);
    console.log("........"); 
    var resourceIDs = previousResources;
    //var FILES = [];
    var PUSHED_RESOURCES = [];

    console.log(addedResources);
    async.each(addedResources, function(resource, callback){
        var payload = resource;
      
        payload.resourceID = uuid.v1();
        payload.doi = doi;
        console.log("each");


        resourceIDs.push(payload.resourceID);
        console.log("pushed");
        console.log(resource.type);
        console.log(resource.info.resourceData);
        console.log("pushing");
        PUSHED_RESOURCES.push(payload);
        superagent.post(addResourceURL+"?api_key="+bindaas_api_key)
            .send(payload)
            .end(function(resource_res){
                //console.log(resource_res);
                callback();
                    
            });   
    }, function(err){
        if(err){
            console.log("Error!");
        } else {

            //get all versions for this DOI
            var getVersionsForDoiURL = "http://dragon.cci.emory.edu:9099/services/test/DOI_RESOURCE_VERSIONS/query/getVersionsForDoi";

            superagent.get(getVersionsForDoiURL + "?api_key="+bindaas_api_key + "&doi="+doi)
                .end(function(ver_err, ver_res){
                    //console.log(ver_err);
                    //console.log(ver_res);
                    if(ver_res.ok) {
                        var versions = ver_res.body;
                        var fakeVersionID = -999;
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

                        var version_payLoad = {};
                        version_payLoad.resourceIDs = resourceIDs;
                        console.log(resourceIDs);
                        version_payLoad.timeStamp = Date.now();
                        version_payLoad.doi = doi;
                        version_payLoad.versionID = newVersion;

                        superagent.post(addVersionURL+"?api_key="+bindaas_api_key)
                            .send(version_payLoad)
                            .end(function(version_res){
                                console.log("Pushed all resources!!!!! W00t; ");
                                console.log(PUSHED_RESOURCES);
                                console.log("Done!");
                                //console.log(version_res);
                                res.json({"resources":PUSHED_RESOURCES});
                            });

                    } else {
                        res.status(500).send("Error couldn't connect to Bindaas");    
                    }
                });

        }
    });
});

module.exports = router;
