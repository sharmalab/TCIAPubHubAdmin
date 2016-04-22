/* Security */
var ezid_username = "apitest";
var ezid_password = "apitest";
var bindaas_api_key = "4fbb38a3-1821-436c-a44d-8d3bc5efd33e";


/* URL Configuration*/
var DOI_NAMESPACE = "10.5072/FK2";
var URL_PREFIX = "http://dragon.cci.emory.edu/tcia_pubhub/doi?doi=";

/* MetaData */


var bindaas_host = "http://dragon.cci.emory.edu";
var bindaas_port_or_service = "/services";
var bindaas_project = "/test";
var app_apis = "/TCIA_DOI_APP";
var doi_apis = "/TCIA_DOI_RESOURCES";
var doi_version_apis = "/DOI_RESOURCE_VERSIONS";

var bindaas_getAll = bindaas_host + bindaas_port_or_service + bindaas_project +  app_apis + "/query/getAll";
var bindaas_metadataForDOI = bindaas_host + bindaas_port_or_service +  bindaas_project + app_apis + "/query/getByDoi";
var bindaas_getByDoi = bindaas_host + bindaas_port_or_service +  bindaas_project + app_apis + "/query/getByDoi"; 
var bindaas_deleteByDOI = bindaas_host + bindaas_port_or_service +  bindaas_project +  app_apis + "/delete/deleteByDoi";
var bindaas_postDOIMetadata = bindaas_host + bindaas_port_or_service + bindaas_project + app_apis + "/submit/json";


/* Resources*/
var bindaas_addResourceURL = bindaas_host + bindaas_port_or_service +  bindaas_project + doi_apis + "/submit/json";
var bindaas_addVersionURL = bindaas_host + bindaas_port_or_service +  bindaas_project + doi_version_apis + "/submit/json";
var bindaas_getVersionsForDoiURL = bindaas_host + bindaas_port_or_service +  bindaas_project + doi_version_apis + "/query/getVersionsForDoi";


var bindaas_getResourcesForDoi = bindaas_host + bindaas_port_or_service +  bindaas_project + doi_apis + "/query/getByDoi";

var UPLOAD_PATH = "/home/ganesh/dev/TCIA_PubHub/DOI_Resources";

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
exports.UPLOAD_PATH = UPLOAD_PATH;
exports.bindaas_getResourcesForDoi = bindaas_getResourcesForDoi;


exports.bindaas_addResourceURL = bindaas_addResourceURL;
exports.bindaas_addVersionURL = bindaas_addVersionURL;
exports.bindaas_getResourcesForDoi = bindaas_getResourcesForDoi;
