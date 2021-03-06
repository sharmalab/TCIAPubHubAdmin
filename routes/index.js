var express = require("express");
var router = express.Router();

var fs = require("fs");

var https = require("https");
var http = require("http");

var restler = require("restler");

var request = require("request");
var child_process = require("child_process");

var superagent = require("superagent");
var uuid = require("uuid");
var async = require("async");

var winston = require("winston");

var config = require("../config.js");

var username = config.ezid_username;
var password = config.ezid_password;
var bindaas_host = config.bindaas_host;
var bindaas_port_or_service = config.bindaas_port_or_service;
var bindaas_project = config.bindaas_project;
var bindaas_api_key = config.bindaas_api_key;
var app_apis = config.app_apis;
var doi_apis = config.doi_apis;
var doi_version_apis = config.doi_version_apis;

var bindaas_getAll = config.bindaas_getAll;
var bindaas_metadataForDOI = config.bindaas_metadataForDOI;
var bindaas_getByDoi = config.bindaas_getByDoi;
var bindaas_deleteByDOI = config.bindaas_deleteByDOI;

var bindaas_getFileForResource = config.bindaas_getFileForResource;
var bindaas_getVersionsForDOI = config.bindaas_getVersionsForDOI;
var bindaas_getResourcesForDoi = config.bindaas_getResourcesForDoi;
var bindaas_getResourceById = config.bindaas_getResourceById;

var bindaas_postDOIMetadata = config.bindaas_postDOIMetadata;

var citeproc_url = config.citeproc_server;

var DOI_NAMESPACE = config.DOI_NAMESPACE;
var URL_PREFIX = config.URL_PREFIX;
var URL_PREFIX_PUBLIC = config.URL_PREFIX_PUBLIC;
var URL_HOST = config.URL_HOST;

