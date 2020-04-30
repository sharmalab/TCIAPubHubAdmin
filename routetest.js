
process.env.NODE_ENV = 'test';const request = require('supertest');
let mongoose = require("mongoose");


let index = require('../bin/www');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../routes/index');
let should = chai.should();
var config = require("../config.js");


chai.use(chaiHttp);


    describe('/POST DOI', () => {
       it('it should give correct json schema', (done) => {
           request(server)
             .post('/api/createDOI')
             .send({“formData”:[{“name”:“title”,“value”:“Salad”},{“name”:“description”,“value”:“Salad”},{“name”:“doi”,“value”:“10.5072/TCIA.2018.52h04el5”},{“name”:“url”,“value”:“http://localhost:3003/details?doi=10.5072/TCIA.2018.52h04el5“},{“name”:“keywords”,“value”:“”},{“name”:“year”,“value”:“2018"},{“name”:“publisher”,“value”:“The Cancer Imaging Archive”},{“name”:“resource_type”,“value”:“DICOM”},{“name”:“references”,“value”:“”},{“name”:“authors”,“value”:[“Salad,Salad”]}],“resources”:[]})
             .expect(200)
             .end(function(err, res) => {
                   res.should.have.status(200);

               done();
             });
       });
