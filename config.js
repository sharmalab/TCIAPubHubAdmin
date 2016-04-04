/* Security */
var ezid_username = "apitest";
var ezid_password = "apitest";
var bindaas_api_key = "4fbb38a3-1821-436c-a44d-8d3bc5efd33e";


/* URL Configuration*/
var DOI_NAMESPACE = "10.5072/FK2";
var URL_PREFIX = "http://localhost:3003/doi?doi=";

/* MetaData */


var bindaas_getAll = "http://dragon.cci.emory.edu/services/test/TCIA_DOI_APP/query/getAll";
var bindaas_metadataForDOI = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_APP/query/getByDoi";
var bindaas_getByDoi = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_APP/query/getByDoi"; 
var bindaas_deleteByDOI = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_APP/delete/deleteByDoi";
var bindaas_postDOIMetadata = "http://dragon.cci.emory.edu/services/test/TCIA_DOI_APP/submit/json";


/* Resources*/
var bindaas_addResourceURL = "http://dragon.cci.emory.edu:9099/services/test/TCIA_DOI_RESOURCES/submit/json";
var bindaas_addVersionURL = "http://dragon.cci.emory.edu:9099/services/test/DOI_RESOURCE_VERSIONS/submit/json";
var bindaas_getVersionsForDoiURL = "http://dragon.cci.emory.edu:9099/services/test/DOI_RESOURCE_VERSIONS/query/getVersionsForDoi";


var UPLOAD_PATH = "/Users/ganesh/DOI_RESOURCES";

exports.ezid_username = ezid_username;
exports.ezid_password = ezid_password;
exports.bindaas_api_key = bindaas_api_key;
exports.DOI_NAMESPACE = DOI_NAMESPACE;
exports.URL_PREFIX = URL_PREFIX;

exports.bindaas_postDOIMetadata = bindaas_postDOIMetadata;
exports.bindaas_getAll = bindaas_getAll;
exports.bindaas_metadataForDOI = bindaas_metadataForDOI;
exports.bindaas_getByDoi = bindaas_getByDoi;
exports.bindaas_deleteByDOI = bindaas_deleteByDOI;

