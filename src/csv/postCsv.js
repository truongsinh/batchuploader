
const formidable = require('formidable');
const util = require('util');
const parse = require('csv-parse');
const fs = require('fs');
function postCsv(req, res) {
  // parse a file upload
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (!files.hasOwnProperty('csvFile')) {
      res.status(400);
      res.json({ "error": "no attachment" });
      return;
    }
    // @todo assume files.csvFile has "path
    let input = fs.createReadStream(files.csvFile.path, { encoding: "utf8" });
    let parser = parse();
    input.pipe(parser);
    let firstLineRead = false;
    // in the exact order of `name`, `email`, `phone no`, `image link`, `title`
    recordList = [];
    parser.on("readable", function () {
      let record;
      while (record = parser.read()) {
        if (!firstLineRead) {
          let err = validateColumn(record);
          if (err !== null) {
            res.status(400);
            res.json({ "error": err })
          }
          firstLineRead = true;
        }
        // @todo we can proceed immediately as well,
        // but for the time being, wait for "error" and "finish" event
        recordList.push(record);
      }
    })
    parser.on("error", function (err) {
      res.status(400);
      res.json({ "error": err.toString() })
    })
    parser.on("finish", function () {
      res.end();
    })
      ;
  });
  return;
}
function validateColumn(data) {
  // data[0] = "No" 
  if (data.length !== 6) {
    return "File should have exactly 6 columns"
  }
  let checkList = ["name", "email", "phone no", "image link", "title"];
  for (let index = 0; index < checkList.length; index++) {
    currentValue = checkList[index];
    if (data[index+1].toLowerCase() !== currentValue) {
      return `Missing column "${currentValue}"`;
    }
  }
  return null
}
exports.postCsv = postCsv;