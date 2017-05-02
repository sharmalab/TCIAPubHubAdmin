var React = require("react");
var ReactDOM = require("react-dom");
var Dropzone = require("react-dropzone");
var jQuery = require("jquery");
var async = require("async");
var superagent = require("superagent");
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

window.jQuery = jQuery;

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

var AddResourcePanel = React.createClass({
    getInitialState: function() {
        return {resources :[], type: "", info: {}, selectType:"", files: {}, shared_list_name: ""};
    },
    showResources: function(e){
        e.preventDefault();
    },
    getResourceInfo: function(type, info){
        //console.log("Parent: "+type + val);
        //console.log({
        //console.log(type, info);
        //console.log("getting resources");
        //console.log(this.state.resources);
        var resources = this.state.resources;
        this.setState({"type": type, "info": info, resources: resources});
    },
    addResource: function(e) {
        e.preventDefault();
        //console.log("adding resource");
        var resources = this.state.resources.slice();
        var type = this.state.selectType;
        var info = {

            resourceData: this.state.resourceData,
            resourceName: this.state.resourceName,
            resourceDescription: this.state.resourceDescription
        };
        var files = this.state.files;
        if(type == "file"){
            var obj = {};
            obj[info.resourceData.name] = info.resourceData;
            //files.push(obj);
            //info.resourceData = info.resourceData.name;

        }
        //console.log("still inside addResource");
        var new_resource = {"type": type, "info": info};
        resources.push(new_resource);
        this.props.sendResourcesToParent(resources, files);
        this.setState({resources: resources, files: files, selectType: "", resourceName: "", resourceDescription: ""});
    },
    deleteResource: function(id){
        var index = id-1;
        //console.log(this.state);
        var resources = this.state.resources;
        resources.splice(index, 1);
        this.setState({resources: resources});
    },
    handleSelectResourceType: function(e){
        //console.log(e);
        //var self = this;
		//console.log(this.state.type);
        //console.log(e.target.value);
        //this.props.resourceType(e.target.value);
        this.setState({selectType: e.target.value});
    },
    handleURL: function(e) {
        //this.props.resourceInfoToSelector({"resourceData": e.target.value});
        this.setState({resourceData: e.target.value});
    },
    handleFile: function(f) {
        var file = f[0];
        //console.log(file);
        //console.log(file);
        //console.log(file.name);
        //this.props.resourceDataToSelector({"resourceData", file
        //this.props.resourceInfoToSelector({"resourceData": file});
        this.setState({resourceData: file, fileName: file.name});
    },
    handleSharedList: function(e){
      this.setState({shared_list_name: e.target.value, resourceData: e.target.value});
    },
    handleName: function(e){
        //console.log(e.target.value);
        //this.props.resourceInfoToSelector({"resourceName": e.target.value});
        this.setState({resourceName: e.target.value});
    },
    handleDescription: function(e){
        //this.props.resourceInfoToSelector({"resourceDescription": e.target.value});
        //console.log(e);
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
                <div>
                {
                    self.state.fileName ?

                    <div> Added <strong>{self.state.fileName}</strong>. Drop a file again to overwrite this. </div>
                    :
                    <div />
                }
                </div>
            </div>
            );
        } else if(selectType == "shared_list") {
            ResourceSpecificFields = (
                <div>
                    <label>Shared List Name: </label>
                    <input type="text" value={self.state.shared_list_name} onChange={self.handleSharedList} className="form-control"/>
                </div>
            );

        }


        var ResourceSelector =
        <div>
			<div className="form-group">
                <h4> Add new resources </h4>
                <label htmlFor="sel1">Select Type:</label>
                <select className="form-control" id="sel1" onChange={self.handleSelectResourceType} value={self.state.selectType}>
                    <option></option>
                    <option value="shared_list">Shared List</option>
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
                            <input type="text" value={self.state.resourceName} onChange={self.handleName} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Resource Description: </label>
                            <textarea value={self.state.resourceDescription} onChange={self.handleDescription} className="form-control" >
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

                <h5 className="list-group-item-heading">{res.info.resourceName} </h5>
                <div className="row">
                <p className="small" className="col-md-10">
                    {res.info.resourceDescription}
                </p>
                   <span className="resourceDelete col-md-1" aria-hidden="true" onClick={self.deleteResource.bind(self,id)} title="Delete resource"><span className="glyphicon glyphicon-remove"></span>
                   </span>
                </div>


            </li>
            );
        });
        return (
			<div>
            {
                resources.length ?
                    <label>Added Resources: </label>
                :
                    <div />
            }


                    <ul className="list-group">
                        <ReactCSSTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
                          {Resources}
                        </ReactCSSTransitionGroup>
                    </ul>

                {ResourceSelector}
                {
                    //<ResourceSelector  getResourceInfo={self.getResourceInfo}/>
                }
                <button className="btn btn-success" onClick={self.addResource}> Add Resource </button>
			</div>
        );
    }
});

function isInArray(value, array) {
      return array.indexOf(value) > -1;
}

