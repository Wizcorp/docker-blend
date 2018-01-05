# ![docker-blend](./logo.png)

Environment-based docker-compose.yml configuration.

The goal of this tool is to simplify mixing and merging `docker-compose`
files based on the execution environment (essentially, `NODE_ENV`).

## Installation

```shell
npm install --save-dev docker-blend
```

## Usage

> project structure

```plaintext
.
├── docker-compose
│   ├── development.yml
│   └── production.yml
├── docker-compose.yml
├── Dockerfile
└── package.json
```

> package.json

```json
{
  "scripts": {
    "docker": "docker-blend"
  }
}
```

From there, simply replace `docker-compose` with `npm run docker compose`, and
`docker stack` with `npm run docker stack`.

```shell
npm run docker compose up -- -d
npm run docker compose ps
npm run docker stack deploy
```

`docker-compose.yml` will always be loaded, and it will be merged with 
`docker-compose/${NODE_ENV}.yml` if an environment-specific file can be found.

## Acknowledgements
Logo created with <a href="http://logomakr.com" title="Logo Makr">LogoMakr.com</a>

  - [Source](https://logomakr.com/8EPEyE)

## License

MIT. [See License](./License.md)
