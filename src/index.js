let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let port = 8080;
let csvModule = require('./csv');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

app.route("/csv")
.get(csvModule.getCsv)
.post(csvModule.postCsv)
  ;

app.listen(port);
console.log("Listening on port " + port);

module.exports = app; // for testing