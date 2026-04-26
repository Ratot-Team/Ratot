// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

var express = require("express");
var router = new express.Router();

var DISCORD_WS_STATUS = {
	0: "Ready",
	1: "Connecting",
	2: "Reconnecting",
	3: "Idle",
	4: "Nearly",
	5: "Disconnected",
	6: "WaitingForGuilds",
	7: "Identifying",
	8: "Resuming",
};
var DB_PING_TIMEOUT_MS = 1500;

function getDiscordStatus(client) {
	var wsStatusCode = client && client.ws ? client.ws.status : null;
	var ready =
		Boolean(client) &&
		typeof client.isReady === "function" &&
		client.isReady();
	var ping = client && client.ws ? client.ws.ping : null;

	return {
		status: ready ? "ok" : "unavailable",
		ready: ready,
		user: client && client.user
			? {
					id: client.user.id,
					tag: client.user.tag,
				}
			: null,
		guilds:
			client && client.guilds && client.guilds.cache
				? client.guilds.cache.size
				: null,
		uptime: client ? client.uptime : null,
		readyAt:
			client && client.readyAt ? client.readyAt.toISOString() : null,
		websocket: {
			statusCode: wsStatusCode,
			status:
				wsStatusCode !== null && DISCORD_WS_STATUS[wsStatusCode]
					? DISCORD_WS_STATUS[wsStatusCode]
					: "Unknown",
			ping: Number.isFinite(ping) ? ping : null,
		},
		timestamp: new Date().toISOString(),
	};
}

function getDatabaseState(mongoose) {
	var connection = mongoose ? mongoose.connection : null;
	var readyState = connection ? connection.readyState : null;
	var state =
		mongoose && mongoose.STATES && readyState !== null
			? mongoose.STATES[readyState]
			: "Unknown";

	return {
		connection: connection,
		readyState: readyState,
		state: state || "Unknown",
	};
}

function pingDatabase(connection) {
	return new Promise((resolve, reject) => {
		var timeout = setTimeout(() => {
			reject(new Error("Database ping timed out"));
		}, DB_PING_TIMEOUT_MS);
		var pingPromise;

		try {
			pingPromise = connection.db.admin().ping();
		} catch (error) {
			clearTimeout(timeout);
			reject(error);
			return;
		}

		Promise.resolve(pingPromise)
			.then((result) => {
				clearTimeout(timeout);
				resolve(result);
			})
			.catch((error) => {
				clearTimeout(timeout);
				reject(error);
			});
	});
}

async function getDatabaseStatus(mongoose) {
	var databaseState = getDatabaseState(mongoose);
	var connected = databaseState.readyState === 1;
	var ping = {
		ok: false,
		duration: null,
		error: null,
	};

	if (connected && databaseState.connection && databaseState.connection.db) {
		var startTime = Date.now();

		try {
			await pingDatabase(databaseState.connection);
			ping.ok = true;
			ping.duration = Date.now() - startTime;
		} catch (error) {
			ping.error = error.message;
		}
	}

	return {
		status: connected && ping.ok ? "ok" : "unavailable",
		connected: connected,
		readyState: databaseState.readyState,
		state: databaseState.state,
		ping: ping,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Health check endpoint
 * Used by Uptime Kuma
 */
router.get("/health", async (req, res) => {
	var discord = getDiscordStatus(req.app.locals.discordClient);
	var database = await getDatabaseStatus(req.app.locals.mongoose);
	var healthy = discord.status === "ok" && database.status === "ok";

	return res.status(healthy ? 200 : 503).json({
		status: healthy ? "ok" : "unavailable",
		discord: discord,
		database: database,
		timestamp: new Date().toISOString(),
	});
});

/**
 * Discord bot health check endpoint
 */
router.get("/health/discord", (req, res) => {
	var discord = getDiscordStatus(req.app.locals.discordClient);

	return res.status(discord.status === "ok" ? 200 : 503).json(discord);
});

/**
 * Database health check endpoint
 */
router.get(["/health/db", "/health/database"], async (req, res) => {
	var database = await getDatabaseStatus(req.app.locals.mongoose);

	return res.status(database.status === "ok" ? 200 : 503).json(database);
});

module.exports = router;