var createUrl = function(endpoint) {
  //var url = host+ ":"+port + path + endpoint;
  var url =
    bindaas_host +
    bindaas_port_or_service +
    bindaas_project +
    app_apis +
    "/query" +
    endpoint;
  return url;
};

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
  timestamp: true
});
winston.log("info", "Starting pubhub admin");
var makeID = function(length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get("/index", function(req, res, next) {
  res.render("index");
});

router.get("/", function(req, res, next) {
  res.render("index");
});

/* GET home page. */
router.get("/createDOI", function(req, res, next) {
  res.render("create", {
    title: "TCIA PubHubAdmin"
  });
});


router.get("/api/getAllDoi", function(req, res) {
  var url = bindaas_getAll + "?api_key=" + bindaas_api_key;
  winston.log("info", "Getting: " + url);
  var request = http
    .get(url, function(res_) {
      winston.log("info", "Status code: " + res_.statusCode);
      var DOIs = "";
      res_.on("data", function(data) {
        DOIs += data;
      });

      res.on("error", function(err) {
        //console.log("error");
        winston.log("error", err);
        res.json(JSON.parse({
          error: err
        }));
      });
      res_.on("end", function() {
        //var response = JSON.parse(DOIs);
        //console.log(data);
        var response = DOIs;

        res.json(JSON.parse(response));
      });
    })
    .on("error", function(error) {
      winston.log("error", error);
      res.status(500).send("Couldnt connect to Bindaas" + error);
    });
});

var getMetadataForDOI = function(doi, callback) {
  var api_key = "4fbb38a3-1821-436c-a44d-8d3bc5efd33e";
  var url = bindaas_metadataForDOI + "?api_key=" + api_key + "&doi=" + doi;

  superagent.get(url).end(function(err, res) {
    metadata = JSON.parse(res.text);

    callback(metadata);
  });
};

function getFormData(serializedArray) {
  var unindexed_array = serializedArray;
  var indexed_array = {};
  unindexed_array.map(function(n, i) {
    indexed_array[n["name"]] = n["value"];
  });
  return indexed_array;
}

function createJSON(formdata) {
  var authors = formdata.authors;

  var creators = {};

  creators = authors.map(function(author) {
    var creator = {};

    creator["creator"] = {};
    creator["creator"]["creatorName"] = author;
    return creator;
  });
  var titles = {};
  titles["title"] = formdata.title;

  var jsondata = {
    identifier: {
      VAL: formdata.doi,
      ATTR: {
        identifierType: "DOI"
      }
    },
    resourceType: {ATTR:{resourceTypeGeneral:"Dataset"}},
    creators: creators,
    titles: titles,
    publisher: "The Cancer Imaging Archive",
    publicationYear: formdata.year,
    contributors: [{
      contributor: {
        contributorName: "TCIA Team",
        affiliation: "The Cancer Imaging Archive",
        ATTR: {
          contributorType: "DataCurator"
        }
      }
    }],
    descriptions: [{
      description: {
        VAL: cleanData(formdata.description),
        ATTR: {
          descriptionType: "Abstract"
        }
      }
    }]
  };

  winston.log("info", "JSON for python converter: " + JSON.stringify(jsondata));
  return jsondata;
}
router.get("/api/getDOINamespace", function(req, res) {
  res.json({
    doi_namespace: DOI_NAMESPACE,
    url_prefix_public: URL_PREFIX_PUBLIC,
    url_prefix: URL_PREFIX,
    url_host: URL_HOST
  });
});

var checkRequiredFields = function(form_data) {
  var required_fields = ["title", "description", "url", "authors"];

  for (i in required_fields) {
    var required_field = required_fields[i];
    if (required_field == "authors") {
      if (!form_data[required_field].length) {
        return false;
      }
    }
    if (!form_data[required_field]) {
      return false;
    }
  }
  return true;
};

winston.log("hello");
var cleanData = function(data) {
  var data = data;
  data = data.replace(/(\r\n|\n|\r|\%)/gm, "");
  return data;
  //return escape(data);
};

router.post("/api/createJNLP", function(req, res) {
  req.setTimeout(0);
  var shared_list_name = req.body.shared_list_name;
  if (!shared_list_name) {
    winston.log("error", "Bad request, missing shared_list_name");
    return res.status(400).send("Bad request! Missing shared_list_name");
  }
  winston.log("info",
    'java -jar javautilities/TciaDoiClientAPP.jar -action dlm -sharedList "' +
    shared_list_name +
    '"');
  var java = child_process.exec(

    'java -jar javautilities/TciaDoiClientAPP.jar -action dlm -sharedList "' +
    shared_list_name +
    '"'
  );
  var javaout = "";
  java.stdout.on("data", function(data) {
    //console.log(data);console.log('..');
    javaout += data.toString("utf-8");
  });
  var javaError = false;
  java.stderr.on("data", function(data) {
    winston.log("error", data.toString());
    javaError = true;
  });
  java.on("exit", function(code) {
    console.log("exited");
    if (javaError == true) {
      return res.status(400).send("Error creating JNLP");
    }
    console.log(javaout);
    var lines = javaout.split("\n");
    /*
    if(lines && lines[3].split(" ")){
	return res.status(400).send("Error");
    }
	*/
    console.log("file loc:");
    console.log(lines[3].split(" ")[0]);
    var jnlpfile = lines[3].split(" ")[0];
    if (!jnlpfile) return res.status(500).send(
      "Couldn't create JNLP file");

    var jnlpfilename = jnlpfile.split("/")[4];

    fs
      .createReadStream(jnlpfile)
      .pipe(fs.createWriteStream("public/JNLP/" + jnlpfilename));

    return res.json({
      jnlp: "/JNLP/" + jnlpfilename
    });
  });
});

router.post("/api/createDOI", function(req, res) {
  winston.info("POST: /api/createDOI");

  var form_data = req.body.formData;

  var mongo_data = JSON.parse(JSON.stringify(form_data));

  var resources = req.body.resources;
  resources = {
    resources: resources
  };
  form_data = getFormData(form_data);
  authors_str = form_data.authors.toString();

  var DOI = form_data.doi;
  var DOI_STR = DOI;
  var URL = form_data.url;

  form_data.url = URL;
  form_data.doi = DOI;

  resources.doi = form_data.doi;
  if (!checkRequiredFields(form_data)) {
    return res.status(400).send("Missing required fields in the form");
  }

  var metadata = "";

  metadata += "_target: " + URL + "\n";
  var pyjson = JSON.stringify(createJSON(form_data));
  var python = child_process.exec("python pyutilities/json2xml.py");

  var xmlManifest = "<?xml version='1.0' encoding='utf-8'?>";
  var pyxml = xmlManifest;
  python.stdout.on("data", function(data) {
    //console.log(data);console.log('..');
    pyxml += data.toString("utf-8");
  });
  var pyError = false;
  python.stderr.on("data", function(data) {
    winston.log("error", data.toString());
    pyError = true;
  });
  python.on("exit", function(code) {
    if (pyxml == xmlManifest + "Invalid" || pyError == true)
      return res
        .status(400)
        .send(
          "XML document generated from the match doesn't match the schema"
        );
    metadata += "datacite: " + pyxml;
    winston.log("info",metadata);
    var bindaas_url = bindaas_postDOIMetadata + "?api_key=" +
      bindaas_api_key;
    superagent
      .post(bindaas_url)
      .send(form_data)
      .end(function(form_err, form_res) {
        //posting to bindaas
        if (!(form_err && form_err.statusCode>305)) {
          superagent
            .put("https://ez.datacite.org/id/doi:" + DOI_STR)
            .auth(username, password)
            .set("Content-Type", "text/plain")
            .send(metadata)
            .end(function(err, ezid_res) {
              //posting to ezid
              winston.log("error", err);
              if (err) {
                return res.status(400).send("Error posting to DataCite!!");
              }
              console.log(ezid_res.statusCode);
              return res.json({
                doi: DOI
              });
            });
        } else {
          winston.log("error", form_err);
          return res.status(400).send("Error posting to Bindaas");
        }
      });
  });

  python.stdin.write(pyjson);
  python.stdin.end();
});

router.post("/api/checkmetadataa", function(req, res) {


  var form_data = req.body.formData;

  var mongo_data = JSON.parse(JSON.stringify(form_data));

  var resources = req.body.resources;
  resources = {
    resources: resources
  };
  form_data = getFormData(form_data);
  authors_str = form_data.authors.toString();

  var DOI = form_data.doi;
  var DOI_STR = DOI;
  var URL = form_data.url;

  form_data.url = URL;
  form_data.doi = DOI;

  resources.doi = form_data.doi;
  if (!checkRequiredFields(form_data)) {
    return res.status(400).send("Missing required fields in the form");
  }

  var metadata = "";

  metadata += "_target: " + URL + "\n";    winston.log("info",metadata);
  var pyjson = JSON.stringify(createJSON(form_data));
  var python = child_process.exec("python pyutilities/json2xml.py");

  var xmlManifest = "<?xml version='1.0' encoding='utf-8'?>";
  var pyxml = xmlManifest;
  python.stdout.on("data", function(data) {
    //console.log(data);console.log('..');
    pyxml += data.toString("utf-8");
  });
  var pyError = false;
  python.stderr.on("data", function(data) {
    winston.log("error", data.toString());
    pyError = true;
  });
  python.on("exit", function(code) {
    if (pyError){
      res.status(500).send("ERROR with python")
    }
    metadata += "datacite: " + pyxml;
    winston.log("info",metadata);
     return res.send(metadata);


  });

  python.stdin.write(pyjson);
  python.stdin.end();
});

router.get("/api/getCitation", function(req, res) {
  var doi = req.query.doi;
  var style = req.query.style;
  var lang = req.query.lang;
  console.log(doi);

  var url =
    citeproc_url +
    "/format?doi=" +
    encodeURIComponent(doi) +
    "&style=" +
    encodeURIComponent(style) +
    "&lang=" +
    encodeURIComponent(lang);
  console.log(url);
  restler.get(url).on("complete", function(result) {
    res.json(result);
  });
});


router.get("/api/getDoi", function(req, res) {
  var doi = req.query.doi;

  var url = createUrl("/getByDoi?api_key=" + bindaas_api_key + "&doi=" +
    doi);
  console.log(url);
  http.get(url, function(res_) {
    var DOI = "";
    console.log(res_.statusCode);
    res_.on("data", function(data) {
      DOI += data;
    });
    res_.on("end", function() {
      var response = DOI;
      console.log(response);
      try {
        response = JSON.parse(response);
        return res.json(response);
      } catch (e) {
        return res.status(500);
      }
      //res.json(JSON.parse(response));
    });
  });
  //res.send("Hello");
});

router.get("/api/getFile", function(req, res) {
  var resourceID = req.query.resourceID;
  var fileName = req.query.fileName;
  //var bindaas_getFileForResource = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_RESOURCES/query/getFileForResourceClone";
  //var bindaas_api_key = "4fbb38a3-1821-436c-a44d-8d3bc5efd33e";

  var url =
    bindaas_getFileForResource +
    "?api_key=" +
    bindaas_api_key +
    "&resourceID=" +
    resourceID;
  console.log(url);

  var request = superagent.get(url);
  res.header("Content-Disposition", 'attachment; filename="' + fileName +
    '"');

  request.pipe(res);

  /*
    superagent.get(url)
        .end(function(fres){
            console.log(fres);
            return res.send(fres);
        });
    */
});

router.get("/api/getVersionsForDoi", function(req, res) {
  //var api_key = "4fbb38a3-1821-436c-a44d-8d3bc5efd33e";
  var doi = req.query.doi;
  //console.log(doi);
  //console.log(url);
  if (doi) {
    console.log("asdfadsfsadfSA");
    //var url = bindaas_getVersionsForDOI + "?api_key="+api_key + "&doi=" + (doi);
    console.log(bindaas_getVersionsForDOI);
    console.log("....");
    console.log(bindaas_api_key);
    //console.log(url);
    var url =
      bindaas_getVersionsForDOI + "?api_key=" + bindaas_api_key + "&doi=" +
      doi;
    console.log(url);
    //var getverUrl = bindaas_getVersionsForDOI + "?api_key=" + bindaas_api_key + "&doi=" + (doi);

    http.get(url, function(ver_res) {
      var versions = "";

      ver_res.on("data", function(data) {
        versions += data;
        console.log(data);
      });
      ver_res.on("end", function() {
        try {
          versions = JSON.parse(versions);
        } catch (e) {
          return res.status(500);
        }
        console.log(versions);
        res.json(versions);
        return;
      });
      ver_res.on("err", function() {
        return res.status(408).send(
          "Couldn't connect to bindaas. Timeed out");
      });
    });
    console.log(url);
    //res.json({"url": url});
  } else {
    return res.status(404).send("Couldn't find parameter 'doi'");
  }
});


router.get("/api/getResources", function(req, res) {
  var doi = req.query.doi;
  //var bindaas_resourceById = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_RESOURCES/query/getByResourceID";
  var api_key = bindaas_api_key;
  var doi = req.query.doi;
  if (doi) {
    var url = bindaas_getVersionsForDOI + "?api_key=" + api_key + "&doi=" +
      doi;
    console.log(url);
    http.get(url, function(ver_res) {
      var versions = "";
      ver_res.on("data", function(data) {
        versions += data;
        console.log(data);
      });
      ver_res.on("end", function() {
        try {
          versions = JSON.parse(versions);
        } catch (e) {
          return res.status(500);
        }
        console.log(versions);
        var versionID = req.query.version;
        var resourceIDs = [];
        for (var v in versions) {
          var version = versions[v];
          if (!versionID || version.versionID == versionID) {
            max_version = version.versionID;
            resourceIDs = version.resourceIDs;
          }
        }

        var resources = [];
        async.each(
          resourceIDs,
          function(resourceID, callback) {
            superagent
              .get(
                bindaas_getResourceById +
                "?api_key=" +
                api_key +
                "&resourceID=" +
                resourceID
              )
              .end(function(err, res) {
                resources.push(res.body);
                callback();
              });
          },
          function(err) {
            console.log(resources);
            return res.json(resources);
          }
        );

        //fetch

        //return res.json(versions);
      });
      ver_res.on("err", function() {
        return res.status(408).send(
          "Couldn't connect to bindaas. Timeed out");
      });
    });
    console.log(url);
    //res.json({"url": url});
  } else {
    return res.status(404).send("Couldn't find parameter 'doi'");
  }
});

router.get("/api/getResourcesForDoi", function(req, res) {
  var doi = req.query.doi;
  var version = req.query.version;
  var api_key = bindaas_api_key;
  //var api_key="4fbb38a3-1821-436c-a44d-8d3bc5efd33e";
  //var bindaas_getResourcesForDoi = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_RESOURCES/query/getByDoi?doi="
  var url =
    bindaas_getResourcesForDoi +
    "?doi=" +
    doi +
    "&version=" +
    version +
    "&api_key=" +
    api_key;

  http.get(url, function(res_) {
    var resources = "";
    res_.on("data", function(data) {
      resources += data;
      console.log(data);
    });
    res_.on("end", function() {
      var response = resources;
      try {
        response = JSON.parse(response);
      } catch (e) {
        return res.status(500);
      }
      console.log(resources);
      return res.json(response);
    });
    res_.on("error", function(err) {
      return res.json({
        error: err
      });
    });
  });
});

router.get("/details", function(req, res) {
  res.render("doi");
});



module.exports = router;
