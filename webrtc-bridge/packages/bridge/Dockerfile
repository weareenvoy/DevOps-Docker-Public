FROM node:12

WORKDIR /

COPY . .

#WORKDIR packages/bridge

RUN npm install

ENV NODE_ENV=production
ENV TOKEN_SIGNING_SECRET=foo
ENV LOG_LEVEL=debug

EXPOSE 3000/tcp
EXPOSE 3000/udp

CMD ["npm", "run", "start"]
