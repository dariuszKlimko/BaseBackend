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
1) Go to directory "/HealthAPI" in terminal.

2) If you are Windows users go to point 3, otherwise run two commmands:
```
chmod +x docker/docker-entrypoint.sh
```
```
chmod +x docker/test-entrypoint.sh
```

3) To start application.
```
make start
```

4) To start application e2e tests:
```
make start ENV=test
```

5) Application documentation:
```
http://localhost:3000/api
```

To run application from remote image:
 1) in "docker-compose.dev.yml" comment out "build" section
 2) in "docker-compose.yml" uncomment "image" section

## Run application without docker
### Setup application
Create database for development purpose for example "mydatabase".
Create database for testing purpose for example "mydatabase_test".
Testing database should have the same name like development database plus postfix "_test".

Prepare .env file from .env.example.

### Run application
1) Go to directory "/app" in terminal and install all dependencies.
```
yarn
```

2) Run command.
```
yarn build
```

3) Run migrations.
```
yarn migration:run
```

4) To start application.
```
yarn start
```

5) To start application e2e tests:
```
yarn test:e2e
```

6) Application documentation:
```
http://localhost:80/api
```


## TO DO
1) refactor email service
2) reset password endpoint
3) pagination
4) add table "user profile"
5) add role guard