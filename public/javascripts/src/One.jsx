var React = require("react");
var ReactDOM = require("react-dom");

var App = React.createClass({
  render: function() {
    return (
      <div>
        <h4>Sup</h4>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById("app"));
