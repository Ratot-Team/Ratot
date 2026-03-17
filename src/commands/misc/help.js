// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

require("dotenv").config();
const {
	EmbedBuilder,
	ApplicationCommandOptionType,
	MessageFlags,
} = require("discord.js");

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
		const helpEmbed = new EmbedBuilder()
			.setColor("#66ccff")
			.setTitle(process.env.RATOT_CURRENT_NAME + " Help Menu")
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
				"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
			)
			.setAuthor({
				name: process.env.RATOT_CURRENT_NAME,
				iconURL:
					"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
				url: "https://github.com/Ratot-Team/Ratot",
			})
			.setFooter({
				text: "Copyright © " + currentYear + " by Captain Ratax",
				iconURL:
					"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
			}); //Create a personalized embed message
		interaction.reply({
			embeds: [helpEmbed],
			flags: anonym ? MessageFlags.Ephemeral : undefined,
		}); //Send that embed message
	},
};
