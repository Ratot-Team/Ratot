// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const fs = require("node:fs");
const { Pool } = require("pg");

let activeDatabase;

function safeDatabaseError(error) {
	const code = error && typeof error.code === "string" ? error.code : "UNKNOWN";
	return /^[A-Z0-9_]{2,40}$/.test(code) ? code : "UNKNOWN";
}

function createDatabase(config) {
	const url = new URL(config.databaseUrl);
	let ca;
	try {
		ca = fs.readFileSync(config.postgres.caCertPath);
	} catch {
		throw new Error("PostgreSQL CA certificate could not be read");
	}
	if (!ca || ca.length === 0) {
		throw new Error("PostgreSQL CA certificate is empty");
	}

	const pool = new Pool({
		host: url.hostname,
		port: Number(url.port || 5432),
		database: url.pathname.slice(1),
		user: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password),
		ssl: {
			ca,
			rejectUnauthorized: true,
			servername: url.hostname,
		},
		enableChannelBinding: true,
		max: 10,
		connectionTimeoutMillis: 5000,
		idleTimeoutMillis: 30000,
		statement_timeout: 5000,
		query_timeout: 6000,
		idle_in_transaction_session_timeout: 10000,
		application_name: `ratot_discord_${config.env}`,
	});

	// pg emits idle-client errors outside an active query. Never log the raw error:
	// connection diagnostics can contain details from the connection configuration.
	pool.on("error", (error) => {
		const code = safeDatabaseError(error);
		process.stderr.write(`PostgreSQL idle client error (${code})\n`);
	});

	return {
		query(text, params) {
			return pool.query(text, params);
		},
		ping() {
			return pool.query({ text: "SELECT 1", query_timeout: 1500 });
		},
		async verifyRuntime() {
			const result = await pool.query(
				`SELECT current_database() AS database_name, current_user AS role_name,
				 pg_catalog.pg_encoding_to_char(encoding) AS encoding,
				 current_setting('server_version_num')::integer AS server_version_num
				 FROM pg_catalog.pg_database WHERE datname = current_database()`,
			);
			const row = result.rows[0];
			if (!row ||
				row.database_name !== `ratot_discord_${config.env}` ||
				row.role_name !== `ratot_discord_${config.env}_user` ||
				row.encoding !== "UTF8" ||
				row.server_version_num < 180000 || row.server_version_num >= 190000) {
				throw new Error("PostgreSQL runtime is incompatible with RATOT_ENV");
			}
			// These reads also detect missing tables or missing SELECT privileges
			// before a Discord session can be started.
			await pool.query("SELECT 1 FROM public.bot_admins LIMIT 0");
			await pool.query("SELECT 1 FROM public.bot_configs LIMIT 0");
			await pool.query("SELECT 1 FROM public.bot_config_logs LIMIT 0");
			const privileges = await pool.query(`
				SELECT
				 has_table_privilege(current_user, 'public.bot_admins', 'INSERT') AS admins_insert,
				 has_table_privilege(current_user, 'public.bot_admins', 'DELETE') AS admins_delete,
				 has_table_privilege(current_user, 'public.bot_configs', 'INSERT') AS configs_insert,
				 has_table_privilege(current_user, 'public.bot_configs', 'UPDATE') AS configs_update,
				 has_table_privilege(current_user, 'public.bot_config_logs', 'INSERT') AS logs_insert
			`);
			if (!privileges.rows[0] ||
				Object.values(privileges.rows[0]).some((granted) => granted !== true)) {
				throw new Error("PostgreSQL bot role lacks required table privileges");
			}
		},
		async transaction(fn) {
			const client = await pool.connect();
			let destroy = false;
			try {
				await client.query("BEGIN");
				const value = await fn(client);
				await client.query("COMMIT");
				return value;
			} catch (error) {
				try {
					await client.query("ROLLBACK");
				} catch {
					destroy = true;
				}
				throw error;
			} finally {
				client.release(destroy);
			}
			},
		close() {
			return pool.end();
		},
	};
}

function setDatabase(database) {
	activeDatabase = database;
}

function getDatabase() {
	if (!activeDatabase) {
		throw new Error("Database has not been initialized");
	}
	return activeDatabase;
}

module.exports = { createDatabase, setDatabase, getDatabase, safeDatabaseError };
