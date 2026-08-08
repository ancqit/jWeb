# jWeb

jWeb is a minimal full-stack web application used to validate Cloud Agent development environments.

## Requirements

- Node.js 22+

## Setup

```bash
./scripts/cloud-agent-install.sh
```

## Development

```bash
npm run dev
```

The app listens on [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with file watching |
| `npm start` | Start the production server |
| `npm test` | Run API integration tests |
| `npm run lint` | Syntax-check server and test files |

## API

- `GET /api/health` — health check
- `GET /api/items` — list items
- `POST /api/items` — create an item (`{ "text": "..." }`)
