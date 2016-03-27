var React = require("react");
var ReactDOM = require("react-dom");

var App = React.createClass({
    render: function() {

        return(
        <div>
            <div id="header">
                <img src="images/tcia_logo_dark_sml.png"/>
            </div>
            <div className="container col-md-6 col-offset-3" id="main">
                <h3 id="headline"> Create DOI</h3>
                <Form />
            </div>
        </div>
        );
    }

});

ReactDOM.render(<App />, document.getElementById("app"));

