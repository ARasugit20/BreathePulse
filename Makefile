.PHONY: install install-backend install-frontend run-backend run-frontend test test-backend test-frontend lint docker-up docker-down migrate

install: install-backend install-frontend

install-backend:
	chmod +x backend/install.sh
	cd backend && ./install.sh

install-frontend:
	chmod +x frontend/install.sh
	cd frontend && ./install.sh

run-backend:
	cd backend && ./run.sh

run-frontend:
	cd frontend && ./run.sh

test: test-backend test-frontend

test-backend:
	cd backend && uv run pytest -v

test-frontend:
	cd frontend && yarn test:run

lint:
	cd backend && uv run ruff check .
	cd frontend && yarn lint && yarn typecheck

docker-up:
	docker compose up -d postgres

docker-down:
	docker compose down

migrate:
	cd backend && uv run alembic upgrade head

.DEFAULT_GOAL := install
