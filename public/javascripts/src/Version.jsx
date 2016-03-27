var React = require("react");
var ReactDOM = require("react-dom");
var Dropzone = require("react-dropzone");
var jQuery = require("jquery");

window.jQuery = jQuery;

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness  
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}



var ResourceInfo = React.createClass({
    getInitialState: function(){
        return ({url: "", name: "", description: "" });
    },
    handleURL: function(e) {
        this.props.resourceInfoToSelector({"resourceData": e.target.value});
        this.setState({url: e.target.value});
    },
    handleFile: function(f) {
        var file = f[0]; 
        this.props.resourceInfoToSelector({"resourceData": file});
        this.setState({file: file});
    },
    handleName: function(e){
        //console.log(e.target.value);
        this.props.resourceInfoToSelector({"resourceName": e.target.value});
        this.setState({name: e.target.value});
    },
    handleDescription: function(e){
        this.props.resourceInfoToSelector({"resourceDescription": e.target.value});
        this.setState({description: e.target.value});
    },
    render: function() {
        var type = this.props.type;
        var self = this;
        var ResourceSpecificFields = <div />;
        //this.setState({type: type});
        if(type == ""){
            ResourceSpecificFields= <div />;
        } else if(type == "url") {
            ResourceSpecificFields = (
                <div>
                    <label>URL: </label>
                    <input type="text" value={self.state.url} onChange={self.handleURL} className="form-control"/>
                </div>
            );
        } else if(type == "file") {
            ResourceSpecificFields = (
            <div>
                <Dropzone style={{width: "100%", height: "60px", padding: "10px", border: "1px dashed #333"}} onDrop={this.handleFile}>
                    <div> Drop file here </div>
                </Dropzone>
            </div>
            );
        }

        return (
            <div>
                {self.props.type ?
                <div>
                    <div className="form-group">
                        <label>Resource Name: </label>
                        <input type="text" value={self.state.name} onChange={self.handleName} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Resource Description: </label>
                        <textarea value={self.state.description} onChange={self.handleDescription} className="form-control" >
                        </textarea>
                    </div>
                    {ResourceSpecificFields}
                </div>
                :
                 <div />
                }
            </div>
        );
    }
});

var ResourceSelector = React.createClass({
    getInitialState: function() {
        return {type: "", resourceInfo: {}};
    },
    handleSelect: function(e) { 
        console.log(e);
        //var self = this;
		//console.log(this.state.type);
        console.log(e.target.value);	
        //this.props.resourceType(e.target.value);
        this.setState({type: e.target.value});
    },
    getResourceInfo: function(info) {
        //console.log(info);    
        var resourceInfo = this.state.resourceInfo;
        //console.log(resourceInfo)
        //resourceInfo["info"] = info;
        jQuery.extend(resourceInfo, info);
        //console.log(resourceInfo);
        this.props.getResourceInfo(this.state.type, resourceInfo);
        this.setState({resourceInfo: resourceInfo});
    },
    onURL: function(e){
        //console.log(e);
       // this.setState({url: e.target.value});
    },
    render: function(){
        var self = this;
        //console.log(this.state.type);
        return(
		<div>
			<div className="form-group">
                <label htmlFor="sel1">Select Type:</label>
                <select className="form-control" id="sel1" onChange={self.handleSelect} value={self.state.type}>
                    <option></option>
                    <option value="url" >URL</option>
                    <option value="image">Image</option>
                    <option value="file" >File</option>
                </select>
			</div>	
            <div className="form-group">
                <ResourceInfo type={self.state.type} resourceInfoToSelector={self.getResourceInfo}/>
            </div>
		</div>
        );
    }
});

