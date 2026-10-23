// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { errorLogger, warnLogger } = require("../../utils/logger");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const { getConfig } = require("../../config");
const { safeDatabaseError } = require("../../db");

module.exports = async (client) => {
	try {
		const localCommands = getLocalCommands();
		const applicationCommands = await getApplicationCommands(client);
		const botAdminOnlyCommands = await getApplicationCommands(
			client,
			getConfig().guildId
		);

		for (const localCommand of localCommands) {
			const { name, description, options } = localCommand;

			var existingCommand = null;

			if (localCommand.botAdminOnly) {
				existingCommand = await botAdminOnlyCommands.cache.find(
					(cmd) => cmd.name === name
				);
			} else {
				existingCommand = await applicationCommands.cache.find(
					(cmd) => cmd.name === name
				);
			}

			if (existingCommand) {
				if (localCommand.deleted) {
					if (localCommand.botAdminOnly) {
						await botAdminOnlyCommands.delete(existingCommand.id);
						warnLogger.warn(`Admin only command ${name} deleted!`);
					} else {
						await applicationCommands.delete(existingCommand.id);
						warnLogger.warn(`Global command ${name} deleted!`);
					}
					continue;
				}
				if (areCommandsDifferent(existingCommand, localCommand)) {
					if (localCommand.botAdminOnly) {
					await botAdminOnlyCommands.edit(existingCommand.id, {
							description,
							options,
						});
						warnLogger.warn(`Admin only command ${name} edited!`);
					} else {
						await applicationCommands.edit(existingCommand.id, {
							description,
							options,
						});
						warnLogger.warn(`Global command ${name} edited!`);
					}
				}
			} else {
				if (localCommand.deleted) {
					continue;
				}

				if (localCommand.botAdminOnly) {
					await botAdminOnlyCommands.create({
						name,
						description,
						options,
					});
					warnLogger.warn(`Admin only command ${name} created!`);
				} else {
					await applicationCommands.create({
						name,
						description,
						options,
					});
					warnLogger.warn(`Global command ${name} created!`);
				}
			}
		}
	} catch (error) {
		errorLogger.error(
			`Error on registerCommands.js: ${safeDatabaseError(error)}`,
		);
		const failure = new Error("Discord command registration failed");
		failure.code = "DISCORD_COMMAND_REGISTRATION_FAILED";
		throw failure;
	}
};
