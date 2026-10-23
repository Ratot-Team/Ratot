// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

var { ApplicationCommandOptionType, MessageFlags } = require("discord.js");

const { errorLogger, warnLogger } = require("../../utils/logger");
const { getConfig } = require("../../config");
const { isAdmin, removeAdminsByUserId } = require("../../repositories/admins");
const { safeDatabaseError } = require("../../db");

module.exports = {
	name: "remove-bot-admin",
	description:
		"Remove an administrator of the bot (don't do it without the creator permission!)",
	options: [
		{
			name: "user",
			description: "The user you want to remove as a bot administrator",
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
	botAdminOnly: true,
	// permissionsRequired: [PermissionFlagsBits.ManageMessages],
	// botPermissions: [PermissionFlagsBits.ManageMessages],
	// deleted: true,
	callback: async (client, interaction) => {
		const userToRemove = interaction.options.getUser("user");
		const anonym = interaction.options.getBoolean("anonym");

		try {
			const config = getConfig();
			const hasAdminRecord = await isAdmin(interaction.member.user.id);
			const isBotAdmin =
				hasAdminRecord || interaction.member.user.id === config.creator.id;
			if (!isBotAdmin) {
				return interaction.reply({
					content: "Only bot admins can use this command!",
					flags: MessageFlags.Ephemeral,
				});
			} else {
				if (userToRemove.id === config.discord.id) {
					return interaction.reply({
						content: "I cannot be my own administrator",
						flags: MessageFlags.Ephemeral,
					}); //Send a warning message to the user
				}
				const removed = await removeAdminsByUserId(userToRemove.id);
				if (removed === 0) {
					return interaction.reply({
						content:
							"<@" + userToRemove.id + "> isn't my administrator",
						flags: MessageFlags.Ephemeral,
					});
				} else {
					warnLogger.warn(
						interaction.member.user.username +
							" removed the user " +
							userToRemove.username +
							" with the Id " +
							userToRemove.id +
							" from admin!",
					);
					return interaction.reply({
						content:
							"<@" +
							userToRemove.id +
							"> is no longer my administrator now",
						flags: anonym ? MessageFlags.Ephemeral : undefined,
					});
				}
			}
		} catch (error) {
			errorLogger.error(`Remove admin command failed: ${safeDatabaseError(error)}`);
			return interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
