.PHONY: dev run d-help d-up d-down d-build d-logs d-clean d-dev

## comandos para desarrollo fuera de dockerde
dev: ## Inicia ambos servidores sin instalar dependencias
	@echo "Iniciando Servidores de desarrollo..."
	@cd Frontend && npm run dev & \
	 cd Backend && make dev

run: ## Eecuta este comando si es la primera vez, intala todas las dependencias e inicia los servidores
	@echo "instalando dependencias e iniciando..."
	@cd Frontend && npm install && npm start & \
	cd Backend && make run

help: d-help

## comandos con d- significa comandos de docker

d-help:  ## Muestra esta ayuda
	@echo "Comandos disponibles: (comandos con d- significa comandos de docker)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  make \033[36m%-15s\033[0m %s\n", $$1, $$2}'

d-up:     ## Levanta todos los servicios en segundo plano
	docker compose up -d

d-down:   ## Detiene y elimina los contenedores (mantiene volúmenes)
	docker compose down --remove-orphans

d-build:  ## Reconstruye las imágenes sin caché
	docker compose build --no-cache

d-rebuild: ## Reconstruye todo dede cero 
	d-down d-build d-up

d-logs:   ## Muestra los logs en tiempo real
	docker compose logs -f

d-clean:  ## Elimina contenedores Y volúmenes (¡pierdes datos!)
	docker compose down -v

d-dev:    ## Modo desarrollo: levanta servicios y sigue los logs
	docker compose up -d && docker compose logs -f