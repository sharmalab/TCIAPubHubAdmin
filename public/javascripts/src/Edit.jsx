var React = require("react");
var ReactDOM = require("react-dom");
var jQuery = require("jquery");
var superagent = require("superagent");



function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    //url = url.toLowerCase(); // This is just to avoid case sensitiveness
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}



var Form = React.createClass({
    getInitialState: function(){
        return {
            authors: ["#"],
            metadata: {
                "description": "",
                "keywords": "",
                "references": "",
                "year": "",
                "title": "",
                "namespace": {}
            }
        }
    },

    componentDidMount: function(){
        var self = this;
        var url = window.location.href;
        var doi = getParameterByName("doi", url);

        var url = "api/editDOI" + "?doi="+doi;
        console.log(url);
        superagent.get("/api/getDOINamespace")
          .end(function(e, d){
            superagent.get(url)
            .end(function(err,data){
                console.log("Data...");
                console.log(JSON.parse(data.text));
                var data = JSON.parse(data.text)[0];
                console.log(data);
                console.log(d);
                self.props.handleURLHost(d.body);
                self.setState({metadata: data, namespace: d});
            });
          });

    },
    getResources: function(resources) {
        console.log("main form");
        console.log(resources);
        this.setState({resources: resources});
    },
    addAuthors: function(e){

        e.preventDefault();
        var authors = this.state.authors;
        authors.push("");
        this.setState({authors: authors});
    },
    onSubmit: function(e){
        e.preventDefault();
        var formData = jQuery("#createForm").serializeArray();
        var resources = this.state.resources;
        console.log("----------");
        console.log(formData);
        console.log(resources);
        console.log("----------");
        //check that the form being submitted is valid
        var complete = (this.state.metadata["title"] &&
          this.state.metadata["description"] &&
          this.state.metadata["authors"] &&
          this.state.metadata["year"]);
        if (complete){
          var self = this;
          var postData = self.state.metadata;
          //var postData = formData.push(resources);
          //
          //
          //
          console.log("...");
          console.log(postData);

          jQuery.ajax({
              type: "POST",
              url: "api/editDOI",
              data: JSON.stringify(postData),
              success: function(res) {
                  //console.log(err);
                  console.log(res);
                  console.log("Submitted!");

                  var redir_doi = res.doi;
                  console.log(redir_doi);
                  window.location.href='index';
              },
              dataType: "json",
              contentType: "application/json"
          });
          console.log(postData);
        }
        else{
          // do something
          alert("Missing a Required Field")
        }

        //var fileData =
    },
    handleTitle: function(e){
        var self = this;
        var metaData = self.state.metadata;
        metaData.title = e.target.value;
        this.setState({metadata: metaData});
    },
    handleDescription: function(e){
        var self = this;
        console.log("adf");
        var metaData = self.state.metadata;
        metaData.description = e.target.value;
        this.setState({metadata: metaData});
    },

    handleAuthors: function(e){
        var self = this;
        var metaData = self.state.metadata;
        metaData.authors = e.target.value.split("; ");
        console.log("handling authors");
        console.log(metaData.authors);
        this.setState({metadata: metaData});

    },
    handleReferences: function(e){
        var self = this;
        var metaData = self.state.metadata;
        metaData.references = e.target.value;
        this.setState({metadata: metaData});
    },
    handleKeywords: function(e){
         var self = this;
        var metaData = self.state.metadata;
        metaData.keywords = e.target.value;
        this.setState({metadata: metaData});


    },
    handleYear: function(e){
        var self = this;
        var metaData = self.state.metadata;
        metaData.year = e.target.value;
        console.log(e.target.value);
        this.setState({metadata: metaData});


    },
    render: function(){
        var self = this;
        var authors = this.state.authors;
        var id=0;
        var Authors = authors.map(function(author){
            id++;
            return <input type="text" name="authors" className="form-control" key={id}/>;
        });
        console.log("Authors");
        if(self.state.metadata.authors){
        var authors_str = self.state.metadata.authors.join("; ");
        console.log(authors_str);
        }

       return ( <form action="/submitDOI" method="POST" encType="application/x-www-form-urlencoded" id="createForm">
            <div className="panel panel-default">
                <div className="panel-body">
                    <div className="form-group">
                        <label className="required-label">Title</label>
                        <input type="text" required placeholder="Title" className="form-control" name="title" value={self.state.metadata.title} onChange={self.handleTitle}/>
                    </div>
                    <div className="form-group">
                        <label className="required-label">Description</label>
                        <textarea name="description" required className="form-control" placeholder="Description (Markdown Supported)" value={self.state.metadata.description} onChange={self.handleDescription}></textarea>
                    </div>


                    <div className="form-group">
                        <label>DOI</label><br />
                        <input type="text" value={self.state.metadata.doi} readOnly disabled className="inp-80 form-control readonly" name="doi"/>
                    </div>
                    <div className="form-group">
                        <label>URL</label><br />
                        <input type="text" value={self.state.metadata.url} readOnly disabled className="inp-80 form-control readonly" name="url" />
                    </div>
                    <div className="form-group">
                        <label className="required-label">Authors (Semicolon Seperated)</label>
                        <input type="text"
                            placeholder="Authors"
                            name="authors"
                            className="form-control"
                            value={authors_str}
                            onChange={self.handleAuthors} />
                    </div>
                    <div className="form-group">
                        <label>Keywords (comma seperated)</label>
                        <input
                            type="text"
                            placeholder="Keywords"
                            name="keywords"
                            className="form-control"
                            value={self.state.metadata.keywords}
                            onChange ={self.handleKeywords} />
                    </div>
                    <div className="form-group">
                        <label className="required-label">Publisher Year</label>
                        <input type="text"
                            placeholder="Publisher year"
                            name="year"
                            className="form-control"
                            onChange={self.handleYear}
                            value={self.state.metadata.year}
                            required/>
                    </div>
                    <div className="form-group">
                        <label>Publisher</label>
                        <input type="text"
                            name="publisher"
                            className="form-control readonly"
                            disabled
                            readOnly
                            value={self.state.metadata.publisher}/>
                    </div>
                    <div className="form-group">
                        <label>Resource Type</label>
                        <input type="text"
                            placeholder="Resource Type"
                            name="resource_type"
                            className="form-control"
                            readOnly
                            disabled
                            value={self.state.metadata.resource_type}/>
                    </div>


                    <div className="form-group">
                        <label>References</label>
                        <textarea
                            name="references"
                            className="form-control"
                            placeholder="References (Markdown Supported)"
                            value={self.state.metadata.references}
                            onChange={self.handleReferences}></textarea>
                    </div>
                </div>
            </div>


            <div className="form-group">
                <input id="submit_btn" type="submit" className="btn btn-primary"  onClick={self.onSubmit}/>
            </div>

        </form>
        );
    }
});


var App = React.createClass({
    getInitialState: function(){
      return {"urlHost": ""};
    },
    handleURLHost: function(data){
      console.log(data.body);
      if(data.url_host){
      this.setState({"urlHost": data.url_host});
      }

    },
    render: function(){
        var self = this;
        return(
        <div>
            <div id="header">
                <img src="images/tcia_logo_dark_sml.png"/>
            </div>
            <div className="container col-md-8 col-md-offset-2" id="main">
                <div className="row" style={{"paddingLeft": "20px"}}>
                  <div className="pagebar">
                    <a href="index">Admin Page</a>
                    <span id="headlink_spacer"> &nbsp;>&nbsp;</span>
                    <a href="index">List of DOIs</a>
                    <span id="headlink_spacer"> &nbsp;>&nbsp;</span>
                    <a href={self.state.urlHost} >Edit DOI</a>
                  </div>
                </div>
                <h3 id="headline"> Edit DOI Metadata</h3>
                <Form handleURLHost={self.handleURLHost}/>
            </div>
        </div>
        )
    }
});

ReactDOM.render(<App />, document.getElementById("app"));
