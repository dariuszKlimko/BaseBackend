ARG FROM_IMAGE=18-slim

### Pack & Build

FROM node:${FROM_IMAGE} AS packer

RUN apt-get update && apt-get install -y wget

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV DIR /var/www
WORKDIR $DIR

# For Docker build cache
COPY app/package*.json app/yarn.* $DIR/
RUN yarn install && yarn link

COPY ./app $DIR

RUN yarn build

COPY docker/*-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["yarn", "start:dev"]

### Serve

FROM node:18-alpine

ENV DIR /app
WORKDIR $DIR

ENV NODE_ENV production

RUN apk add openssl

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY app/package*.json $DIR/
RUN yarn install --production && yarn link

COPY --from=packer /var/www/dist $DIR/dist

COPY docker/docker-entrypoint.sh /usr/local/bin/

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["yarn", "start:prod"]

