var express = require("express");
var router = express.Router();

var https = require("https");
var http = require("http");

var superagent = require("superagent");

var username = "apitest";
var password = "apitest";
var bindaas_api_key = "4fbb38a3-1821-436c-a44d-8d3bc5efd33e";
var bindaas_post_url = "http://localhost:9099/services/test/DataLoaderApiTest/submit/json";


var DOI_NAMESPACE = "10.5072/FK2";
var URL_PREFIX = "http://localhost:3003/doi?doi=";





var makeID = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i< length; i++){
        text += possible.charAt(Math.floor(Math.random()*possible.length));
    }
    return text;
};


router.get("/createDOIVersion", function(req, res, next){
    res.render("version");
});

router.get("/", function(req, res, next){
    res.json({"hello": "creator"});
});

/* GET home page. */
router.get("/createDOI", function(req, res, next) {

    res.render("index", { title: "Express" });
});

router.get("/api/getResourcesForDOI", function(req, res, next) {
    var doi = req.query.doi;
    var url = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_RESOURCES/query/getByDoi?api_key=4fbb38a3-1821-436c-a44d-8d3bc5efd33e&doi="+doi;
    console.log(url);
    http.get(url, function(rres){
        var resources = ""
        rres.on("data", function(d){
            resources+=d;
        });
        rres.on("end", function(){
            res.json({"doi": JSON.parse(resources)});
           
        });
    });
});

function getFormData(serializedArray){
    var unindexed_array = serializedArray;
    var indexed_array = {};
    unindexed_array.map(function(n, i){
        indexed_array[n['name']] = n['value'];
    }); 
    return indexed_array;
}

router.post("/submitDOI", function(req, res) {
    //console.log(req); 
    console.log("submit"); 
    var form_data = req.body.formData;
    
    //    //console.log(form_data.authors);
    var resources = req.body.resources;
    resources = {"resources": resources}; 
    form_data = getFormData(form_data);
    form_data.authors = form_data.authors.split(",");

    console.log(form_data);
    console.log(resources);
    //createDOI
    var RAND = makeID(8); 
    var DOI = DOI_NAMESPACE + form_data.year + RAND;
    var URL = URL_PREFIX + DOI;

    if(1){
        form_data.url = URL;
        form_data.doi = "http://dx.doi.org/"+DOI;
        
        resources.doi = form_data.doi;
        var metadata = "";
        metadata += "datacite.publisher: (:unav)\n";
        metadata += "datacite.creator: Ganesh\n";
        metadata += "datacite.publicationyear: "+ form_data.year + "\n";
        metadata += "datacite.title: "+ form_data.title + "\n";
        metadata += "datacite.resourcetype: InteractiveResource\n";
        metadata += "_target: "+ URL;
        console.log(metadata);
        //Post to Bindaas
        superagent.post("http://dragon.cci.emory.edu/services/test/TCIA_DOI_RESOURCES/submit/json?api_key="+bindaas_api_key)
        .send(resources)
        .end(function(resource_err, resource_res){
        
            if(resource_err.statusCode || ! resource_err){ 
                superagent.post("http://dragon.cci.emory.edu/services/test/TCIA_DOI_APP/submit/json?api_key="+bindaas_api_key)
                .send(form_data)
                .end(function(form_err, form_res){

                        if(form_err.statusCode || !form_err){
                                
                                //Post to EZID
                                superagent.put("https://ezid.cdlib.org/id/doi:"+DOI)
                                    .auth(username, password)
                                    .set("Content-Type", "text/plain")
                                    .send(metadata)
                                    .end(function(err, ezid_res){
                                        console.log(err);
                                        console.log(ezid_res.statusCode);
                                        return res.json({"woot": "woot"});
                                    });
               
                        }
                        else {
                            return res.json({"error": form_err});
                        }

                });
            } else {
                return res.json({"error": resource_err});
            }
        });

    } else {
        return res.json({"error": "Required fields missing"});
    }
});


module.exports = router;
