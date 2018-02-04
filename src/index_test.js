process.env.NODE_ENV = 'test';

// let mongoose = require("mongoose");
// let Book = require('../app/models/book');

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('./index');

chai.use(chaiHttp);

describe('CSV', () => {
    beforeEach(() => {
    });
    describe('/GET', () => {
        it('says hello world', (done) => {
            chai.request(server)
                .get('/csv')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.key("hello")
                    expect(res.body["hello"]).to.equal("world");
                    done();
                });
        });
    });
});
