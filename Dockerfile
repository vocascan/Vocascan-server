FROM node:14-alpine as builder

RUN apk add --no-cache build-base python

WORKDIR /build

COPY ./package*.json ./

RUN npm i --only=production --sqlite

FROM node:14-alpine

WORKDIR /app

COPY --from=builder /build/node_modules /app/node_modules

COPY . .

CMD ["npm", "run", "start"]
