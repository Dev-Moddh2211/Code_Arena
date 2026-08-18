FROM python:3.12-alpine

# Non-root user for sandboxed security
RUN adduser -D -u 1000 judgeuser

WORKDIR /sandbox
USER judgeuser

CMD ["python3", "-c", "print('Python Judge Container Ready')"]
