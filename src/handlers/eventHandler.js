// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const { errorLogger } = require("../utils/logger");
const { safeDatabaseError } = require("../db");

module.exports = (client, onFatal, { expectedDiscordId } = {}) => {
	const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);
	let resolveReady;
	let rejectReady;
	let readySettled = false;
	const ready = new Promise((resolve, reject) => {
		resolveReady = resolve;
		rejectReady = reject;
	});
	// Existing event-handler consumers may ignore readiness. Keep that safe
	// while preserving the rejection for startup callers that await it.
	void ready.catch(() => {});

	function settleReady(error) {
		if (readySettled) return;
		readySettled = true;
		if (error) rejectReady(error);
		else resolveReady();
	}

	for (const eventFolder of eventFolders) {
		const eventFiles = getAllFiles(eventFolder);
		eventFiles.sort((a, b) => a.localeCompare(b));

		const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
		client.on(eventName, async (arg) => {
			try {
				if (eventName === "clientReady" && expectedDiscordId &&
					client.user?.id !== expectedDiscordId) {
					const mismatch = new Error("Discord application identity mismatch");
					mismatch.code = "DISCORD_IDENTITY_MISMATCH";
					throw mismatch;
				}
				if (eventName !== "clientReady") await ready;
				for (const eventFile of eventFiles) {
					const eventFunction = require(eventFile);
					await eventFunction(client, arg);
				}
				if (eventName === "clientReady") settleReady();
			} catch (error) {
				const code = safeDatabaseError(error);
				errorLogger.error(`Event ${eventName} failed: ${code}`);
				if (eventName === "clientReady" && onFatal) {
					settleReady(error);
					try {
						await onFatal(code);
					} catch {
						errorLogger.error("Fatal event shutdown failed");
					}
				} else if (eventName === "clientReady") {
					settleReady(error);
				}
			}
		});
	}
	return ready;
};
