.PHONY: dev
dev:
	@echo "Iniciando Servidores de desarrollo..."
	@cd Frontend && npm run dev & \
	 cd Backend && make dev

run:
	@echo "instalando dependencias e iniciando..."
	@cd Frontend && npm install && npm start & \
	cd Backend && make run