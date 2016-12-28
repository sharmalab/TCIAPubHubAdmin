var React = require("react");
var ReactDOM = require("react-dom");
var jQuery = require("jquery");

var ReactCSSTransitionGroup = require('react-addons-css-transition-group') // ES5 with npm


var AuthorsForm = React.createClass({
  getInitialState: function() {
    return {"authors": ["#"], value: []};
  },
  add: function(e) {
    e.preventDefault();
    var authors = this.state.authors;
    console.log(this.state.lastAuthor);
    //authors.unshift(this.state.lastAuthor);
    authors.push("#");
    console.log(e);
    console.log("add author");
    console.log(authors);
    //authors.push
    this.setState({authors: authors});
  },
  removeAuthor: function(id){
    console.log(id);
    console.log('eerer');
    var authors = this.state.authors;
    authors.pop();
    console.log(authors);
    this.setState({authors: authors});
  },
  lastAuthor: function(e){
    console.log(e.target.value);
    var lastAuthor = e.target.value;
    var authors = this.state.authors;
    authors[authors.length - 1] = lastAuthor;
    this.setState({lastAuthor: e.target.value, authors: authors});
  },
  remove_item: function(i,e){
    e.preventDefault(); 
    //var new_state = this.state.value.concat([]);
    var value = this.state.value;
    value.splice(i, 1);
    console.log(i)
    console.log(value);
    //new_state[i] = undefined;
    this.setState({value: value});
  },
  add_more: function(e) {
    e.preventDefault();
    var new_val = this.state.value.concat([]);
    var authors = new_val;
    new_val.push('');
    console.log(new_val);
    this.props.onAddAuthor(authors);
    this.setState({value: new_val});
  },
  handleChange: function(id, e){
//    console.log(id);
    var vals = this.state.value;
    vals[id]  = e.target.value;

//    console.log(e.target.value);
    this.setState({value: vals});
  },
  render: function() {
    var self  = this;
    var authors = this.state.authors;
    var authorIds = -1;
    var Inputs = this.state.value.map(function(e,i){

      authorIds++;
      return (
      <div key={i} className="inputAuthor">
        <input type="text" className="form-control" defaultValue={e} onChange={self.handleChange.bind(this,authorIds)} value={e} />
        <button onClick = {self.remove_item.bind(null,i)} className="btn btn-danger"><div className="glyphicon glyphicon-remove"> </div>Remove </button>
      </div>
      )
    });

    return (
      <div className="form-group">
          <label>Authors</label>
          <ReactCSSTransitionGroup 
            transitionName="example"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
          {Inputs}
          </ReactCSSTransitionGroup>
          <button onClick={this.add_more} className="btn btn-success"><div className="glyphicon glyphicon-plus"></div> Add Author</button>
      </div>
    );
  }
});

var Form = React.createClass({
    getInitialState: function(){
        return {authors: ["#"], resources: []};
    },
    getResources: function(resources) {
        console.log("main form");
        console.log(resources);
        this.setState({resources: resources});
    },
    addAuthors: function(authors){
        console.log(authors);
        //e.preventDefault();
        //var authors = this.state.authors;
        //authors.push("");
        this.setState({authors: authors});
    },
    onSubmit: function(e){
        e.preventDefault();
        var formData = jQuery("#createForm").serializeArray();
        var resources = this.state.resources;
        console.log("----------");
        console.log(formData);
        console.log(resources);
        var auth = {
          "name": "authors",
          "value": this.state.authors
        };
        formData.push(auth)
        console.log(this.state.authors);
        console.log("----------");
        var postData = {
            "formData": formData,
            "resources": resources
        };
        //var postData = formData.push(resources);
        //i

        
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
                window.location.href='index';
            },
            dataType: "json",
            contentType: "application/json"
        });
        
        console.log(postData);
    
        //var fileData = 
    },
    render: function(){
        var self = this;
        var authors = this.state.authors;
        var id=0;
        /*
        var Authors = authors.map(function(author){
            id++;
            return <input type="text" name="authors" className="form-control" key={id}/>;
        });
        */
       return ( <form  method="POST" encType="application/x-www-form-urlencoded" id="createForm">
            <div className="panel panel-default"> 
                <div className="panel-body">
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" placeholder="Title" className="form-control" name="title" required/>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" className="form-control" placeholder="Description(Markdown supported)"></textarea>
                    </div>
                    <AuthorsForm onAddAuthor={self.addAuthors}/>
                    <div className="form-group">
                        <label>Keywords: </label>
                        <input type="text" placeholder="Keywords(comma seperated)" name="keywords" className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Publisher Year</label>
                        <input type="text" placeholder="Publisher year" name="year" className="form-control"/>
                    </div>
                    <div className="form-group">
                        <label>References: </label>
                        <textarea name="references" className="form-control" placeholder="References(Markdown supported)"></textarea> 
                    </div>
                </div>
            </div>


            <div className="form-group">
                <input type="submit" className="btn btn-primary"  onClick={self.onSubmit}/>
            </div>
            
        </form>
        );
    }
});


var App = React.createClass({
    

    render: function(){

        return(
        <div>
            <div id="header">
                <img src="images/tcia_logo_dark_sml.png"/>
            </div>
            <div className="container col-md-8 col-md-offset-2" id="main">

                <div className="row" style={{"paddingLeft": "20px"}}>
                    <a href="index" >Dashboard</a>
                </div>
                <h3 id="headline"> Create DOI</h3>
                <Form />
            </div>
        </div>
        )
    }  
});

ReactDOM.render(<App />, document.getElementById("app"));

