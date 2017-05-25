var express = require("express");
var app = express();
var path = require('path');


app.post("/api/createJNLP", function(req, res) {
  return res.json({
    jnlp: "/JNLP/foo"
  });
});

app.get("/api/createJNLP", function(req, res) {
  res.send("hi");
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
