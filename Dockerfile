FROM node:18-alpine
USER root
RUN addgroup -g 20000 app && adduser -u 20000 -G app -D app -s /bin/bash
WORKDIR /user/src/app
COPY . .
RUN apk add --update --no-cache py3-pip
RUN ln -sf python3 /usr/bin/python
RUN apk add py3-setuptools

WORKDIR /user/src/app/python
RUN apk add py3-requests py3-beautifulsoup4

# Volte para o diretório raiz
WORKDIR /user/src/app
RUN npm install
RUN yarn add cors morgan

USER app
CMD npm run serve

EXPOSE 3000