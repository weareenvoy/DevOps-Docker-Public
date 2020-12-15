FROM node:12

WORKDIR /

RUN mkdir /app
COPY . /app

WORKDIR /app

RUN npm install

ENV NODE_ENV=production
ENV TOKEN_SIGNING_SECRET=foo
ENV LOG_LEVEL=debug

RUN npm run build

EXPOSE 3000/tcp
EXPOSE 3000/udp

CMD ["npm", "run", "start"]
