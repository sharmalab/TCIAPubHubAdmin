var React = require("react");
var ReactDOM = require("react-dom");
var jQuery = require("jquery");

var Form = React.createClass({
    getInitialState: function(){
        return {authors: ["#"], resources: []};
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
        var postData = {
            "formData": formData,
            "resources": resources
        };
        //var postData = formData.push(resources);
        //
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
        var Authors = authors.map(function(author){
            id++;
            return <input type="text" name="authors" className="form-control" key={id}/>;
        });

       return ( <form action="submitDOI" method="POST" encType="application/x-www-form-urlencoded" id="createForm">
            <div className="panel panel-default"> 
                <div className="panel-body">
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" placeholder="Title" className="form-control" name="title"/>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" className="form-control" placeholder="Description(Markdown supported)"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Authors</label>
                        <input type="text" placeholder="Authors(semicolon seperated)" name="authors" className="form-control" />
                    </div>
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

