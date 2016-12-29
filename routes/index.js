var express = require("express");
var router = express.Router();

var https = require("https");
var http = require("http");

var request = require("request");

var superagent = require("superagent");
var uuid = require("uuid");
var async = require("async");


var config = require("../config.js");

var username = config.ezid_username;
var password = config.ezid_password;
var bindaas_api_key = config.bindaas_api_key;

var bindaas_getAll = config.bindaas_getAll;
var bindaas_metadataForDOI = config.bindaas_metadataForDOI;
var bindaas_getByDoi = config.bindaas_getByDoi;
var bindaas_deleteByDOI = config.bindaas_deleteByDOI;

var bindaas_postDOIMetadata = config.bindaas_postDOIMetadata;

var DOI_NAMESPACE = config.DOI_NAMESPACE
var URL_PREFIX = config.URL_PREFIX;

console.log(config);





var makeID = function(length) {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i< length; i++){
        text += possible.charAt(Math.floor(Math.random()*possible.length));
    }
    return text;
};

router.get("/index", function(req, res, next){
    res.render("index");
   
});


router.get("/", function(req, res, next){
    res.render("index");
   
});

/* GET home page. */
router.get("/createDOI", function(req, res, next) {

    res.render("create", { title: "Express" });
});

router.get("/editDOI", function(req, res, next) {

    res.render("edit", { title: "Express" });
});


router.get("/api/getAllDoi", function(req, res){
    var url = bindaas_getAll + "?api_key=" + bindaas_api_key;
    
    var request = http.get(url, function(res_){
        //res.send(res_)
        //console.log(res_);

        console.log(res_.statusCode);
        var DOIs = "";
        res_.on("data", function(data){
            //console.log(data);
            DOIs+=data;
        });
        console.log("...");
        res.on("error", function(err){
            console.log("error");
            res.json(JSON.parse({error: err})); 
        });
        res_.on("end", function(){
            //var response = JSON.parse(DOIs);
            //console.log(data);
            var response = DOIs;
            

            res.json(JSON.parse(response));
        });

    }).on("error", function(error){

        res.status(500).send("Couldnt connect to Bindaas" + error);
    });

});

var getMetadataForDOI = function(doi, callback){
    var api_key="4fbb38a3-1821-436c-a44d-8d3bc5efd33e"; 
    var url = bindaas_metadataForDOI + "?api_key=" + api_key + "&doi=" + doi;
    
    superagent.get(url)
        .end(function(err, res){
            metadata = JSON.parse(res.text);

            callback(metadata);
        });
}

function getFormData(serializedArray){
    var unindexed_array = serializedArray;
    var indexed_array = {};
    unindexed_array.map(function(n, i){
        indexed_array[n['name']] = n['value'];
    }); 
    return indexed_array;
}


router.get("/api/editDOI", function(req, res) {
    //Get metadata for DOI
    //

    var doi = req.query.doi;
    if(!doi){
        return res.status(404).send("Required parameter 'doi' not found");
    }
    //var url = createUrl("/getByDoi?api_key=4fbb38a3-1821-436c-a44d-8d3bc5efd33e&doi="+doi);
    //var api_key="4fbb38a3-1821-436c-a44d-8d3bc5efd33e"; 
    var api_key = bindaas_api_key;
    var url = bindaas_getByDoi + "?api_key=" + api_key + "&details=" + doi;
    console.log(url);
    http.get(url, function(res_){
        var DOI = "";
        console.log(res_.statusCode);
        res_.on("data", function(data){
            DOI+=data;
        });
        res_.on("end", function(){
            var response = DOI;
            console.log(response);
            return res.json(JSON.parse(response));
        });
    });
}); 



router.post("/api/editDOI", function(req, res) {
    console.log("----Editing----");

    //console.log(req); 
    var metadata = req.body;
    var api_key= bindaas_api_key; 
    var doi = metadata.doi;
    var url = metadata.url

    console.log(metadata);
    console.log("....");
    console.log(doi);
    console.log(bindaas_deleteByDOI);
    var del_url = bindaas_deleteByDOI + "?api_key=" + api_key+ "&doi="+doi;
    console.log(".......");
    
    console.log(del_url);
    superagent.del(del_url)
    .end(function(err, dres){
            //console.log(err);
            //console.log(res);
            console.log("deleted metadata");
            superagent.post(bindaas_postDOIMetadata+"?api_key="+bindaas_api_key)
                .send(metadata)
                .end(function(p_err, p_res){
                    console.log("done");
                    return res.json({"status": "done"});
            });
    });

});