var AddResourcePanel = React.createClass({
    getInitialState: function() {
        return {resources :[], type: "", info: {}, selectType:""};
    },
    showResources: function(e){
        e.preventDefault();
    },
    getResourceInfo: function(type, info){
        //console.log("Parent: "+type + val);
        //console.log({
        console.log(type, info);
        console.log("getting resources");
        console.log(this.state.resources);
        var resources = this.state.resources;
        this.setState({"type": type, "info": info, resources: resources});
    },
    addResource: function(e) {
        e.preventDefault();
        console.log("adding resource");
        var resources = this.state.resources.slice();
        var type = this.state.selectType;
        var info = {
            
            resourceData: this.state.resourceData,
            resourceName: this.state.resourceName,
            resourceDescription: this.state.resourceDescription
        };
        console.log("still inside addResource");
        var new_resource = {"type": type, "info": info};
        resources.push(new_resource);
        this.props.sendResourcesToParent(resources);
        this.setState({resources: resources});
    },
    deleteResource: function(id){
        var index = id-1;
        console.log(this.state);
        var resources = this.state.resources;
        resources.splice(index, 1);
        this.setState({resources: resources});
    },
    handleSelectResourceType: function(e){
        console.log(e);
        //var self = this;
		//console.log(this.state.type);
        console.log(e.target.value);	
        //this.props.resourceType(e.target.value);
        this.setState({selectType: e.target.value});
    },
    handleURL: function(e) {
        //this.props.resourceInfoToSelector({"resourceData": e.target.value});
        this.setState({resourceData: e.target.value});
    },
    handleFile: function(f) {
        var file = f[0]; 
        this.props.resourceInfoToSelector({"resourceData": file});
        this.setState({file: file});
    },
    handleName: function(e){
        //console.log(e.target.value);
        //this.props.resourceInfoToSelector({"resourceName": e.target.value});
        this.setState({resourceName: e.target.value});
    },
    handleDescription: function(e){
        //this.props.resourceInfoToSelector({"resourceDescription": e.target.value});
        this.setState({resourceDescription: e.target.value});
    },
    render: function(){
        var self = this;
        var resources = self.state.resources;
        var selectType = self.state.selectType;
        var id = 0;
        var ResourceSpecificFields = <div />;
        if(selectType == ""){
            ResourceSpecificFields= <div />;
        } else if(selectType == "url") {
            ResourceSpecificFields = (
                <div>
                    <label>URL: </label>
                    <input type="text" value={self.state.url} onChange={self.handleURL} className="form-control"/>
                </div>
            );
        } else if(selectType == "file") {
            ResourceSpecificFields = (
            <div>
                <Dropzone style={{width: "100%", height: "60px", padding: "10px", border: "1px dashed #333"}} onDrop={this.handleFile}>
                    <div> Drop file here </div>
                </Dropzone>
            </div>
            );
        }


        var ResourceSelector = 		
        <div>
			<div className="form-group">
                <label htmlFor="sel1">Select Type:</label>
                <select className="form-control" id="sel1" onChange={self.handleSelectResourceType} value={self.state.selectType}>
                    <option></option>
                    <option value="url" >URL</option>
                    <option value="image">Image</option>
                    <option value="file" >File</option>
                </select>
			</div>	
            <div className="form-group">
                <div>
                    {self.state.selectType ?
                    <div>
                        <div className="form-group">
                            <label>Resource Name: </label>
                            <input type="text" value={self.state.name} onChange={self.handleName} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Resource Description: </label>
                            <textarea value={self.state.description} onChange={self.handleDescription} className="form-control" >
                            </textarea>
                        </div>
                        {ResourceSpecificFields}
                    </div>
                    :
                     <div />
                    }
                </div>

            </div>
		</div>;

        var Resources = resources.map(function(res){
            id++;
            return (
            <li className="list-group-item" key={id}> 

                <span className="resourceType">{res.type} </span>
                {
                    res.type == "file"
                    ?
                         <span>{res.val.resourceName} </span>
                    :
                        <span>{res.info.resourceData}</span>
                }
                   <span className="resourceDelete" aria-hidden="true" onClick={self.deleteResource.bind(self,id)} title="Delete resource">⛔ </span>


            </li>
            );
        });
        return (
			<div>
            {
                resources.length ?
                    <label> Resources </label>
                : 
                    <div />
            }
                
                <ul className="list-group">{Resources}</ul>
                {ResourceSelector}
                {
                    //<ResourceSelector  getResourceInfo={self.getResourceInfo}/>
                }
                <button className="btn btn-success" onClick={self.addResource}> Add Resource </button>
			</div>
        );
    }
});

var OldResources = React.createClass({
    getInitialState: function(){
        return {resources: null};
    },
    componentDidMount: function(){
        var self = this;
        var url = window.location.href;
        var doi = getParameterByName("doi", url);

        //var getRes = "http://localhost:3000/api/getResourcesForDOI?doi="+encodeURI(doi);
        //console.log(getRes);
        var getURL = "http://localhost:3000/api/getResourcesForDOI?doi=http://dx.doi.org/10.5072/FK22014JdnHkevY";
        jQuery.get(getURL, function(data){
            //console.log(data.doi[0]);
            var resources = data.doi[0].resources;
            //console.log(resources);
            self.setState({resources: resources});
        });
    },
    render: function(){
        var self = this;
        var ResourceList = <div />;
        if(self.state.resources){
            var id = 0;
            ResourceList = self.state.resources.map(function(resource){
                id++;
                console.log(resource);
                return <li className="list-group-item" key={id}>
							<div className="checkbox">
							<label>
							<input type="checkbox" id="cbox1" />
							{resource.type}
							</label>
							</div>
                        </li>;
            });
        }
        return(<div className="list-group">
        {
				
				ResourceList
			}
			</div>
		);
    }

});

var App = React.createClass({
    getResources: function(resources){
        
        //console.log("in App");
        //console.log(resources);
        //self.setState({"addedResources": resources});
    },
    onSubmit: function(){  
        //Get a list of all the resources that were selected from previous version
        //
        var previousResource = [];

        //Get a list of new added resources
        var addedResources = self.state.addedResources;

        


    },
    render: function() {
        var self = this;
        return(
        <div>
            <div id="header">
                <img src="images/tcia_logo_dark_sml.png"/>
            </div>
            <div className="container col-md-6 col-offset-3" id="main">
                <h3 id="headline"> Create Version</h3>
				{

				}
                <div className="panel panel-default">
                    <div className="panel-body">
                        <h4> Data </h4>
						
                        <OldResources />
                        <AddResourcePanel sendResourcesToParent={self.getResources}/>
                    </div>
                </div>


                <div className="form-group">
                    <input type="submit" className="btn btn-primary"  onClick={self.onSubmit}/>
                </div>
                </div>
        </div>
        );
    }

});

ReactDOM.render(<App />, document.getElementById("app"));

