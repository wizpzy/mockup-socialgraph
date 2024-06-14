# base image
FROM node:18-alpine

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
COPY public /usr/src/app/public
COPY src /usr/src/app/src

RUN npm install
RUN npm install react-scripts -g

# start app
CMD ["npm", "start"]
