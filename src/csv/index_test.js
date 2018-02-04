process.env.NODE_ENV = 'test';

// let mongoose = require("mongoose");
// let Book = require('../app/models/book');

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../index');

chai.use(chaiHttp);

describe('CSV', () => {
    beforeEach(() => {
    });
    describe('/GET', () => {
        it('says hello world', (done) => {
            chai.request(server)
                .get('/csv')
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.key("hello")
                    expect(res.body["hello"]).to.equal("world");
                    done();
                });
        });
    });
    describe('/POST', () => {
        context("unhappy flow", () => {
            it('returns error if there is no CSV file attached', (done) => {
                chai.request(server)
                    .post('/csv')
                    .end((err, res) => {
                        expect(err).not.to.be.null;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.key("error")
                        expect(res.body["error"]).to.equal("no attachment");
                        done();
                    })
            });
            it('receives invalid CSV file, 5 columns only', (done) => {
                chai.request(server)
                    .post('/csv')
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
                    .post('/csv')
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
                    .post('/csv')
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
                    .post('/csv')
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
                    .post('/csv')
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
                    .post('/csv')
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
                    .post('/csv')
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
                    .post('/csv')
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
        })
    });
});
