
const formidable = require('formidable');
const util = require('util');
const parse = require('csv-parse');
const fs = require('fs');
const model = require("./model");
// const processCsvLine = require("./processCsvLine").processCsvLine;
// cannot use the above line for testing purpose.
// Damn! ES6 import `import {processCsvLine} from "./processCsvLine" would have been great!
const processCsvLineModule = require("./processCsvLine")
function postCsv(req, res) {
  // parse a file upload
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (!files.hasOwnProperty('csvFile')) {
      res.status(400);
      res.json({ "error": "no attachment" });
      return;
    }
    if (!fields.hasOwnProperty('name')) {
      res.status(400);
      res.json({ "error": "no batch name" });
      return;
    }
    
    // @todo assume files.csvFile has "path"
    let input = fs.createReadStream(files.csvFile.path, { encoding: "utf8" });
    let parser = parse();
    input.pipe(parser);
    let firstLineRead = false;
    // in the exact order of `name`, `email`, `phone no`, `image link`, `title`
    recordList = [];
    let httpError;
    parser.on("readable", function () {
      let record;
      while (record = parser.read()) {
        if (!firstLineRead) {
          let err = validateColumn(record);
          if (err !== null) {
            res.status(400);
            res.json({ "error": err })
            httpError = err;
          }
          firstLineRead = true;
          return;
        }
        // @todo we can proceed immediately as well,
        // but for the time being, wait for "error" and "finish" event
        recordList.push(record);
      }
    })
    parser.on("error", function (err) {
      res.status(400);
      res.json({ "error": err.toString() });
      httpError = err;
    })
    parser.on("finish", async function () {
      if(httpError) {
        return;
      }
      res.json({ "error": null });
      // res.json({ "error": null })
      // recordList.forEach(async (record) => {
      //   // in the exact order of `name`, `email`, `phone no`, `image link`, `title`
      //   return processCsvLine(record[0],record[1],record[2],record[3],record[4])
      // })
      let batchId = model.createBatch(fields.name);
      for (let index=0; index<recordList.length; index++) {
        let record = recordList[index];
        // in the exact order of `name`, `email`, `phone no`, `image link`, `title`
        await processCsvLineModule.processCsvLine(record[1],record[2],record[3],record[4],record[5])
      }
      model.updateBatchComplete(batchId);
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