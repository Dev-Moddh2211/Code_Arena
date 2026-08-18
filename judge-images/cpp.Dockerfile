FROM alpine:3.19

RUN apk add --no-cache g++ make
RUN adduser -D -u 1000 judgeuser

WORKDIR /sandbox
USER judgeuser

CMD ["g++", "--version"]
