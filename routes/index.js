var express = require("express");
var router = express.Router();

var fs = require("fs");

var https = require("https");
var http = require("http");

var request = require("request");
var child_process = require("child_process");

var superagent = require("superagent");
var uuid = require("uuid");
var async = require("async");

var winston = require("winston");

var config = require("../config.js");

var username = config.ezid_username;
var password = config.ezid_password;
var bindaas_api_key = config.bindaas_api_key;

var bindaas_getAll = config.bindaas_getAll;
var bindaas_metadataForDOI = config.bindaas_metadataForDOI;
var bindaas_getByDoi = config.bindaas_getByDoi;
var bindaas_deleteByDOI = config.bindaas_deleteByDOI;

var bindaas_postDOIMetadata = config.bindaas_postDOIMetadata;

var DOI_NAMESPACE = config.DOI_NAMESPACE;
var URL_PREFIX = config.URL_PREFIX;
var URL_HOST = config.URL_HOST;

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, { timestamp: true });
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
  res.render("create", { title: "Express" });
});

router.get("/editDOI", function(req, res, next) {
  res.render("edit", { title: "Express" });
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
        res.json(JSON.parse({ error: err }));
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

router.get("/api/editDOI", function(req, res) {
  //Get metadata for DOI
  //

  var doi = req.query.doi;
  if (!doi) {
    return res.status(400).send("Required parameter 'doi' not found");
  }
  //var url = createUrl("/getByDoi?api_key=4fbb38a3-1821-436c-a44d-8d3bc5efd33e&doi="+doi);
  //var api_key="4fbb38a3-1821-436c-a44d-8d3bc5efd33e";
  var api_key = bindaas_api_key;
  var url = bindaas_getByDoi + "?api_key=" + api_key + "&doi=" + doi;
  winston.log("info", "Getting: " + url);
  http.get(url, function(res_) {
    var DOI = "";
    winston.log("info", "Status: " + res_.statusCode);
    res_.on("data", function(data) {
      DOI += data;
    });
    res_.on("end", function() {
      var response = DOI;
      winston.log("info", response);
      return res.json(JSON.parse(response));
    });
  });
});

router.post("/api/editDOI", function(req, res) {
  //console.log(req);
  var metadata = req.body;
  var api_key = bindaas_api_key;
  var doi = metadata.doi;
  var url = metadata.url;

  var del_url = bindaas_deleteByDOI + "?api_key=" + api_key + "&doi=" + doi;

  winston.log("info", "DELETE: " + del_url);
  superagent.del(del_url).end(function(err, dres) {
    //console.log(err);
    //console.log(res);
    console.log("deleted metadata");
    superagent
      .post(bindaas_postDOIMetadata + "?api_key=" + bindaas_api_key)
      .send(metadata)
      .end(function(p_err, p_res) {
        console.log("done");
        return res.json({ status: "done" });
      });
  });
});

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
      ATTR: { identifierType: "DOI" }
    },
    creators: creators,
    titles: titles,
    publisher: "The Cancer Imaging Archive",
    publicationYear: "2016",
    contributors: [
      {
        contributor: {
          contributorName: "TCIA Team",
          affiliation: "The Cancer Imaging Archive",
          ATTR: { contributorType: "DataCurator" }
        }
      }
    ],
    descriptions: [
      {
        description: {
          VAL: cleanData(formdata.description),
          ATTR: { descriptionType: "Abstract" }
        }
      }
    ]
  };

  winston.log("info", "JSON for python converter: " + JSON.stringify(jsondata));
  return jsondata;
}
router.get("/api/getDOINamespace", function(req, res) {
  res.json({
    doi_namespace: DOI_NAMESPACE,
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
  var shared_list_name = req.body.shared_list_name;
  if (!shared_list_name) {
    winston.log("error", "Bad request, missing shared_list_name");
    return res.status(400).send("Bad request! Missing shared_list_name");
  }

  var java = child_process.exec(
    "java -jar javautilities/TciaDoiClientAPP.jar -action dlm -sharedList " +
      shared_list_name
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
    if (!jnlpfile) return res.status(500).send("Couldn't create JNLP file");

    var jnlpfilename = jnlpfile.split("/")[4];

    fs
      .createReadStream(jnlpfile)
      .pipe(fs.createWriteStream("public/JNLP/" + jnlpfilename));

    return res.json({ jnlp: "/JNLP/" + jnlpfilename });
  });
});

router.post("/api/createDOI", function(req, res) {
  winston.info("POST: /api/createDOI");

  var form_data = req.body.formData;

  var mongo_data = JSON.parse(JSON.stringify(form_data));

  var resources = req.body.resources;
  resources = { resources: resources };
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
        .send("XML document generated from the match doesn't match the schema");
    metadata += "datacite: " + pyxml;
    //console.log(metadata);
    var bindaas_url = bindaas_postDOIMetadata + "?api_key=" + bindaas_api_key;
    superagent
      .post(bindaas_url)
      .send(form_data)
      .end(function(form_err, form_res) {
        //posting to bindaas
        if (form_err.statusCode || !form_err) {
          superagent
            .put("https://ezid.cdlib.org/id/doi:" + DOI_STR)
            .auth(username, password)
            .set("Content-Type", "text/plain")
            .send(metadata)
            .end(function(err, ezid_res) {
              //posting to ezid
              winston.log("error", err);
              if (err) {
                return res.status(400).send("Error posting to EZID");
              }
              console.log(ezid_res.statusCode);
              return res.json({ doi: DOI });
            });
        } else {
          winston.log("error", err);
          return res.status(400).send("Error posting to Bindaas");
        }
      });
  });

  python.stdin.write(pyjson);
  python.stdin.end();
});

module.exports = router;
