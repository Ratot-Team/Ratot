const { ApplicationCommandOptionType } = require("discord.js");
const { errorLogger } = require("../../utils/logger");

module.exports = {
	name: "bot-ping",
	description: "Says the ping value of the bot.",
	options: [
		{
			name: "anonym",
			description: "Only you can see the response",
			type: ApplicationCommandOptionType.Boolean,
			required: false,
		},
	],
	// botAdminOnly: true,
	// permissionsRequired: [PermissionFlagsBits.ManageMessages],
	// botPermissions: [PermissionFlagsBits.ManageMessages],
	// deleted: true,
	callback: (client, interaction) => {
		try {
			const anonym = interaction.options.getBoolean("anonym");
			let botPing = client.ws.ping;
			interaction.reply({
				content: "My ping is:" + botPing + "ms",
				ephemeral: anonym,
			});
		} catch (error) {
			errorLogger.error("Error on bot ping command. Errors:", error);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				ephemeral: true,
			});
		}
	},
};
