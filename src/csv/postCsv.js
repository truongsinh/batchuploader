
const formidable = require('formidable');
const util = require('util');
function postCsv(req, res) {
  // parse a file upload
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if(!files.hasOwnProperty('csvFile')) {
      res.status(400);
      res.json({"error": "no attachment"});
    }
    res.end();
  });
  return;
}
exports.postCsv = postCsv;