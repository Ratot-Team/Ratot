const { ApplicationCommandOptionType } = require("discord.js");
const { errorLogger } = require("../../utils/logger");
var lastPing, pingCounter; //For ping and pong reasons xD
//lastPing- saves the Id of the person that called the last ping command
//pingCounter - Saves how many times the same person called the ping command

module.exports = {
	name: "ping",
	description:
		'The bot responds with "pong", but to know the bot ping you really have to insist a little bit',
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
			var botPing = client.ws.ping;
			if (lastPing === interaction.user.id) {
				//If is the same person that called the ping command before
				pingCounter++;
				if (pingCounter >= 5) {
					//If the same person has called the ping command 5 or more times in a row
					interaction.reply({
						content: "Oh... Sorry... Right! My ping is " + botPing + "ms",
						ephemeral: anonym,
					});
					lastPing = interaction.user.id; //Saves who called the ping command
					pingCounter = 1; //Reset the ping counter
				} else {
					interaction.reply({
						content: "Pong",
						ephemeral: anonym,
					});
				}
			} else {
				lastPing = interaction.user.id;
				pingCounter = 1;
				interaction.reply({
					content: "Pong",
					ephemeral: anonym,
				});
			}
		} catch (error) {
			errorLogger.error("Error on ping command. Errors:", error);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				ephemeral: true,
			});
		}
	},
};
