// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const { errorLogger, infoLogger } = require("./src/utils/logger.js");
const { initializeConfig, getConfig } = require("./src/config/index.js");
const { createDatabase, setDatabase, safeDatabaseError } = require("./src/db/index.js");
const eventHandler = require("./src/handlers/eventHandler.js");
const api = require("./src/api/api.js");

function createClient() {
	return new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
		],
	});
}

function listen(app, port) {
	return new Promise((resolve, reject) => {
		const server = app.listen(port);
		const onListening = () => {
			server.off("error", onError);
			resolve(server);
		};
		const onError = (error) => {
			server.off("listening", onListening);
			reject(error);
		};
		server.once("listening", onListening);
		server.once("error", onError);
	});
}

function closeServer(server) {
	if (!server) return Promise.resolve();
	return new Promise((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
}

async function start() {
	// Load local configuration only when the executable starts.
	require("dotenv").config({ quiet: true });
	initializeConfig(process.env);
	const config = getConfig();
	let database;
	let client;
	let server;
	let closing;

	async function shutdown() {
		if (closing) return closing;
		closing = (async () => {
			const stopped = await Promise.allSettled([
				closeServer(server),
				Promise.resolve().then(() => client && client.destroy()),
			]);
			const closed = await Promise.allSettled([
				Promise.resolve().then(() => database && database.close()),
			]);
			setDatabase(null);
			const failed = [...stopped, ...closed].find(
				(result) => result.status === "rejected",
			);
			if (failed) throw failed.reason;
		})();
		return closing;
	}

	try {
		// No Discord session is started if PostgreSQL is unavailable.
		try {
			database = createDatabase(config);
			await database.ping();
			await database.verifyRuntime(config);
		} catch (error) {
			errorLogger.error("PostgreSQL startup failed: " + safeDatabaseError(error));
			throw error;
		}
		setDatabase(database);
		infoLogger.info("Connected to PostgreSQL.");

		client = createClient();
		client.on("error", () => errorLogger.error("Discord client error."));
		const ready = eventHandler(client, async () => {
			await shutdown();
			process.exitCode = 1;
		}, { expectedDiscordId: config.discord.id });
		const readyTimeout = new Error("Discord readiness timed out");
		readyTimeout.code = "DISCORD_READY_TIMEOUT";
		let readyTimer;
		const loginAndReady = Promise.all([
			client.login(config.discord.token),
			ready,
		]);
		const readyWithinDeadline = Promise.race([
			loginAndReady,
			new Promise((_, reject) => {
				readyTimer = setTimeout(() => reject(readyTimeout), 60000);
			}),
		]);
		try {
			await readyWithinDeadline;
		} finally {
			clearTimeout(readyTimer);
		}
		if (client.user?.id !== config.discord.id) {
			throw new Error("Discord application identity mismatch");
		}

		const app = express();
		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.locals.discordClient = client;
		app.locals.database = database;
		app.use("/", api);
		app.get("/{*splat}", (req, res) => {
			infoLogger.info("Unhandled API route hit.");
			return res.status(404).end();
		});
		server = await listen(app, config.port);
		server.on("error", () => {
			errorLogger.error("API server error; shutting down.");
			void shutdown().then(
				() => {
					process.exitCode = 1;
				},
				() => {
					process.exitCode = 1;
				},
			);
		});
		infoLogger.info("API server is listening on port " + server.address().port);

		const onSignal = (signal) => {
			infoLogger.info("Received " + signal + "; shutting down.");
			void shutdown()
				.then(() => {
					process.exitCode = 0;
				})
				.catch(() => {
					errorLogger.error("Shutdown failed.");
					process.exitCode = 1;
				});
		};
		process.once("SIGINT", onSignal);
		process.once("SIGTERM", onSignal);
		return { client, server, database, shutdown };
	} catch (error) {
		try {
			await shutdown();
		} catch {
			// Preserve the startup failure after attempting every cleanup step.
		}
		throw error;
	}
}

if (require.main === module) {
	start().catch(() => {
		// Connection and login errors may contain credentials.
		errorLogger.error("Startup failed. Check configuration, PostgreSQL and Discord availability.");
		process.exitCode = 1;
	});
}

module.exports = { start };
