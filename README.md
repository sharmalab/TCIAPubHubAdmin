# TCIA PubHub Admin

Admin panel for TCIA Pubhub

## Requirements

* Node.js
* Bindaas + MongoDB
* Python 2.7 and LibXML(yum install libxslt-devel libxml2-devel)
* Webpack 

## Installation: 


* git clone the repo
* Copy config.js.example to config.js
  * Set EZID username etc, bindaas api key and other parameters

* Edit `config.js` and set bindaas host etc. 

* `<sudo> npm install`
* `node bin/www` (Run with nohup etc.)
* Runs on `localhost:3000`

## Developers:

* `weback --watch` to watch and transpile JSX to js
