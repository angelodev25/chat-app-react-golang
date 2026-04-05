.PHONY: dev
dev:
	@echo "Iniciando Servidores de desarrollo..."
	@cd Frontend && npm run dev & \
	 cd Backend && make run