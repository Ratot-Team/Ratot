// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const path = require("node:path");

let activeConfig;

function required(source, key) {
	const value = source[key];
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(`Missing required configuration: ${key}`);
	}
	return value;
}

function loadConfig(source) {
	const env = required(source, "RATOT_ENV");
	if (env !== "dev" && env !== "prod") {
		throw new Error("RATOT_ENV must be dev or prod");
	}

	const suffix = env.toUpperCase();
	const databaseUrl = required(source, `DATABASE_URL_${suffix}`);
	let url;
	try {
		url = new URL(databaseUrl);
	} catch {
		throw new Error(`DATABASE_URL_${suffix} is not a valid PostgreSQL URL`);
	}
	const expectedDatabase = `ratot_discord_${env}`;
	const expectedRole = `${expectedDatabase}_user`;
	if (
		!(["postgres:", "postgresql:"].includes(url.protocol)) ||
		url.hostname !== "postgresql.home.arpa" ||
		(url.port && url.port !== "5432") ||
		url.pathname !== `/${expectedDatabase}` ||
		decodeURIComponent(url.username) !== expectedRole ||
		!url.password ||
		url.search ||
		url.hash
	) {
		throw new Error(
			`DATABASE_URL_${suffix} must target ${expectedRole}@postgresql.home.arpa:5432/${expectedDatabase} without URL options`,
		);
	}
	if (required(source, "POSTGRES_SSL_MODE") !== "verify-full") {
		throw new Error("POSTGRES_SSL_MODE must be verify-full");
	}
	const caCertPath = required(source, "POSTGRES_CA_CERT_PATH");
	if (!path.isAbsolute(caCertPath)) {
		throw new Error("POSTGRES_CA_CERT_PATH must be an absolute path");
	}

	const discord = {
		id: required(source, `RATOT_${suffix}_DISCORD_ID`),
		name: required(source, `RATOT_${suffix}_NAME`),
		token: required(source, `RATOT_${suffix}_TOKEN`),
	};
	const oppositeSuffix = env === "dev" ? "PROD" : "DEV";
	if (
		(source[`RATOT_${oppositeSuffix}_TOKEN`] &&
			discord.token === source[`RATOT_${oppositeSuffix}_TOKEN`]) ||
		(source[`RATOT_${oppositeSuffix}_DISCORD_ID`] &&
			discord.id === source[`RATOT_${oppositeSuffix}_DISCORD_ID`])
	) {
		throw new Error("DEV and PROD Discord credentials must be distinct");
	}

	const portText = required(source, "PORT");
	const port = Number(portText);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error("PORT must be an integer between 1 and 65535");
	}

	return Object.freeze({
		env,
		port,
		databaseUrl,
		postgres: Object.freeze({ sslMode: "verify-full", caCertPath }),
		discord: Object.freeze(discord),
		creator: Object.freeze({
			id: required(source, "RATOT_CREATOR_DISCORD_ID"),
			username: required(source, "RATOT_CREATOR_DISCORD_USERNAME"),
		}),
		guildId: required(source, "RATOT_GUILD_ID"),
	});
}

function initializeConfig(source = process.env) {
	activeConfig = loadConfig(source);
	return activeConfig;
}

function getConfig() {
	if (!activeConfig) {
		throw new Error("Configuration has not been initialized");
	}
	return activeConfig;
}

module.exports = { initializeConfig, getConfig };
