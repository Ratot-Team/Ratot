// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const express = require("express");
const router = new express.Router();

const DISCORD_WS_STATUS = {
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
const DB_PING_TIMEOUT_MS = 1500;

function getDiscordStatus(client) {
	const wsStatusCode = client && client.ws ? client.ws.status : null;
	const ready =
		Boolean(client) &&
		typeof client.isReady === "function" &&
		client.isReady();
	const ping = client && client.ws ? client.ws.ping : null;

	return {
		status: ready ? "ok" : "unavailable",
		ready,
		user: client && client.user
			? { id: client.user.id, tag: client.user.tag }
			: null,
		guilds:
			client && client.guilds && client.guilds.cache
				? client.guilds.cache.size
				: null,
		uptime: client ? client.uptime : null,
		readyAt: client && client.readyAt ? client.readyAt.toISOString() : null,
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

async function getDatabaseStatus(database) {
	const ping = { ok: false, duration: null, error: null };
	if (database && typeof database.ping === "function") {
		const startedAt = Date.now();
		const timeout = new Error("Health check timed out");
		let timer;
		try {
			await Promise.race([
				Promise.resolve().then(() => database.ping()),
				new Promise((_, reject) => {
					timer = setTimeout(() => reject(timeout), DB_PING_TIMEOUT_MS);
				}),
			]);
			ping.ok = true;
			ping.duration = Date.now() - startedAt;
		} catch (error) {
			// Health endpoints never expose SQL errors or connection details.
			ping.error = error === timeout ? "timeout" : "ping failed";
		} finally {
			clearTimeout(timer);
		}
	}

	return {
		status: ping.ok ? "ok" : "unavailable",
		connected: ping.ok,
		state: ping.ok ? "Ready" : "Unavailable",
		ping,
		timestamp: new Date().toISOString(),
	};
}

/** Health check endpoint used by Uptime Kuma. */
router.get("/health", async (req, res) => {
	const discord = getDiscordStatus(req.app.locals.discordClient);
	const database = await getDatabaseStatus(req.app.locals.database);
	const healthy = discord.status === "ok" && database.status === "ok";

	return res.status(healthy ? 200 : 503).json({
		status: healthy ? "ok" : "unavailable",
		discord,
		database,
		timestamp: new Date().toISOString(),
	});
});

router.get("/health/discord", (req, res) => {
	const discord = getDiscordStatus(req.app.locals.discordClient);
	return res.status(discord.status === "ok" ? 200 : 503).json(discord);
});

router.get(["/health/db", "/health/database"], async (req, res) => {
	const database = await getDatabaseStatus(req.app.locals.database);
	return res.status(database.status === "ok" ? 200 : 503).json(database);
});

module.exports = router;
