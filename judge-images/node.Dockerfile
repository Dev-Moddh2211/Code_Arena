FROM node:20-alpine

RUN adduser -D -u 1000 judgeuser

WORKDIR /sandbox
USER judgeuser

CMD ["node", "-e", "console.log('Node Judge Container Ready')"]
