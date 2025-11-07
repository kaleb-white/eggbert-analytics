# Eggbert Analytics v0.1

## Getting Started

### Adding .env files

1. Email kaleboppwhite@gmail.com to access the correct .env files.
    - For the main server, running using nextJS, the required variables include database credentials, testing features, and proxy credentials. The .env file should be placed at eggbert_analytics/.env.
    - For the proxy, the required variables are related to accessing the model API. The .env file shold be placed at eggbert_analytics/model_client_proxy/.env.

### Postgres

1. Both local development and containerized development require an instance of PostgreSQL running, or they will error. The download page is [here](https://www.postgresql.org/download/).
    - Eventually the docker development and production builds will include a postgreSQL container, but that requires configuring a pod with two containers and a custom network.
1. Follow the install steps without changing defaults until the set password page. Use the PGPASSWORD value from the nextJS .env file. Ensure it matches exactly!
1. Use 5432 as the default port, or, if for some reason you'd like a different port, set the value of PGPORT to be the same as the port you'd selected.
1. Allow the install to complete.
1. Create the two databases (for production, with the name `eggbert`, and for development, with the name `test`):
    - Search for psql (a psql shell should be included in the postgreSQL install.)
    - If you are asked for credentials, hit enter until you are asked for password. Your default options should be `Server [localhost]`, `Database [postgres]`, `Port [5432]`, `Username [postgres]`. Copy the password and then right click by the prompt in the shell (which will paste it).
    - To create the database run `CREATE DATABASE test` and `CREATE DATABASE eggbert`.
    - Verify that the databases were created by running `\l`; a table should be printed which lists `eggbert` and `test` in the `Name` column.
1. That should be it! PostgreSQL runs as a service in the background.

### Working locally

1. Install bun globally via `npm i bun -g`. Bun is _just faster_ than node, and includes native support for typescript. No commands in `package.json` are configure to call node.
1. Install all dependencies via `bun install`. If bun hangs, just use `npm install`.
1. Run `bun run dev-solo-reponse-windows`. This starts the cache and proxy. If there are issues during start, contact kaleboppwhite@gmail.com. Alternatively, try running without the shorthand: `bun run ./entrypoints/test_solo_response/main.ts spawn`.
1. Visit localhost:3000/responses/test (allow nextJS time to compile when you do!)

### Working in a container

1. If you don't have it, install Docker (good luck!).
1. If you don't have it, install VSCode (sorry!).
1. Install the extension Dev Containers (identifier `ms-vscode-remote.remote-containers`)
1. To run a command, type `CTRL+Shift+P`. Alternatively, select the top bar with the search icon and type `>`.
1. Select `Dev Container: Rebuid and Reopen in Container` (or something like that). This process will take a second. If you have issues during the build, email kaleboppwhite@gmail.com
1. Open up a new console (CTRL+Shift+`).
1. Run `bun run ./entrypoints/test_solo_response/main.ts spawn`. Note that this will take significantly longer than outside a container; see [this](https://nextjs.org/docs/app/guides/local-development#8-consider-local-development-over-docker).
1. Once NextJs reports `✓ Ready in x.xs`, you can navigate to localhost:3000/responses/test (allow nextJS time to compile when you do!) to see the app.

### Project Structure and Documentation

Refer to [the architecture file](./docs/eggbert_architecture.md) to learn more about the project's implementation of the philosophies of Robert C. Martin's _Clean Architecture_.

There is a also an [abbreviated summary of the key principles of Martin's book.](/docs/clean_architecture.md)

## Credit

### Solar Bold Icons for all icons

Find the collection [here.](https://www.svgrepo.com/collection/solar-bold-icons)

### LearnCPP for excellent CPP instruction

Visit them [here.](https://learncpp.com)
