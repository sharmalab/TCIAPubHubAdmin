var React = require("react");
var ReactDOM = require("react-dom");
var superagent = require("superagent");
var Bootstrap = require("react-bootstrap");
var Accordion = Bootstrap.Accordion;
var Panel = Bootstrap.Panel;

var marked = require("marked");

var Tabs = Bootstrap.Tabs;
var Tab = Bootstrap.Tab;

var ButtonToolbar = Bootstrap.ButtonToolbar;
var DropdownButton = Bootstrap.DropdownButton;
var MenuItem = Bootstrap.MenuItem;

var citationAPI = "api/getCitation";
var getVersionsForDoi = "api/getVersionsForDoi";

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var URL = "";

class Citation extends React.Component {
  constructor(props) {
    super(props);
    this.state = { doiCitation: null };
    this.selectCitation = this.selectCitation.bind(this);
  }
  componentDidMount() {
    var self = this;
    var citationUrl = "api/getCitation?style=apa&lang=en-US&doi=";
    var doi = self.props.doi;

    //console.log(doi);
    citationUrl += doi;
    //citationUrl+=self.state.
    superagent.get(citationUrl).withCredentials().end(function(err, response) {
      //console.log(response);
      self.setState({ doiCitation: response.text.replace("\\n", "") });
    });
  }
  selectCitation(e, k) {
    console.log('e', e);
    console.log('k', k);
    var self = this;
    self.setState({ doiCitation: null });
    var citationUrl = citationAPI + "?style=" + e + "&lang=en-US&doi=";
    var doi = self.props.doi;

    citationUrl += doi;
    //citationUrl+=self.state.
    superagent.get(citationUrl).withCredentials().end(function(err, response) {
      //console.log(response);
      self.setState({ doiCitation: response.text.replace("\\n", "") });
    });
    //console.log(e.value);
  }
  render() {
    var self = this;
    return (
      <div className="doiCitation">
        {self.state.doiCitation
          ? <div className="citation bg-info">
              <div className="row">
                <div className="col-md-10">
                  <div className="citationBody">{self.state.doiCitation}</div>
                </div>
                <div className="col-md-2">
                  <ButtonToolbar>
                    <DropdownButton
                      bsSize="small"
                      title="Citation Style"
                      onSelect={self.selectCitation.bind(this)}
                      id="dropdown-size-small"
                      eventKey="ieee"
                    >
                      <MenuItem eventKey="apa" value="apa">APA</MenuItem>
                      <MenuItem eventKey="ieee" value="ieee">IEEE</MenuItem>
                    </DropdownButton>
                  </ButtonToolbar>
                </div>
              </div>
            </div>
          : <div className="message bg-danger">Loading Citation...</div>}
      </div>
    );
  }
}

class ResourceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, resources: null, version: null };
  }
  componentDidMount() {
    var self = this;
    var url = window.location.href;
    var doi = getParameterByName("doi", url);
    //console.log(doi);
    var version = self.props.version;
    var getDoiUrl = "api/getDoi?doi=" + encodeURI(doi);
    console.log(getDoiUrl);
    superagent.get(getDoiUrl).end(function(err, res) {
      //console.log(res);
      var data = JSON.parse(res.text);
      console.log(data);
      console.log("...");
      URL = data[0].url;
      if (doi) {
        var getResources = "api/getResources?doi=" + encodeURI(doi);
        if (version) {
          var getResources = getResources + "&version=" + version;
        }
        console.log(getResources);
        console.log("getting resources for version");
        superagent.get(getResources).end(function(err, rres) {
          if (err) {
            self.setState({ resources_err: err, resources: [] });
          }
          var resources = JSON.parse(rres.text);
          console.log(resources);
          console.log("url: " + data[0].url);
          self.setState({ resources: resources, data: data[0] });
        });
      } else {
        self.setState({ data: data[0] });
      }
      //self.setState({data: data[0]});
    });
  }
  static markdownToHTML(markdown) {
    if (markdown) {
      var self = this;
      var rawMarkup = marked(markdown, { sanitize: true });
      return { __html: rawMarkup };
    } else {
      return { __html: "" };
    }
  }
  render() {
    var self = this;
    var Resources = <div>Data Not Found. Select a version. </div>;
    if (self.state.resources) {
      var res_key = 0;
      console.log("resources");
      //console.log(self.state.resources.resources);

      if (self.state.resources.length) {
        Resources = self.state.resources.map(function(r) {
          res_key++;
          var resource = r[0];
          console.log(resource.info);
          console.log(resource.info.resourceData);

          if (resource.type == "file") {
            resource.info.resourceData =
              "api/getFile?resourceID=" +
              resource.resourceID +
              "&fileName=" +
              resource.fileName;
          }

          return (
            <li key={res_key} id={res_key} className="list-group-item">
              <div className="row">
                <strong
                  style={{ paddingLeft: "16px" }}
                  className="list-group-item-heading"
                >
                  {resource.info.resourceName}
                </strong>
                <div className="list-group-item-text">

                  <div
                    className="resourceType col-md-8"
                    dangerouslySetInnerHTML={ResourceList.markdownToHTML(
                      resource.info.resourceDescription
                    )}
                  />

                  <div className="resourceVal col-md-3">
                    <a href={resource.info.resourceData}>
                      {" "}
                      <button className="btn btn-default"> Download </button>
                      {" "}
                    </a>
                  </div>
                </div>
              </div>
            </li>
          );
        });
      }
    }
    return (
      <ul className="list-group">
        {Resources}
      </ul>
    );
  }
}

