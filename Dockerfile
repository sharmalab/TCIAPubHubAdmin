FROM node:boron
MAINTAINER Ganesh Iyer <me@ganeshiyer.net>

WORKDIR TCIAPubHubAdmin

# Clone
COPY ./ ./

RUN apt-get update
RUN apt-get -q -y install python-lxml


RUN npm install
RUN npm install -g forever
RUN npm install -g webpack@3
RUN webpack
#RUN forever start bin/www

EXPOSE 3001
CMD [ "forever", "bin/www" ]
