# HealthAPI

## Technologies
* [Node.js](https://nodejs.org/en/)
  * [Nest.js](https://nestjs.com/)
* [PostgreSQL](https://www.postgresql.org//)
* [Docker](https://docs.docker.com/)

## Run application with docker
### Setup application

Prepare .env file from .env.example.

### Run application
Go to directory "/healthapi" in terminal.
To start application.
```
make start
```

To start application e2e tests:
```
make start ENV=test
```

Application documentation:
```
http://localhost:3000/api
```

## Run application without docker
### Setup application
Create database for development purpose for example "mydatabase".
Create database for testing purpose for example "mydatabase_test".
Testing database should have the same name like development database plus postfix "_test".

Prepare .env file from .env.example.

### Run application
Go to directory "/app" in terminal and install all dependencies.
```
yarn
```

Run migrations.
```
yarn migration:run
```

To start application.
```
yarn start
```

To start application e2e tests:
```
yarn test:e2e
```

Application documentation:
```
http://localhost:80/api
```