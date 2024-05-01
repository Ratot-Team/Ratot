require("dotenv").config();
const { ApplicationCommandOptionType } = require("discord.js");
const { errorLogger } = require("../../utils/logger");
const e = require("express");

module.exports = {
	name: "hug",
	description:
		"The bot gives a hug to someone you mention. You can mention yourself don't be shy!",
	options: [
		{
			name: "user",
			description: "The user you want to hug",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
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
		const userToHug = interaction.options.getUser("user");
		const anonym = interaction.options.getBoolean("anonym");

		try {
			if (userToHug.id === process.env.RATOT_CURRENT_DISCORD_ID) {
				//If the user mentioned the bot
				interaction.reply({
					content:
						"I hugged myself as requested by <@" +
						interaction.member.user.id +
						">",
					ephemeral: anonym,
				});
			} else if (userToHug.id === interaction.member.user.id) {
				//If the user mentioned himself
				interaction.reply({
					content: "I hugged you!",
					ephemeral: anonym,
				});
			} else {
				interaction.reply({
					content:
						"I hugged <@" +
						userToHug.id +
						"> as requested by <@" +
						interaction.member.user.id +
						">",
					ephemeral: anonym,
				});
			}
		} catch (error) {
			errorLogger.error("Error on hug command. Errors:", error);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				ephemeral: true,
			});
		}
	},
};
