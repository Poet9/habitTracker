FROM node:latest
WORKDIR /src/index.js
COPY package.json /src/index.js
RUN npm install
COPY . /src/index.js
CMD ["npm", "start"]