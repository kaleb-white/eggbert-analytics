FROM python:3-alpine

RUN apk update
RUN apk add git bash nodejs npm gcompat

COPY . .

RUN npm i -g bun
RUN bun i
