

process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
const request = require('request');

let index = require('../bin/www');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app.js');
let should = chai.should();
var config = require("../config.js");


chai.use(chaiHttp);

    describe('/PUT DOI', () => {
       it('it should check the metadata with the datacite', (done) => {

           chai.request(server)
             .post('/api/checkmetadataa')
             .send({"formData":[{"name":"title","value":"testtest"},{"name":"description","value":"Salad"},{"name":"doi","value":"10.5072/TCIA.2018.54m74el8"},{"name":"url","value":"http://localhost:3003/details?doi=10.5072/TCIA.2018.54m74e18"},{"name":"keywords","value":""},{"name":"year","value":"2018"},{"name":"publisher","value":"The Cancer Imaging Archive"},{"name":"resource_type","value":"DICOM"},{"name":"references","value":""},{"name":"authors","value":["Salad,Salad"]}],"resources":[]})

             .end((err, res) => {
                   res.should.have.status(200);

            
                  var str1='_target: http://localhost:3003/details?doi=10.5072/TCIA.2018.54m74e18\ndatacite: <?xml version=\'1.0\' encoding=\'utf-8\'?><resource xmlns="http://datacite.org/schema/kernel-4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://datacite.org/schema/kernel-4 https://schema.datacite.org/meta/kernel-4.0/metadata.xsd"><identifier identifierType="DOI">10.5072/TCIA.2018.54m74el8</identifier><resourceType resourceTypeGeneral="Dataset" /><creators><creator><creatorName>Salad,Salad</creatorName></creator></creators><titles><title>testtest</title></titles><publisher>The Cancer Imaging Archive</publisher><publicationYear>2018</publicationYear><contributors><contributor contributorType="DataCurator"><contributorName>TCIA Team</contributorName><affiliation>The Cancer Imaging Archive</affiliation></contributor></contributors><descriptions><description descriptionType="Abstract">Salad</description></descriptions></resource>'
console.log("---------------------------------------------------------------------------------------");
console.log(res.text.datacite);console.log(res);
                   var str2=res.text;
                   if(str1===str2) {
                console.log("Equal");  // They are equal so this line will print
                  } else {
              console.log("Not equal");
                }

               done();
             });
       });

     });
     describe('/PUT DOI', () => {
        it('it should give correct and unique json schema', (done) => {
            chai.request(server)
              .post('/api/checkmetaDOI')
              .send({"formData":[{"name":"title","value":"testtest"},{"name":"description","value":"Salad"},{"name":"doi","value":"10.5072/TCIA.2018.53m74el8"},{"name":"url","value":"http://localhost:3003/details?doi=10.5072/TCIA.2018.53h79el5"},{"name":"keywords","value":""},{"name":"year","value":"2018"},{"name":"publisher","value":"The Cancer Imaging Archive"},{"name":"resource_type","value":"DICOM"},{"name":"references","value":""},{"name":"authors","value":["Salad,Salad"]}],"resources":[]})
              .end((err, res) => {
                    res.should.not.have.status(500);
                    console.log(res);

                done();
              });
        });
      });
    describe('/PUT DOI', () => {
       it('it should give correct and unique json schema', (done) => {
           chai.request(server)
             .post('/api/createDOI')
             .send({"formData":[{"name":"title","value":"testtest"},{"name":"description","value":"Salad"},{"name":"doi","value":"10.5072/TCIA.2018.53m74el8"},{"name":"url","value":"http://localhost:3003/details?doi=10.5072/TCIA.2018.53h79el5"},{"name":"keywords","value":""},{"name":"year","value":"2018"},{"name":"publisher","value":"The Cancer Imaging Archive"},{"name":"resource_type","value":"DICOM"},{"name":"references","value":""},{"name":"authors","value":["Salad,Salad"]}],"resources":[]})
             .end((err, res) => {
                   res.should.have.status(200);

               done();
             });
       });
     });
     describe('/PUT DOI', () => {
        it('it should have unique DOI', (done) => {
            chai.request(server)
              .post('/api/createDOI')
              .send({"formData":[{"name":"title","value":"Salad"},{"name":"description","value":"Salad"},{"name":"doi","value":"10.5072/TCIA.2018.53h79el8"},{"name":"url","value":"http://localhost:3003/details?doi=10.5072/TCIA.2018.53h79el5"},{"name":"keywords","value":""},{"name":"year","value":"2018"},{"name":"publisher","value":"The Cancer Imaging Archive"},{"name":"resource_type","value":"DICOM"},{"name":"references","value":""},{"name":"authors","value":["Salad,Salad"]}],"resources":[]})
              .end((err, res) => {
                    res.should.have.status(400);

                done();
              });
        });
      });

     describe('/GET/:id DOI', () => {
       it('it should not give the error status 500 and shouls have status 200', (done) => {
               chai.request(server)
             .get('/api/getDoi?doi=10.5072/FK2.2018.8irilt7v')

             .end((err, res) => {
                res.should.not.have.status(500);
                  res.should.have.status(200);
               done();
             });
           });

       });



         describe('/GET/:all the DOI', () => {
           it('it should not give the error status 500', (done) => {
                   chai.request(server)
                 .get('/api/getAllDoi')

                 .end((err, res) => {
                    res.should.not.have.status(500);
                   done();
                 });
               });

           });

                  describe('/GET/:versions for DOI', () => {
                    it('it should not give the error status 404', (done) => {
                            chai.request(server)
                          .get('/api/getVersionsForDoi?doi=10.5072/FK2.2018.8irilt7v')

                          .end((err, res) => {
                             res.should.not.have.status(404);console.log(res);
                            done();
                          });
                        });

                    });
                    describe('/GET/:getResourcesForDoi for DOI', () => {
                      it('it should not give the error status 500', (done) => {
                              chai.request(server)
                            .get('/api/getResourcesForDoi?doi=10.5072/FK2.2018.8irilt7v')

                            .end((err, res) => {
                               res.should.not.have.status(500);
                              done();
                            });
                          });

                      });
                      describe('/GET/:getResources ', () => {
                        it('it should not give the error status 404', (done) => {
                                chai.request(server)
                              .get('/api/getResourcesForDoi?doi=10.5072/FK2.2018.8irilt7v')

                              .end((err, res) => {
                                 res.should.not.have.status(404);
                                   res.should.have.status(200);
                                done();
                              });
                            });

                        });
                      describe('/GET/:getcitationsForDoi for DOI', () => {
                        it('it should give the status code 200', (done) => {
                                chai.request(server)
                              .get('/api/getCitation?style=apa&lang=en-US&doi=10.5072/FK2.2018.8irilt7v')

                              .end((err, res) => {
                              res.should.have.status(200);
                                done();
                              });
                            });

                        });
