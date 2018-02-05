const getBatch = require("./model").getBatch;
async function getCsv(req, res) {
  try {
    data = await getBatch();
    res.json({ error: null, data: data });
  }
  catch(err) {
    res.json({ error: err });
  }
}
exports.getCsv = getCsv;
