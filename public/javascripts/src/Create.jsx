var React = require("react");
var ReactDOM = require("react-dom");
var jQuery = require("jquery");

var ReactCSSTransitionGroup = require("react-addons-css-transition-group"); // ES5 with npm

var makeID = function(length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var AuthorsForm = React.createClass({
  getInitialState: function() {
    return { authors: [], value: [] };
  },
  add: function(e) {
    e.preventDefault();
    var authors = this.state.authors;
    console.log(this.state.lastAuthor);
    //authors.unshift(this.state.lastAuthor);
    //authors.push("#");
    console.log(e);
    console.log("add author");
    console.log(authors);
    //authors.push
    this.setState({ authors: authors });
  },
  removeAuthor: function(id) {
    console.log(id);
    console.log("eerer");
    var authors = this.state.authors;
    authors.pop();
    console.log(authors);
    this.setState({ authors: authors });
  },
  lastAuthor: function(e) {
    console.log(e.target.value);
    var lastAuthor = e.target.value;
    var authors = this.state.authors;
    authors[authors.length - 1] = lastAuthor;
    this.setState({ lastAuthor: e.target.value, authors: authors });
  },
  remove_item: function(i, e) {
    e.preventDefault();
    //var new_state = this.state.value.concat([]);
    var value = this.state.value;
    value.splice(i, 1);
    console.log(i);
    console.log(value);
    //new_state[i] = undefined;
    this.setState({ value: value });
  },
  add_more: function(e) {
    e.preventDefault();
    var new_val = this.state.value.concat([]);
    var authors = new_val;
    new_val.push("");
    console.log(new_val);
    this.props.onAddAuthor(authors);
    this.setState({ value: new_val });
  },
  handleChange: function(id, e) {
    //    console.log(id);
    var vals = this.state.value;
    vals[id] = e.target.value;

    //    console.log(e.target.value);
    this.setState({ value: vals });
  },
  render: function() {
    var self = this;
    var authors = this.state.authors;
    var authorIds = -1;
    var Inputs = this.state.value.map(function(e, i) {
      authorIds++;
      return (
        <div key={i} className="inputAuthor input-append">
          <label className="sublabel">Name:&nbsp; </label>

          <input
            type="text"
            placeholder="LastName, FirstName Initial."
            className="form-control"
            defaultValue={e}
            onChange={self.handleChange.bind(this, authorIds)}
            value={e}
          />&nbsp;
          <button
            onClick={self.remove_item.bind(null, i)}
            className="btn btn-xs btn-danger"
          >
            <div className="glyphicon glyphicon-trash"> </div>
          </button>
        </div>
      );
    });

    return (
      <div className="form-group authors-inp">
        <label className="required-label">Authors</label>
        <ReactCSSTransitionGroup
          transitionName="example"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          {Inputs}
        </ReactCSSTransitionGroup>
        <button onClick={this.add_more} className="btn btn-success">
          <div className="glyphicon glyphicon-plus" /> Add Author
        </button>
      </div>
    );
  }
});

var Form = React.createClass({
  getInitialState: function() {
    var d = new Date();
    var year = d.getFullYear();
    console.log(year);
    return {
      authors: [],
      resources: [],
      url: "",
      doi: "",
      year: year,
      valid: true,
      error: false,
      errorMessage: "",
      finalSubmit: false,
      finalSubmitDisable: {},
      finalSubmitDisableObj: {}
    };
  },
  getResources: function(resources) {
    console.log("main form");
    console.log(resources);
    this.setState({ resources: resources });
  },
  addAuthors: function(authors) {
    console.log(authors);
    //e.preventDefault();
    //var authors = this.state.authors;
    //authors.push("");
    this.setState({ authors: authors });
  },
  onSubmit: function(e) {
    e.preventDefault();
    this.setState({ finalSubmit: true });
  },
  onFinalSubmit: function(e) {
    e.preventDefault();
    var formData = jQuery("#createForm").serializeArray();
    var resources = this.state.resources;
    console.log("----------");
    console.log(formData);
    console.log(resources);
    var auth = {
      name: "authors",
      value: this.state.authors
    };
    formData.push(auth);
    console.log(this.state.authors);
    console.log("----------");
    var postData = {
      formData: formData,
      resources: resources
    };
    //var postData = formData.push(resources);
    //i

    var self = this;

    jQuery.ajax({
      type: "POST",
      url: "api/createDOI",
      data: JSON.stringify(postData),
      success: function(res) {
        //console.log(err);
        console.log(res);
        console.log("Submitted!");

        var redir_doi = res.doi;
        console.log(redir_doi);
        window.location.href = "index";
      },
      error: function(err) {
        console.log(err);
        var status = err.status;
        var message = err.responseText;
        var statusText = err.statusText;
        window.scrollTo(0, 0);
        self.setState({
          error: true,
          errorMessage: "Error: " +
            message +
            " [Status: " +
            status +
            " " +
            statusText +
            "]",
          finalSubmitDisable: "",
          finalSubmitDisableObj: {}
        });
      },
      dataType: "json",
      contentType: "application/json"
    });

    self.setState({
      finalSubmitDisable: "disable",
      finalSubmitDisableObj: { disabled: "disabled" }
    });
    console.log(postData);

  },
  generateURL: function(e) {
    if (e) e.preventDefault();
    var self = this;
    jQuery.get("api/getDOINamespace", function(data) {
      console.log(data.doi_namespace);
      var year = self.state.year;
      var doi = data.doi_namespace + "." + year + "." + makeID(8);
      var url = data.url_prefix + doi;
      console.log(url);

      self.setState({ url: url, doi: doi });
      //return data.doi_namespace;
    });
  },
  handleYear: function(e) {
    this.setState({ year: e.target.value });
    console.log("handling year");
    this.generateURL();
  },
  handleURL: function(e) {
    this.setState({ url: e.target.value });
  },
  handleTitle: function(e) {
    this.setState({ title: e.target.value });
  },
  handleDescription: function(e) {
    this.setState({ description: e.target.value });
  },
  checkValidURL: function(str) {
    /*
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      console.log(pattern.test(str));
      return pattern.test(str);

      */
    if (str.indexOf("http") !== -1 && str.indexOf("://") !== -1) return true;
    else return false;
  },
  checkValid: function() {
    var self = this;
    var year = self.state.year;
    var url = self.state.url;
    var doi = self.state.doi;
    var title = self.state.title;
    var authors = self.state.authors;
    var description = self.state.description;
    var errorMsg = "";
    var missing = [];
    if (!year) {
      missing.push("year");
    }
    if (!url || !self.checkValidURL(url)) {
      missing.push("url");
    }
    if (!title) {
      missing.push("title");
    }
    if (!authors.length) {
      missing.push("authors");
    }
    if (!description) {
      missing.push("description");
    }
    return missing;
  },
  componentDidUpdate: function() {},
  componentDidMount: function() {
    var self = this;
    self.generateURL();
  },
  render: function() {
    var self = this;
    var authors = this.state.authors;
    var id = 0;
    var year = self.state.year;
    var url = self.state.url;
    var doi = self.state.doi;
    var title = self.state.title;
    var description = self.state.description;
    var finalSubmit = self.state.finalSubmit;
    var finalSubmitDisable = self.state.finalSubmitDisable;
    var finalSubmitDisableObj = self.state.finalSubmitDisableObj;

    var valid = this.checkValid().length ? false : true;
    console.log(valid);
    var missing = this.checkValid();
    console.log(missing);
    var Missing = missing.map(function(m) {
      return <div className="missing_warning">Missing or Invalid: {m}</div>;
    });

    //year = year.getFullYear();
    return (
      <div>
        {self.state.error
          ? <div className="alert alert-danger">{self.state.errorMessage}</div>
          : <div />}
        <form
          method="POST"
          encType="application/x-www-form-urlencoded"
          id="createForm"
        >
          <div className="panel panel-default">
            <div className="panel-body create-form">
              <div className="form-group">
                <label className="required-label">Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  onChange={self.handleTitle}
                  className="form-control"
                  name="title"
                  value={self.state.title}
                  required
                />
              </div>
              <div className="form-group">
                <label className="required-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  onChange={self.handleDescription}
                  value={self.state.description}
                  placeholder="Description (Markdown Supported)"
                />
              </div>
              <div className="form-group">
                <label>DOI</label><br />
                <input
                  type="text"
                  value={doi}
                  readOnly
                  disabled
                  className="inp-80 form-control disabled"
                  name="doi"
                  required
                />
              </div>
              <div className="form-group">
                <label className="required-label">URL</label><br />
                <input
                  type="text"
                  value={url}
                  onChange={this.handleURL}
                  className="inp-80 form-control"
                  name="url"
                  required
                />
                <button className="btn btn-warning" onClick={self.generateURL}>
                  <div className="glyphicon glyphicon-refresh" /> Reset
                </button>
              </div>
              <AuthorsForm onAddAuthor={self.addAuthors} />
              <div className="form-group">
                <label>Keywords (Comma Separated) </label>
                <input
                  type="text"
                  placeholder="Keywords"

                  name="keywords"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="required-label">Publisher Year</label>
                <input
                  type="text"
                  placeholder="Publisher year"
                  value={year}
                  onChange={self.handleYear}
                  name="year"
                  className="form-control"
                  defaultValue={year}
                />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  value={"The Cancer Imaging Archive"}
                  name="publisher"
                  className="form-control readonly"
                  readOnly
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Resource Type</label>
                <input
                  type="text"
                  value={"DICOM"}
                  name="resource_type"
                  className="form-control readonly disabled"
                  readOnly
                  disabled
                />
              </div>
              <div className="form-group">
                <label>References </label>
                <textarea
                  name="references"
                  className="form-control"
                  placeholder="References (Markdown Supported)"
                />
              </div>
            </div>
          </div>
          {valid
            ? <div />
            : <div className="alert alert-danger">{Missing}</div>}

          {finalSubmit
            ? <div className="form-group">
                Please review the information and click the button to create DOI:
                <input
                  type="submit"
                  className="btn btn-primary"
                  value="Confirm"
                  onClick={self.onFinalSubmit}
                  {...finalSubmitDisableObj}
                />
              </div>
            : [
                valid
                  ? <div className="form-group">
                      <input
                        type="submit"
                        className="btn btn-primary"
                        onClick={self.onSubmit}
                      />
                    </div>
                  : <div className="form-group">
                      <input
                        type="submit"
                        className="btn btn-primary"
                        onClick={self.onSubmit}
                        title="Fill all required fields"
                        disabled="disabled"
                      />
                    </div>
              ]}

        </form>
      </div>
    );
  }
});

var App = React.createClass({
  render: function() {
    return (
      <div>
        <div id="header">
          <img src="images/tcia_logo_dark_sml.png" />
        </div>
        <div className="container col-md-8 col-md-offset-2" id="main">
          <div className="row" style={{ paddingLeft: "20px" }}>
            <div className="pagebar">
              <a href="index">Admin Dashboard</a>
              <span id="headlink_spacer"> &nbsp;&gt;&nbsp;</span>
              <a href="/createDOI">Create DOI</a>
            </div>
          </div>
          <h3 id="headline"> Create DOI</h3>
          <Form />
        </div>
      </div>
    );
  }
});

module.exports = Form;
module.exports = AuthorsForm;

ReactDOM.render(<App />, document.getElementById("app"));
