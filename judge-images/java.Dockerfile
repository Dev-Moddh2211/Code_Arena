FROM openjdk:17-alpine

RUN adduser -D -u 1000 judgeuser

WORKDIR /sandbox
USER judgeuser

CMD ["java", "-version"]
