var React = require("react");
var ReactDOM = require("react-dom");
var jQuery = require("jquery");
var superagent = require("superagent");

var Citation = React.createClass({
  getInitialState: function() {
    return { doiCitation: null };
  },
  componentDidMount: function() {
    var self = this;
    var citationUrl = "api/getCitation?style=apa&lang=en-US&doi=";
    var doi = self.props.doi.slice(18, self.props.doi.length);
    console.log(doi);
    citationUrl += doi;
    //citationUrl+=self.state.
    superagent.get(citationUrl).withCredentials().end(function(err, response) {
      console.log(response);
      self.setState({ doiCitation: response.text.replace("\\n", "") });
    });
  },
  render: function() {
    var self = this;
    return (
      <div className="doiCitation">
        {self.state.doiCitation
          ? <div className="citation bg-info"> {self.state.doiCitation}</div>
          : <div className="message bg-danger">Loading Citation...</div>}
      </div>
    );
  }
});

class OneJNLP extends React.Component {
  static open_btn() {
    document.getElementById("jnlpform").classList.toggle("visibility");
    if (document.getElementById("jnlpform").classList.contains("visibility")) {
      document
        .getElementById("jnlpform")
        .setAttribute("style", "display:block;");
      document.getElementById("jnlpformbtn").innerText = "Close Form";
      document.getElementById("jnlpformbtn").classList.toggle("btn-danger");
    } else {
      document
        .getElementById("jnlpform")
        .setAttribute("style", "display:none;");
      document.getElementById("jnlpformbtn").innerText = "Get a JNLP";
      document.getElementById("jnlpformbtn").classList.toggle("btn-danger");
    }
  }

  static submit_btn() {
    document.getElementById("downloadbtn").classList.add("btn-warning");
    document.getElementById("downloadbtn").setAttribute("disabled", "true");
    document.getElementById("downloadbtn").setAttribute("onClick", "");
    document.getElementById("downloadbtn").innerHTML =
      "<span class='glyphicon glyphicon-time'></span>";
    var list = document.getElementById("shared_list_name").value;
    // get the file, call back on finish...
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/createJNLP", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        console.log(xhr.responseText);
        var link = JSON.parse(xhr.responseText).jnlp;
        // handle error
        document.getElementById("downloadbtn").classList.remove("btn-warning");
        if (link) {
          document.getElementById("downloadbtn").classList.add("btn-succcess");
          document.getElementById("download").innerHTML =
            '<iframe width="1" height="1" frameborder="0" src="' +
            link +
            '"></iframe>';
        } else {
          document.getElementById("downloadbtn").classList.add("btn-danger");
        }
      } else if (xhr.status >= 300) {
        document.getElementById("downloadbtn").classList.add("btn-danger");
      }
    };
    xhr.send("shared_list_name=" + list);
  }

  render() {
    return (
      <div id="oneJNLP">
        <button
          type="button"
          id="jnlpformbtn"
          className="btn"
          onClick={OneJNLP.open_btn}
        >
          Get a JNLP
        </button>
        <div id="jnlpform" style={{ display: "none" }}>
          <div className="input-group" id="formbox">
            <input
              type="text"
              name="shared_list_name"
              className="form-control"
              placeholder="Shared List Name"
              id="shared_list_name"
            />
            <span className="input-group-btn">
              <button
                type="button"
                id="downloadbtn"
                className="btn btn-info"
                onClick={OneJNLP.submit_btn}
              >
                <span className="glyphicon glyphicon-download-alt" />
              </button>
            </span>
          </div>
          <div id="download" />
        </div>
      </div>
    );
  }
}

var DOISmall = React.createClass({
  getInitialState: function() {
    return { url_prefix: "" };
  },
  componentDidMount: function() {
    var self = this;
    superagent.get("/api/getDOINamespace").end(function(err, response) {
      console.log("get doi namespace");
      if (!err) {
        self.setState({ url_prefix: response.body.url_prefix });
        console.log(response.body);
      }
    });
  },
  render: function() {
    var self = this;
    var data = self.props.data;
    var authors = <div />;
    //console.log(data.authors.length);
    if (data.authors) {
      if (data.authors.isArray) {
        authors = data.authors.map(function(d) {
          return <div>{d}</div>;
        });
      }
    }
    console.log(data.url);
    var doi = data.doi;
    var edit = "editDOI?doi=" + data.doi;
    var resources_url = "createResources?doi=" + data.doi;
    return (
      <div className="doiSummary">
        <div className="doiTitle">
          <h3>{data.title}</h3>
        </div>
        <div className="btn-group resource_admin_buttons">
          <a href={resources_url}>
            <button type="button" className="btn btn-default">
              Add Resources
            </button>
          </a>
          <a href={self.state.url_prefix + encodeURI(data.doi)}>
            <button type="button" className="btn btn-default">
              View Citation
            </button>
          </a>
        </div>
        {
          //  <div><Citation doi={data.doi} /></div>
          // <div className="doiAuthors">{authors}</div>
          //<div className="doiDescription">{data.description}</div>
        }
      </div>
    );
  }
});

var AllDOIs = React.createClass({
  getInitialState: function() {
    return { DOIs: null };
  },
  componentDidMount: function() {
    var self = this;
    //console.log("getting data");
    superagent.get("api/getAllDoi").end(function(err, res) {
      console.log(res);
      if (err) {
        //console.log(err);
        self.setState({ error: err });
      } else {
        var response = JSON.parse(res.text);
        console.log(response);
        self.setState({ DOIs: response });
      }
    });
  },
  render: function() {
    console.log("woot");
    console.log(this.state.DOIs);
    if (this.state.error) {
      console.log("Error");
      return <div> Couldnt fetch data from the server</div>;
    }
    var count = 0;
    console.log(this.state.DOIs);
    if (this.state.DOIs) {
      var DOIs = this.state.DOIs;
      console.log(DOIs);
      var DOI = DOIs.map(function(doi) {
        count++;
        return <DOISmall data={doi} key={count} />;
      });
      return <div> {DOI} </div>;
    } else {
      return <div>Loading DOIs...</div>;
    }
  }
});

var App = React.createClass({
  render: function() {
    function livesearch(e) {
      e.preventDefault();
      var val = document.getElementById("srch-term").value;
      // display none those that don't match
      [].forEach.call(document.getElementsByClassName("doiSummary"), function(
        elem
      ) {
        elem.innerHTML.search(new RegExp(val, "i")) == -1 && val
          ? elem.setAttribute("style", "display:none;")
          : elem.setAttribute("style", "display:block;");
      });
    }
    return (
      <div>
        <div id="header">
          <img src="images/tcia_logo_dark_sml.png" />
        </div>
        <div className="container col-md-8 col-md-offset-2" id="main">
          <h3 id="headline"> PubHub Central</h3>

          <form>
            <div className="input-group add-on">
              <input
                className="form-control input-lg"
                placeholder="Search"
                name="srch-term"
                id="srch-term"
                type="text"
              />
              <div className="input-group-btn">
                <button
                  onClick={livesearch}
                  className="btn btn-lg"
                  type="submit"
                >
                  <span className="glyphicon glyphicon-search" />
                </button>
              </div>
            </div>
          </form>
          <br />
          <div id="HeadButtons">
            <div id="CreateDoiButton" role="group">
              <a href="createDOI">
                <button type="button" className="btn btn-large btn-primary">
                  <span className="glyphicon glyphicon-plus" />&nbsp;Create DOI
                </button>
              </a>
            </div>
            <OneJNLP />
          </div>

          <div className="allDOIs">
            <AllDOIs />
          </div>
        </div>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById("app"));
