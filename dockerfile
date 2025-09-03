FROM python:3-alpine

RUN apk update
RUN apk add git bash nodejs npm gcompat

COPY . .

RUN rm -r package-lock.json
RUN npm i
RUN npm i -g bun
