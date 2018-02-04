// @todo mock data will be replaced by DB call
let mockData;
function modelReset() {
  mockData = {
    "5": {
      "_id": 5,
      "dateRange": {
        "start": new Date(2016, 2, 5, 6, 7, 8),
        "end": new Date(2016, 2, 5, 6, 8, 8),
      },
      "status": "completed",
      "entryCount": 8,
      "name": "Etihad",
    }
  };
}
modelReset();
exports.modelReset = modelReset; // testing purpose

async function getBatch() {
  return new Promise((resolve) => {
    resolve(Object.values(mockData));
  });
}
exports.getBatch = getBatch;
async function createBatch(name) {
  const id = generateId();
  mockData[id] = {
    "_id": generateId(),
    "dateRange": {
      "start": new Date(2016, 2, 5, 6, 7, 8),
      "end": null,
    },
    "status": "incomplete",
    "entryCount": 0,
    "name": name,
  };
}
exports.createBatch = createBatch;

function generateId() {
  const min = 1;
  const max = 0xffff;
  return Math.floor(Math.random() * (max - min)) + min;
}

async function updateBatchComplete(bathId) {

}
exports.updateBatchComplete = updateBatchComplete;
