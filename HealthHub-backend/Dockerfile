FROM golang:1.21-alpine

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./

RUN go mod download
COPY . .

RUN go build -o main ./cmd/server

RUN mkdir -p /app/logs

EXPOSE 8081

CMD ["./main"]
