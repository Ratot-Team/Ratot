// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const {
	EmbedBuilder,
	ApplicationCommandOptionType,
	MessageFlags,
} = require("discord.js");
const { getConfig } = require("../../config");

module.exports = {
	name: "help",
	description:
		"The bot sens a menu with some information about the bot and some commands to help.",
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
		//get the current year
		const anonym = interaction.options.getBoolean("anonym");
		const currentYear = new Date().getFullYear();
		const botName = getConfig().discord.name;
		const helpEmbed = new EmbedBuilder()
			.setColor("#66ccff")
			.setTitle(botName + " Help Menu")
			.addFields(
				{
					name: "Commands List",
					value: "/help-commands",
				},
				{
					name: "\u200B",
					value: "\u200B",
				},
				{
					name: "See my code on GitHub!",
					value: "https://github.com/Ratot-Team/Ratot",
				},
			)
			.setTimestamp()
			.setThumbnail(
				"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
			)
			.setAuthor({
				name: botName,
				iconURL:
					"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
				url: "https://github.com/Ratot-Team/Ratot",
			})
			.setFooter({
				text: "Copyright © " + currentYear + " by Captain Ratax",
				iconURL:
					"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
			}); //Create a personalized embed message
		interaction.reply({
			embeds: [helpEmbed],
			flags: anonym ? MessageFlags.Ephemeral : undefined,
		}); //Send that embed message
	},
};
