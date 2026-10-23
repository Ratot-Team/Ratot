# RATOT Discord

RATOT is a Discord bot for server administration and a few social commands. **Version 0.7.0** uses PostgreSQL 18 for persistent storage, replacing the legacy MongoDB implementation.

## Requirements

- Node.js 25.8.1 or newer within the supported 25.x or 26.x range, and npm.
- PostgreSQL 18 with a dedicated RATOT database and role.
- A PostgreSQL server certificate for `postgresql.home.arpa` and the Quartz Guardian root CA certificate. TLS certificate and hostname validation are mandatory.
- A Discord application and bot token for the selected environment.

The code uses CommonJS, `discord.js` 14, Express, Winston and `pg` (node-postgres). PostgreSQL access is shared through one connection pool. The application does not create or alter database tables on startup.

## Install and configure

Install the locked dependencies with `npm ci`. On a fresh checkout, copy [`.env.example`](./.env.example) to a local `.env` and replace every placeholder. Do not commit `.env`, tokens, passwords, certificates containing private keys, or local credential files. An existing `.env` should be preserved and edited locally as needed.

Set `RATOT_ENV` explicitly to `dev` or `prod`. There is no default. The configuration module selects all three Discord application values and the matching PostgreSQL URL together:

| `RATOT_ENV` | PostgreSQL URL | Discord ID, name and token |
| --- | --- | --- |
| `dev` | `DATABASE_URL_DEV` | `RATOT_DEV_DISCORD_ID`, `RATOT_DEV_NAME`, `RATOT_DEV_TOKEN` |
| `prod` | `DATABASE_URL_PROD` | `RATOT_PROD_DISCORD_ID`, `RATOT_PROD_NAME`, `RATOT_PROD_TOKEN` |

The common settings are `PORT`, `RATOT_CREATOR_DISCORD_ID`, `RATOT_CREATOR_DISCORD_USERNAME` and `RATOT_GUILD_ID`. The old `RATOT_CURRENT_*` and `DBURL` settings are no longer used. Missing or inconsistent settings stop startup; values from the opposite environment are not used as fallback.

Set `POSTGRES_SSL_MODE=verify-full` and `POSTGRES_CA_CERT_PATH` to a readable copy of the public Quartz Guardian root CA certificate. The development PC uses `/home/captainratax/.postgresql/root.crt`; LXC 101 uses `/etc/postgresql-client/quartz-guardian-root-ca.crt`. Keep the hostname `postgresql.home.arpa` in the database URL so TLS hostname verification matches the server certificate. Do not use the IP address in place of the hostname. The bot uses the dedicated `ratot_discord_dev_user` or `ratot_discord_prod_user` role, never an administrative account.

Before Discord login, startup verifies PostgreSQL 18, UTF8, the selected database and role, read access to all three tables, and the write privileges used by current bot commands (admin insert/delete, config insert/update, and log insert). It fails if these checks do not pass.

## PostgreSQL schema

The application expects the existing tables `public.bot_admins`, `public.bot_configs` and `public.bot_config_logs`. Their PostgreSQL `BIGINT` identity primary keys are distinct from Discord IDs, which remain text. The nullable `mongo_id` columns retain the imported MongoDB identifiers. Config logs have no foreign key to configs, and application updates set `updated_at` explicitly.

The initial DEV migration imported one admin, one config and eight config logs. On October 23, 2026, the PROD migration imported the same collection counts from the final MongoDB export (10 records total). The import was committed and the table counts verified; production identity sequences were then aligned with the imported IDs (1, 1 and 8 respectively). These counts describe the migration snapshot and will change as the bot writes new data.

Provision every environment with the agreed PostgreSQL 18 UTF8 schema and dedicated role before starting the bot. The application does not create or migrate tables on startup. Preserve the original MongoDB backup and export files until production behavior and rollback requirements have been reviewed.

## Run

Run `npm start` only after the selected database is prepared and the configuration is complete. The bot and status API start together. Stop it with Ctrl+C; the application closes its PostgreSQL pool during graceful shutdown. Do not run the development bot against the real production database.

### Production deployment and cutover

The `ratot_discord_prod` database was recreated with **UTF8**, the required three-table schema was provisioned, and the final MongoDB export was imported and verified on October 23, 2026. The old `SQL_ASCII` database was retained separately as `ratot_discord_prod_sqlascii_backup`. MongoDB source data and its backup are retained for rollback. The database migration was performed separately; merging this PR does not execute SQL migrations.

**Important:** a push or merge to `main` triggers the GitHub Actions **Deploy (production)** workflow. The workflow connects to LXC 101 over SSH and runs `/home/bot/deploy.sh`, which can reload or start the PM2-managed bot. Coordinate the merge with the announced maintenance window, verify `RATOT_ENV=prod`, `DATABASE_URL_PROD`, `POSTGRES_SSL_MODE=verify-full` and `POSTGRES_CA_CERT_PATH=/etc/postgresql-client/quartz-guardian-root-ca.crt` on the production host, and monitor deployment logs before ending maintenance. Never commit the production `.env`.

After the first PostgreSQL-based production startup, verify Discord connectivity, database-backed commands, the status API and monitoring before bringing the service back to normal operation.

## Commands

- `/help` and `/help-commands`: help menus.
- `/ping` and `/bot-ping`: bot response and latency.
- `/hug <@someone>`: send a hug.
- `/prune <number>`: delete messages; requires server administrator permissions.
- `/change-status <number> <status>`: change the bot status; bot administrators only.
- `/add-bot-admin <@someone>` and `/remove-bot-admin <@someone>`: manage bot administrators.
- `/list-servers` and `/list-channels [server ID]`: inspect servers and channels; bot administrators only.

[Invite RATOT](https://discord.com/oauth2/authorize?client_id=756290869900083272&permissions=8&integration_type=0&scope=bot) · [Service status](https://status.ratot.eu) · [Privacy Policy](./PRIVACY%20POLICY.txt) · [Terms of Service](./TERMS%20OF%20SERVICE.txt)

## License

Copyright (C) 2026 Captain Ratax

This project is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. See [LICENSE](./LICENSE).
