FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN npm install -g yarn@latest --force

RUN yarn install

COPY . .

EXPOSE 3000

CMD yarn migration:run && yarn start:dev