class Versions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { versions: null };
  }
  componentDidMount() {
    var self = this;
    var url = window.location.href;
    var doi = getParameterByName("doi", url);
    console.log(doi);
    var url = getVersionsForDoi + "?doi=" + doi;
    console.log(url);
    superagent.get(url).end(function(err, res) {
      var data = JSON.parse(res.text);
      console.log(data);
      self.setState({ versions: data });
    });
  }
  render() {
    var self = this;
    var version_list = <div>No versions available</div>;
    var url = window.location.href;
    console.log(url);
    var key = 0;
    //check if version in url
    var ver_in_url = getParameterByName("version", url);
    var doi = getParameterByName("doi", url);
    console.log("Showing version: " + ver_in_url);
    console.log(self.state.versions);
    if (self.state.versions) {
      self.state.versions.reverse();
      ver_in_url = ver_in_url || self.state.versions[0].versionID;
      version_list = self.state.versions.map(function(version) {
        var ver_url = "/details?doi=" + doi + "&version=" + version.versionID;
        if (ver_in_url == version.versionID) {
          var vid = "act";
        } else {
          var vid = "v" + version.versionID;
        }
        key++;
        return (
          <Panel
            bsStyle="info"
            eventKey={vid}
            header={"Version " + version.versionID}
          >
            <ResourceList version={version.versionID} />
          </Panel>
        );
      });
    }
    console.log(self.state.versions);
    if (self.state.versions) {
      if (!self.state.versions.length) return <div> No resources found </div>;
    }
    return (
      <div>
        <Accordion defaultActiveKey="act">
          {version_list}
        </Accordion>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, resources: null, version: null };
  }
  componentDidMount() {
    var self = this;
    var url = window.location.href;
    var doi = getParameterByName("doi", url);
    //console.log(doi);
    var version = getParameterByName("version", url);
    var getDoiUrl = "api/getDoi?doi=" + encodeURI(doi);
    console.log(getDoiUrl);
    superagent.get(getDoiUrl).end(function(err, res) {
      //console.log(res);
      var data = JSON.parse(res.text);
      console.log(data);
      console.log("...");
      URL = data[0].url;
      self.setState({ data: data[0] });
    });
  }
  static markdownToHTML(markdown) {
    if (markdown) {
      var self = this;
      var rawMarkup = marked(markdown, { sanitize: true });
      return { __html: rawMarkup };
    } else {
      return { __html: "" };
    }
  }
  render() {
    var self = this;
    var Authors = <div />;
    if (self.state.data) {
      if (Array.isArray(self.state.data.authors)) {
        var num_authors = self.state.data.authors.length;
        console.log(num_authors);
        var id = 0;
        Authors = self.state.data.authors.map(function(author) {
          id++;
          if (id == num_authors) return <span key={id}>{author}.</span>;
          return <span key={id}>{author}; </span>;
        });
      }
    }
    return (
      <div>
        <div id="header">
          <img src="images/tcia_logo_dark_sml.png" />
        </div>

        <div className="container col-md-8 col-md-offset-2  ">

          <div className="oneDoi">

            {self.state.data
              ? <div>
                  <div className="row pagebar" style={{ paddingLeft: "20px" }}>
                    <a href="/index">Admin Dashboard</a>
                    <span id="headlink_spacer"> &nbsp;&gt;&nbsp;</span>
                    <a href={self.state.data.url}> {self.state.data.title}</a>
                  </div>
                  <h2>{self.state.data.title}</h2>
                  <div><Citation doi={self.state.data.doi} /></div>
                  <div id="citationDisclaimer">
                    If you use these data, please add this citation to your scholarly resources.
                    {" "}
                    <a href="https://wiki.cancerimagingarchive.net/display/Public/Data+Usage+Policies+and+Restrictions">
                      Learn about Data Citation Standards.
                    </a>
                  </div>
                  <div id="doiBox">

                    {self.state.data.description
                      ? <div className="row doiRow">
                          <div className="col-md-3 doiSide">
                            Description
                          </div>
                          <div className="col-md-9">
                            <div
                              dangerouslySetInnerHTML={App.markdownToHTML(
                                self.state.data.description
                              )}
                            />
                          </div>
                        </div>
                      : <div />}

                    {self.state.data.doi
                      ? <div className="row doiRow">
                          <div className="col-md-3 doiSide">
                            DOI
                          </div>
                          <div className="col-md-9">
                            <div>{self.state.data.doi}</div>
                          </div>
                        </div>
                      : <div />}

                    {self.state.data.url
                      ? <div className="row doiRow">
                          <div className="col-md-3 doiSide">
                            URL
                          </div>
                          <div className="col-md-9">
                            <div>
                              <a href={self.state.data.url}>
                                {self.state.data.url}
                              </a>
                            </div>
                          </div>
                        </div>
                      : <div />}

                    {self.state.data.authors
                      ? <div className="row doiRow">
                          <div className="col-md-3 doiSide">
                            Authors
                          </div>
                          <div className="col-md-9">
                            <div>{Authors}</div>
                          </div>
                        </div>
                      : <div />}

                    {self.state.data.references
                      ? <div className="row doiRow">
                          <div className="col-md-3 doiSide">
                            References
                          </div>
                          <div className="col-md-9">
                            <div
                              dangerouslySetInnerHTML={App.markdownToHTML(
                                self.state.data.references
                              )}
                            />
                          </div>
                        </div>
                      : <div />}

                    {self.state.data.keywords
                      ? <div className="row doiRow">
                          <div className="col-md-3 doiSide">
                            Keywords
                          </div>
                          <div className="col-md-9">
                            <div>{self.state.data.keywords}</div>
                          </div>
                        </div>
                      : <div />}
                    {/*
                    <div className="row doiRow">
                      <div className="col-md-3 doiSide">
                        Share
                      </div>
                      <div className="col-md-9">
                        <div>
                          <div
                            className="shareaholic-canvas"
                            data-app="share_buttons"
                            data-app-id=""
                          />
                        </div>
                      </div>
                    </div>
                    */}

                  </div>

                  <div className="data">
                    <Versions />
                  </div>
                </div>
              : <div>Loading ...</div>}
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
