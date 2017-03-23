var React = require("react");
var ReactDOM = require("react-dom");
var jQuery = require("jquery");
var superagent = require("superagent");

var Citation = React.createClass({
    getInitialState: function(){
        return {doiCitation: null};
    },
    componentDidMount: function(){
        var self = this;
        var citationUrl = "api/getCitation?style=apa&lang=en-US&doi=";
        var doi = self.props.doi.slice(18,self.props.doi.length);
        console.log(doi);
        citationUrl+=doi;
        //citationUrl+=self.state.
        superagent.get(citationUrl)
            .withCredentials()
            .end(function(err, response){
                console.log(response);
                self.setState({doiCitation: (response.text).replace("\\n", "")});
            });
    },
    render: function() {
        var self= this;
        return( <div className="doiCitation">
                    {self.state.doiCitation ?
                        <div className="citation bg-info"> {self.state.doiCitation}</div>
                    :
                        <div className="message bg-danger">Loading Citation...</div>
                    }
                </div>);
    }   
});



var DOISmall = React.createClass({
    render: function() {
        var self = this;
        var data = self.props.data; 
        var authors = <div />;
        //console.log(data.authors.length);
        if(data.authors){
            if(data.authors.isArray){
                authors = data.authors.map(function(d){
                    return (<div>{d}</div>);
                });
            }
        }
        console.log(data.url);
        var doi = data.doi;
        var edit = "editDOI?doi="+data.doi;
        var resources_url = "createResources?doi="+data.doi;
        return (     
                <div className="doiSummary">
                    <div className="doiTitle">

                        <a href={"https://pubhub.cancerimagingarchive.net/details?doi="+encodeURI(data.doi)}><h4>{data.title}</h4></a>
                    </div>
                    <div className="btn-group resource_admin_buttons"> 
                        <a href={edit}><button type="button" className="btn btn-default">Edit Metadata</button></a>
                        <a href={resources_url}><button type="button" className="btn btn-default">Add Resources</button></a>
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


    getInitialState: function(){
        return {DOIs: null};
    },
    componentDidMount: function(){
        var self = this;
        //console.log("getting data"); 
        superagent.get("api/getAllDoi")
            .end(function(err, res){
                console.log(res);
                if(err){
                    //console.log(err);
                    self.setState({error: err});
                } else {
                    var response = JSON.parse(res.text);
                    console.log(response);
                    self.setState({DOIs: response});
                }
  
            });
    },
    render: function() {
        console.log("woot");
        console.log(this.state.DOIs);
        if(this.state.error){
            console.log("Error");
            return <div> Couldnt fetch data from the server</div>;
        }
        var count=0;
        console.log(this.state.DOIs);
        if(this.state.DOIs){
            var DOIs = this.state.DOIs;
            console.log(DOIs);
            var DOI = DOIs.map(function(doi) {
                count++;
                return <DOISmall data={doi} key={count}/>;
            });
            return <div> {DOI} </div>;
        } else {
            return (<div>Loading DOIs...</div>);
        }
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
                    <h3 id="headline"> PubHub Central</h3>

                    <a href="createDOI"><button type="button" className="btn btn-primary">Create DOI</button></a>
                    <div className="allDOIs">
                        <AllDOIs />
                    </div>
                </div>
            </div>

        )
    }  
});

ReactDOM.render(<App />, document.getElementById("app"));

