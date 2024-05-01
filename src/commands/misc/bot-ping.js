const { errorLogger } = require("../../utils/logger");

module.exports = {
	name: "bot-ping",
	description: "Says the ping value of the bot.",
	// options: Object[],
	// botAdminOnly: true,
	// permissionsRequired: [PermissionFlagsBits.ManageMessages],
	// botPermissions: [PermissionFlagsBits.ManageMessages],
	// deleted: true,
	callback: (client, interaction) => {
		try {
			let botPing = client.ws.ping;
			interaction.reply({
				content: "My ping is:" + botPing + "ms",
			});
		} catch (error) {
			errorLogger.error("Error on bot ping command. Errors:", error);
			interaction.reply(
				"Something wrong happened when trying to execute that command..."
			);
		}
	},
};
