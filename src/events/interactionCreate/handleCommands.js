const { errorLogger } = require("../../utils/logger");
const getLocalCommands = require("../../utils/getLocalCommands");

require("dotenv").config();

module.exports = async (client, interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const localCommands = getLocalCommands();

	try {
		const commandObject = localCommands.find(
			(cmd) => cmd.name === interaction.commandName
		);

		if (!commandObject) return;

		if (commandObject.permissionsRequired?.length) {
			for (const permission of commandObject.permissionsRequired) {
				if (!interaction.member.permissions.has(permission)) {
					return interaction.reply({
						content: `You need the permissions to use this command!`,
						ephemeral: true,
					});
				}
			}
		}

		if (commandObject.botPermissions?.length) {
			for (const permission of commandObject.botPermissions) {
				const bot = interaction.guild.members.me;

				if (!bot.permissions.has(permission)) {
					return interaction.reply({
						content: `I need permissions to use this command!`,
						ephemeral: true,
					});
				}
			}
		}

        await commandObject.callback(client, interaction);
	} catch (error) {
		errorLogger.error("Error on handleCommands.js. Errors:", error);
	}
};
