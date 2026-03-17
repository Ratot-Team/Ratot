// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

require("dotenv").config();
const { ApplicationCommandOptionType, MessageFlags } = require("discord.js");
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
		if (!interaction.guild) {
			return interaction.reply({
				content: "This command can only be used in a server!",
				flags: MessageFlags.Ephemeral,
			});
		}
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
					flags: anonym ? MessageFlags.Ephemeral : undefined,
				});
			} else if (userToHug.id === interaction.member.user.id) {
				//If the user mentioned himself
				interaction.reply({
					content: "I hugged you!",
					flags: anonym ? MessageFlags.Ephemeral : undefined,
				});
			} else {
				interaction.reply({
					content:
						"I hugged <@" +
						userToHug.id +
						"> as requested by <@" +
						interaction.member.user.id +
						">",
					flags: anonym ? MessageFlags.Ephemeral : undefined,
				});
			}
		} catch (error) {
			errorLogger.error("Error on hug command. Errors:", error);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
