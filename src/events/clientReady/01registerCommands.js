const { errorLogger, warnLogger } = require("../../utils/logger");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

require("dotenv").config();

module.exports = async (client) => {
	try {
		const localCommands = getLocalCommands();
		const applicationCommands = await getApplicationCommands(client);
		const botAdminOnlyCommands = await getApplicationCommands(
			client,
			process.env.RATOT_GUILD_ID
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
						botAdminOnlyCommands.edit(existingCommand.id, {
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
		errorLogger.error("Error on registerCommands.js. Errors:", error);
	}
};