var OldResources = React.createClass({
    getInitialState: function(){
        return {resources: [], selectedResources: []};
    },
    componentDidMount: function(){
        var self = this;
        var url = window.location.href;
        var doi = getParameterByName("doi", url);

        //var getRes = "http://localhost:3000/api/getResourcesForDOI?doi="+encodeURI(doi);
        //console.log(getRes);
        var getURL = "api/getResourcesForDOI?doi="+doi;
        jQuery.get(getURL, function(data){

            //console.log(data.doi[0]);
            var resources = data;
            console.log(data);
            console.log(resources);
            //console.log(resources);
            self.setState({resources: resources});
        });
    },
    handleCheck: function(e){
        var resourceID = e.target.value;
        var resources = this.state.selectedResources;
        var pos = resources.indexOf(resourceID);


        if(pos > -1){
            //Remove if exists
            resources.splice(pos,1);
        } else {
            //Add if doesnt exists
            resources.push(resourceID);
        }
        //console.log(resources);
        this.props.sendResourcesToParent(resources);
        this.setState({selectedResources: resources});
        //console.log(e.target.value);
    },
    render: function(){
        var self = this;
        var ResourceList = <div />;


        //console.log(self.state.resources);
        if(self.state.resources){
            var id = 0;
            ResourceList = self.state.resources.map(function(resource){
                id++;
                //console.log(resource);
                if(resource.resourceID){
                   // console.log(resource.resourceID);

                return <li className="list-group-item" key={id}>
							<div className="checkbox">
							<label>
							<input type="checkbox" id="cbox1" onClick={self.handleCheck} value={resource.resourceID}/>
							<h5 className="list-group-item-heading">{resource.info.resourceName}</h5>
                            <p className="list-group-item-text small">
                                {resource.info.resourceDescription}
                            </p>

							</label>
							</div>
                        </li>;
                } else
                    return <div key={id}/>;
            });
        }
        if(self.state.resources.length){

            console.log(self.state.resources.length);
            console.log(self.state.resources);
            return(
                <div>
                    <h4> Select Older Resources </h4>
                    <label>Older resources </label>
                    <div className="previousResources">

                        <div className="list-group">

                            {ResourceList}
                        </div>
                    </div>
                </div>
		    );
        } else {
            return <div />;
        }
    }

});

var App = React.createClass({
    getInitialState: function(){
        return {
            "previousResources": [],
            "addedResources": [],
            "files":[],
            "disableSubmit": {}
        };
    },
    getResources: function(resources, files){
        var self  = this;
        //console.log("in App");
        //console.log(resources);
        self.setState({"addedResources": resources, "files" :files});
    },
    getOldResources: function(resources){
        var self  = this;
        //console.log("in App");
        //console.log(resources);
        self.setState({"previousResources": resources});
    },
    onSubmit: function(e){
        var self = this;
        //Get a list of all the resources that were selected from previous version
        //

      self.setState({disableSubmit: {"disabled": "disabled"} });
        //
        var previousResources = self.state.previousResources;

        //Get a list of new added resources
        var addedResources = self.state.addedResources;
        var resources = {};




        console.log(payLoad);

        var ver_req = superagent.post("api/uploadFile");

        var files = [];
        for(var i in addedResources){
            var resource = (addedResources[i]);


            console.log(resource);
            console.log(self.state.files);
            if(resource.type == "file"){
                var obj = {};
                console.log(resource.info.resourceData);
                files.push({
                    "fileName": resource.info.resourceData.name,
                    "file": resource.info.resourceData
                });

                //obj[resource.info.resourceData.name] = resource.info.resourceData;
                //files.push(obj);
                resource.info.resourceData = resource.info.resourceData.name;
                addedResources[i] = resource;
                //ver_req.attach(resource.info.resourceData,
            }
            console.log(addedResources);
            console.log(files);
        }

        resources.previousResources = previousResources;
        resources.addedResources = addedResources;
        //var resources = previousResources.concat(addedResources);
        resources.doi = self.state.doi;

        var payLoad = resources;
        console.log(payLoad);
        ver_req.field("resources", JSON.stringify(payLoad));
        //ver_req.field("addedResources", JSON.stringify(addedResources));
        //ver_req.field("previousResources", JSON.stringify(previousResources));

        for(var i in files){
            var file = files[i];
            ver_req.attach(file.fileName, file.file);
        }

        ver_req.end(function(err, res){
            if(err){
              console.log("ERROR!");
              console.log(err);
            } else {
            console.log("Done uploaded files");
            window.location.href='index';

            }
        }).on("progress", function(e){
            console.log(e.percent);
        });


    },
    componentDidMount: function(){
        var url = window.location.href;
        var doi = getParameterByName("doi", url);
        this.setState({doi: doi});
    },
    render: function() {
        var self = this;
        var disableSubmit = self.state.disableSubmit;
        console.log("disable submit: ");
        console.log(disableSubmit);
        return(
        <div>
            <div id="header">
                <img src="images/tcia_logo_dark_sml.png"/>
            </div>
            <div className="container col-md-6 col-offset-3" id="main">
                <div className="row" style={{"paddingLeft": "20px"}}>
                  <a href="index" >Admin Page</a>
                  <span id="headlink_spacer"> &nbsp; |&nbsp; </span>
                  <a href="index" >List of DOIs</a>
                </div>
                <h3 id="headline"> Add Resources</h3>
				{

				}
                <div className="panel panel-default">
                    <div className="panel-body">

                        <OldResources sendResourcesToParent={self.getOldResources}/>
                        <AddResourcePanel sendResourcesToParent={self.getResources}/>
                    </div>
                </div>


                <div className="form-group">
                    {
                      disableSubmit ?
                        <input type="submit" className="btn btn-primary"  onClick={self.onSubmit} {...disableSubmit} />
                      :
                        <input type="submit" className="btn btn-primary" value="Submitting"  onClick={self.onSubmit} {...disableSubmit} />

                    }
                </div>
                </div>
        </div>
        );
    }

});

ReactDOM.render(<App />, document.getElementById("app"));
