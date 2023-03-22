# dev environment as a default value
ENV := $(if $(ENV),$(ENV),dev)

build:
	$(info Make: Building "$(ENV)" environment)
	docker-compose --env-file=.env -f docker/docker-compose.yml -f docker/docker-compose.$(ENV).yml build

build-nocache:
	$(info Make: Building "$(ENV)" environment)
	docker-compose --env-file=.env -f docker/docker-compose.yml -f docker/docker-compose.$(ENV).yml build --no-cache

start:
	$(info Make: Starting "$(ENV)" environment)
	docker-compose --env-file=.env -f docker/docker-compose.yml -f docker/docker-compose.$(ENV).yml up -d

test:
	$(info Make: Testing)
	docker-compose --env-file=.env -f docker/docker-compose.yml -f docker/docker-compose.test.yml up --build --exit-code-from app

stop:
	$(info Make: Stopping "$(ENV)" environment)
	docker-compose --env-file=.env -f docker/docker-compose.yml -f docker/docker-compose.$(ENV).yml down

prune:
	$(info Make: Stopping and removing data "$(ENV)" environment)
	docker-compose --env-file=.env -f docker/docker-compose.yml -f docker/docker-compose.$(ENV).yml down -v

restart:
	$(info Make: Restarting "$(ENV)" environment)
	ENV=$(ENV) make stop
	ENV=$(ENV) make start

prune-restart:
	$(info Make: Restarting "$(ENV)" environment)
	ENV=$(ENV) make prune
	ENV=$(ENV) make start
