// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { ApplicationCommandOptionType, MessageFlags } = require("discord.js");
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
				flags: anonym ? MessageFlags.Ephemeral : undefined,
			});
		} catch (error) {
			errorLogger.error("Error on bot ping command. Errors:", error);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
