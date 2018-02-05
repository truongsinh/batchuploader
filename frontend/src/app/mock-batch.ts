// @todo cannot move batchModel type to its own file
type batchModel = {
    "_id": number,
    "dateRange": {
        "start": Date,
        "end": Date,
    },
    "status": "completed" | "incomplete" | "error",
    "entryCount": number,
    "name": string,
};

export const batches: batchModel[] = [
    {
        "_id": 5,
        "dateRange": {
            "start": new Date(2016, 2, 5, 6, 7, 8),
            "end": new Date(2016, 2, 5, 6, 8, 8),
        },
        "status": "completed",
        "entryCount": 8,
        "name": "Etihad",
    },
    {

        "_id": 264,
        "dateRange": {
            "start": new Date(1998, 6, 9, 16, 0, 0),
            "end": null,
        },
        "status": "incomplete",
        "entryCount": 0,
        "name": "Zolo",
    },
  ];