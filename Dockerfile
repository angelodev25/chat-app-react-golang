# Etapa 1: Construir el binario de Go
FROM golang:1.26-alpine AS backend-builder
WORKDIR /app
COPY Backend/go.mod Backend/go.sum ./
RUN go mod download
COPY Backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/main.go

# Etapa 2: Imagen final
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
# Copia el binario compilado
COPY --from=backend-builder /server /app/server
# Crea las carpetas para el almacenamiento de usuarios (SQLite)
RUN mkdir -p /app/users_storage/uploads /app/users_storage/messages
# Expone el puerto 8080
EXPOSE 8080
# Comando de inicio
CMD ["/app/server"]