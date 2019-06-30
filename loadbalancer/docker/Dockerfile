FROM node:12.5.0-slim
COPY ../package.json package.json
RUN set -uex; \
    npm install
    npm cache clean
COPY ../index.js index.js
CMD ["node", "index.js"]
