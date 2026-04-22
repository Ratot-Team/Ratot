// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

require("dotenv").config();
const {
	EmbedBuilder,
	ApplicationCommandOptionType,
	MessageFlags,
} = require("discord.js");

module.exports = {
	name: "help-commands",
	description:
		"The bot sends the list of all commands and the description of what they do.",
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
		const currentYear = new Date().getFullYear();
		const anonym = interaction.options.getBoolean("anonym");

		const helpCommandsEmbed = new EmbedBuilder()
			.setColor("#66ccff")
			.setTitle("Commands List")
			.addFields(
				{
					name: "/ping",
					value: 'The bot responds with "pong", but to know the bot ping you really have to insist a little bit',
				},
				{
					name: "/prune <number>",
					value: "The bot deletes a certain number of messages. Only admins can use this command.",
				},
				{
					name: "/hug <@someone>",
					value: "The bot gives a hug to someone you mention. You can mention yourself don't be shy!",
				},
				{
					name: "/bot-ping",
					value: "Says the ping value of the bot",
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
			});
		interaction.reply({
			embeds: [helpCommandsEmbed],
			flags: anonym ? MessageFlags.Ephemeral : undefined,
		});
	},
};
