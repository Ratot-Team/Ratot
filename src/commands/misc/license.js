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
	name: "license",
	description: "Shows the bot license information and source code link.",
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
			.setTitle(process.env.RATOT_CURRENT_NAME + " License")
			.setDescription(
				"This bot is free software licensed under the GNU Affero General Public License v3.0 or later.",
			)
			.addFields(
				{
					name: "License",
					value: "GNU AGPL v3.0-or-later",
				},
				{
					name: "Source Code",
					value: "https://github.com/Ratot-Team/Ratot",
				},
				{
					name: "License Details",
					value: "See the LICENSE file in the GitHub repository for the full license text.",
				},
				{
					name: "Your Rights",
					value: "You can study, share, and modify this bot under the terms of the AGPL v3 or later.",
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
