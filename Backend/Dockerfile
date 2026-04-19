# Etapa 1: Compilación
FROM golang:1.26-alpine AS builder

ENV GOPROXY=https://goproxy.cn,direct
ENV GOSUMDB=off

WORKDIR /build

# Copiar dependencias primero (cache)
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fuente
COPY . .

# Compilar binario estático (CGO_ENABLED=0 porque usas modernc.org/sqlite)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o server ./cmd/main.go

# Etapa 2: Imagen mínima para ejecución (con alpine, no scratch)
FROM alpine:latest

# Copiar certificados SSL
COPY --from=alpine:latest /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copiar el binario compilado
COPY --from=builder /build/server /server

# Establecer directorio de trabajo
WORKDIR /app

# Crear la estructura de carpetas necesaria (ahora sí funciona porque alpine tiene /bin/sh)
RUN mkdir -p /app/users_storage/uploads /app/users_storage/messages

# Exponer puerto
EXPOSE 8080

# Comando de inicio
ENTRYPOINT ["/server"]