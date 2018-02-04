// @todo mock data will be replaced by DB call
let mockData = [
  {
    "_id": 5,
    "dateRange": {
      "start": new Date(2016, 2, 5, 6, 7, 8),
      "end": new Date(2016, 2, 5, 6, 8, 8),
    },
    "status": "completed",
    "entryCount": 8,
    "name": "Etihad",
  }
];

async function getBatch() {
  return new Promise((resolve)=>{
    resolve(mockData);
  });
}
exports.getBatch = getBatch;