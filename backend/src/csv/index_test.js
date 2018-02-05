process.env.NODE_ENV = 'test';
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../index');
const processCsvLineModule = require("./processCsvLine");
const modelReset = require('./model').modelReset;

chai.use(chaiHttp);

describe('CSV', () => {
    beforeEach(() => {
    });
    describe('/GET', () => {
        beforeEach(() => {
            this.clock = sinon.useFakeTimers(9e11);
        })
        afterEach(() => {
            this.clock.restore();
            modelReset()
        })
        context("no processing", () => {

            it('returns data already in DB', (done) => {
                chai.request(server)
                    .get('/api/csv')
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.a('object');
                        expect(res.body).to.have.key("data", "error")
                        expect(res.body["data"]).to.have.length(1);
                        expect(res.body["data"][0]).to.deep.equal(
                            {
                                "_id": 5,
                                "dateRange": {
                                    "start": new Date(2016, 2, 5, 6, 7, 8).toISOString(),
                                    "end": new Date(2016, 2, 5, 6, 8, 8).toISOString(),
                                },
                                "status": "complete",
                                "entryCount": 8,
                                "name": "Etihad",
                            });
                        done();
                    });
            });
        });
        context("slow processing", () => {
            it('returns status incomplete of new batch', async () => {
                let input = new Buffer(`Sr.No,Name,email,Phone No,Image Link,Title
    1,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://drive.google.com/open?id=1fj7j15UiO3vneEGYKr2FQi7TqIkOLSq3,Stylefiles Junior
    2,Veena,shveena@rediffmail.com,9819828037,https://drive.google.com/open?id=1HEu1y4MMHbWhY2LQ1BqHXK8fUhBfIba3,Stylefiles Junior`);
                {
                    let res = await chai.request(server)
                        .post('/api/csv')
                        .field("name", "Zolo")
                        .attach('csvFile', input, 'mock.csv')
                        .send();
                    expect(res).to.have.status(200);
                    expect(res.body["error"]).to.be.null;
                }
                {
                    let res = await chai.request(server)
                        .get('/api/csv')
                        .send()
                        ;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.key("data", "error")
                    expect(res.body["data"]).to.have.length(2);
                    expect(res.body["data"][1]).to.deep.equal(
                        {
                            "_id": res.body["data"][1]._id,
                            "dateRange": {
                                "start": "1998-07-09T16:00:00.000Z",
                                "end": null,
                            },
                            "status": "incomplete",
                            "entryCount": 0,
                            "name": "Zolo",
                        });

                }
            });
        })
        context("near-immediate processing", () => {
            let processCsvLineStub;
            beforeEach(() => {
                processCsvLineStub = sinon.stub(processCsvLineModule, "processCsvLine");
                processCsvLineStub.callsFake(() => {
                    this.clock.tick(9e2)
                });
            })
            afterEach(() => {
                processCsvLineStub.restore();
            })

            it('returns status complete of new batch', async () => {
                let input = new Buffer(`Sr.No,Name,email,Phone No,Image Link,Title
1,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://drive.google.com/open?id=1fj7j15UiO3vneEGYKr2FQi7TqIkOLSq3,Stylefiles Junior
2,Veena,shveena@rediffmail.com,9819828037,https://drive.google.com/open?id=1HEu1y4MMHbWhY2LQ1BqHXK8fUhBfIba3,Stylefiles Junior`);
                {
                    let res = await chai.request(server)
                        .post('/api/csv')
                        .field("name", "Zulu")
                        .attach('csvFile', input, 'mock.csv')
                        .send()
                    expect(res).to.have.status(200);
                    expect(res.body["error"]).to.be.null;
                }
                {
                    let res = await chai.request(server)
                        .get('/api/csv')
                        .send();
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.key("data", "error")
                    expect(res.body["data"]).to.have.length(2);
                    expect(res.body["data"][1]).to.deep.equal(
                        {
                            "_id": res.body["data"][1]._id,
                            "dateRange": {
                                "start": "1998-07-09T16:00:00.000Z",
                                "end": "1998-07-09T16:00:01.800Z",
                            },
                            "status": "complete",
                            "entryCount": 2,
                            "name": "Zulu",
                        });
                }
            });
        })
    });
    describe('/POST', () => {
        let processCsvLineStub;
        beforeEach(() => {
            processCsvLineStub = sinon.stub(processCsvLineModule, "processCsvLine");
            processCsvLineStub.returns();
        })
        afterEach(() => {
            processCsvLineStub.restore();
        })
        context("unhappy flow", () => {
            it('returns error if there is no CSV file attached', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal("no attachment");
                        done();
                    })
            });
            it('returns error if there is no "name" field', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .attach('csvFile', Buffer.from(`Name,email,Phone No,Image Link,Title
Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal("no batch name");
                        done();
                    })
            });
            it('receives invalid CSV file, 5 columns only', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', Buffer.from(`Name,email,Phone No,Image Link,Title
Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal('File should have exactly 6 columns');
                        done();
                    })
            });
            it('receives invalid CSV file, 7 columns', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', Buffer.from(`No,ext,Name,email,Phone No,Image Link,Title
1,2,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal('File should have exactly 6 columns');
                        done();
                    })
            });
            // Name, Email, phone, Public google drive Image url, Image title
            it('receives invalid CSV file, mispell `name`', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', Buffer.from(`Sr.No,Nimi,email,Phone No,Image Link,Title
1,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal('Missing column "name"');
                        done();
                    })
            });
            it('receives invalid CSV file, mispell `email`', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', Buffer.from(`Sr.No,Name,electronic,Phone No,Image Link,Title
1,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal('Missing column "email"');
                        done();
                    })
            });
            it('receives invalid CSV file, mispell `phone no`', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', Buffer.from(`Sr.No,Name,email,Phne No,Image Link,Title
1,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal('Missing column "phone no"');
                        done();
                    })
            });
            it('receives invalid CSV file, mispell `image link`', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', Buffer.from(`Sr.No,Name,email,Phone No,Imge Link,Title
1,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal('Missing column "image link"');
                        done();
                    })
            });
            it('receives invalid CSV file, mispell `title`', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', Buffer.from(`Sr.No,Name,email,Phone No,Image Link,Ttle
1,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal('Missing column "title"');
                        done();
                    })
            });
            it('receives invalid CSV file, inconsistent columns', (done) => {
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', Buffer.from(`Sr.No,Name,email,Phone No,Image Link,Title
Rajeev,Rajiv.sonone@gmail.com,9930858518,https://example.com,Stylefiles Junior
`), 'mock.csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal('Error: Number of columns is inconsistent on line 2');
                        done();
                    })
            });
        })
        context("happy flow", () => {
            it('receives and processed single valid CSV file', (done) => {
                let input = new Buffer(`Sr.No,Name,email,Phone No,Image Link,Title
1,Rajeev,Rajiv.sonone@gmail.com,9930858518,https://drive.google.com/open?id=1fj7j15UiO3vneEGYKr2FQi7TqIkOLSq3,Stylefiles Junior
2,Veena,shveena@rediffmail.com,9819828037,https://drive.google.com/open?id=1HEu1y4MMHbWhY2LQ1BqHXK8fUhBfIba3,Stylefiles Junior
3,Neha,kaulneha01@gmail.com,9821339984,https://drive.google.com/open?id=1qkIHyuT4cfgBaNElAb7_B99aoZyCfz3k,Stylefiles Junior
4,Paresh,Paresh.shettigar@gmail.com,9773015182,https://drive.google.com/open?id=1uI7r3aM1woapTU39kjAwplZj5WwUNk1E,Stylefiles Junior
5,Aryan,terquois_klothing@yahoo.com,9820974645,https://drive.google.com/open?id=194aL9amhH6WisW27x08hu4TVOv-DKSRc,Stylefiles Junior
6,Navya,amitdhadda@yahoo.co.in,9867287922,https://drive.google.com/open?id=1shf810qVpge8vRNiK1VwQGzq6Djy8l61,Stylefiles Junior
7,Adi,simisajeev1978@yahoo.com,9892946488,https://drive.google.com/open?id=12WYIGAG-b5YW_B1CmAcaVNbowQ7q9LNx,Stylefiles Junior
8,Imraan,imran2.kh@gmail.com,9867408720,https://drive.google.com/open?id=1dFzn9HhfMaXcqlLnMbTSZrchw-xk1gx2,Stylefiles Junior
9,Sneha,6@shopholix.com,9819324081,https://drive.google.com/open?id=1e_0BIg5CPip4uXPCmkcMFsGVvFN4eX98,Stylefiles Junior
10,Promod,Panghag1976@gmail.com,9619118802,https://drive.google.com/open?id=1InSGbVwXuj2esYHlIf1WjgY7J2MqFkVN,Stylefiles Junior`);
                chai.request(server)
                    .post('/api/csv')
                    .field("name", "Zolo")
                    .attach('csvFile', input, 'mock.csv')
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body["error"]).to.be.null;
                        sinon.assert.callCount(processCsvLineStub, 10)
                        // @todo email should be case-isensitive
                        sinon.assert.calledWith(processCsvLineStub.getCall(0), "Rajeev", "Rajiv.sonone@gmail.com", "9930858518", "https://drive.google.com/open?id=1fj7j15UiO3vneEGYKr2FQi7TqIkOLSq3", "Stylefiles Junior")
                        sinon.assert.calledWith(processCsvLineStub.getCall(5), "Navya", "amitdhadda@yahoo.co.in", "9867287922", "https://drive.google.com/open?id=1shf810qVpge8vRNiK1VwQGzq6Djy8l61", "Stylefiles Junior")
                        sinon.assert.calledWith(processCsvLineStub.getCall(9), "Promod", "Panghag1976@gmail.com", "9619118802", "https://drive.google.com/open?id=1InSGbVwXuj2esYHlIf1WjgY7J2MqFkVN", "Stylefiles Junior")
                        done();
                    })
            });
        })
    });
});