function createJSON(formdata) {
    console.log("...");
    var authors = formdata.authors;
    
    var creators = {};

    creators = authors.map(function(author){ 
      var creator = {};
      console.log(author);
      creator["creator"] ={};
      creator["creator"]["creatorName"] =  author;
      return creator;
    });
    var titles = {};
    titles["title"] = formdata.title;
    console.log(creators);
    console.log(titles);
    var jsondata = {
      "identifier": {
        "VAL": formdata.doi,
        "ATTR": {"identifierType": "DOI"}
      },
      "creators": creators,
      "titles": titles,
      "publisher": "The Cancer Imaging Archive",
      "publicationYear": "2016",
      "contributors": [
        {
          "contributor": {
            "contributorName": "TCIA Team",
            "affiliation": "The Cancer Imaging Archive", 
            "ATTR": {"contributorType": "DataCurator"}
          }
        }
      ],
      "descriptions": [
        {
          "description": {
            "VAL": formdata.description,
            "ATTR": {"descriptionType": "Abstract"}
          }
        }
      ]
    };
    
    console.log(jsondata);
    return jsondata;


}

router.post("/api/createDOI", function(req, res) {
    //console.log(req); 
    console.log("submit"); 
    var form_data = req.body.formData;
    console.log(form_data);
    //    //console.log(form_data.authors);
    var resources = req.body.resources;
    resources = {"resources": resources}; 
    form_data = getFormData(form_data);
    authors_str = form_data.authors.toString();
    //form_data.authors = form_data.authors.split(";");
    console.log(form_data);
    //createDOI
    var RAND = makeID(8); 
    var DOI_STR =  DOI_NAMESPACE + "." + form_data.year + "."+ RAND;
    var DOI = "http://dx.doi.org/"+DOI_STR;
    var URL = URL_PREFIX + DOI;
    console.log("adf");

    form_data.url = URL;
    form_data.doi = DOI;
    
    resources.doi = form_data.doi;

    var metadata = "";
    metadata += "datacite.publisher: The Cancer Imaging Archive\n";
    metadata += "datacite.creator:"+ authors_str+ "\n";
    metadata += "datacite.publicationyear: "+ form_data.year + "\n";
    metadata += "datacite.title: "+ form_data.title + "\n";
    metadata += "datacite.resourcetype: Image/DICOM \n";
    metadata += "_target: "+ URL;
    console.log(metadata);
    
    var python = require('child_process').spawn(
      'python',
      ["pyutilities/json2xml.py"]
    );
    var pyjson = createJSON(form_data);
    console.log(JSON.stringify(pyjson));
    python.stdin.write(JSON.stringify(pyjson) + "\n");
    python.stdin.end();
    console.log("starting child process");
    var pyxml = "";
    python.stdout.on('data', function(chunk) {
      chunk = chunk.toString('utf-8');
      pyxml += chunk; 
      //console.log(chunk);
      //res.json({});
    });
    python.on('close', function(code){
      console.log(pyxml);
      console.log(code);
      res.json({});
    });
    
    //console.log(createJSON(form_data));

    //Post to Bindaas
    /*
    superagent.post(bindaas_postDOIMetadata+ "?api_key="+bindaas_api_key)
    .send(form_data)
    .end(function(form_err, form_res){

        if(form_err.statusCode || !form_err){
                console.log(DOI); 
                //Post to EZID
                superagent.put("https://ezid.cdlib.org/id/doi:"+DOI_STR)
                    .auth(username, password)
                    .set("Content-Type", "text/plain")
                    .send(metadata)
                    .end(function(err, ezid_res){
                        //console.log(err);
                        console.log(err);
                        if(err){
                            return res.status(500);
                        }
                        console.log(ezid_res.statusCode);
                        return res.json({"doi": DOI});
                    });

        }
        else {
            return res.json({"error": form_err});
        }

    });
    */
});


module.exports = router;
