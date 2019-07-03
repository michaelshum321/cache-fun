FROM node:12.5.0
WORKDIR /usr/src/app
COPY package.json ./package.json
RUN npm install
COPY index.js ./index.js
EXPOSE 8080
CMD ["node", "index.js"]
