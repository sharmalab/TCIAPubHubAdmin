FROM node:boron
MAINTAINER Ganesh Iyer <me@ganeshiyer.net>

# Clone 
git clone https://github.com/sharmalab/TCIAPubHubAdmin.git

WORKDIR TCIAPubHubAdmin
RUN npm install 
RUN npm install -g forever
#RUN forever start bin/www

EXPOSE 3001
CMD [ "node", "bin/www" ]
