// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

var { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } = require("discord.js");

const { errorLogger, warnLogger } = require("../../utils/logger");
const { getConfig } = require("../../config");
const { isAdmin, addAdminIfAbsent } = require("../../repositories/admins");
const { safeDatabaseError } = require("../../db");

module.exports = {
	name: "add-bot-admin",
	description:
		"Add a new administrator to the bot (don't do it without the creator permission!)",
	options: [
		{
			name: "user",
			description: "The user you want to add as a bot administrator",
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
		const userToAdd = interaction.options.getUser("user");
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
				if (userToAdd.id === config.discord.id) {
					return interaction.reply({
						content: "I cannot be my own administrator",
						flags: MessageFlags.Ephemeral,
					}); //Send a warning message to the user
				}
				const { created } = await addAdminIfAbsent({
					userId: userToAdd.id,
					userName: userToAdd.username,
					createdBy: interaction.member.user.username,
					createdById: interaction.member.user.id,
				});
				if (created) {
					await interaction.reply({
						content:
							"<@" + userToAdd.id + "> is now an administrator!",
						flags: anonym ? MessageFlags.Ephemeral : undefined,
					});
					warnLogger.warn(
						interaction.member.user.username +
							" added the user " +
							userToAdd.username +
							" with the id " +
							userToAdd.id +
							" as admin!",
					);
					try {
						let currentYear = new Date().getFullYear();
						const adminEmbed = new EmbedBuilder()
							.setColor("#66ccff")
							.setTitle(
								" Now you are an administrator of the " +
									config.discord.name +
									" Bot!",
							)
							.setDescription(
								"Here is some commands you can do now:",
							)
							.addFields(
								{
									name: "/change-status <number of status> <status>",
									value: "Change the status message of the bot",
								},
								{
									name: "/add-bot-admin <@someone>",
									value: "Add a new administrator to the bot __**(don't do it without the creator permission!)**__",
								},
								{
									name: "/remove-bot-admin <@someone>",
									value: "Remove an administrator of the bot __**(don't do it without the creator permission!)**__",
								},
								{
									name: "/list-servers",
									value: "Lists all the servers the bot is on",
								},
								{
									name: "/list-channels <optionalServerId>",
									value: "Lists all the channels from a given server ID or from the server where the message is sent.",
								},
							)
							.setTimestamp()
							.setThumbnail(
								"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
							)
							.setAuthor({
								name: config.discord.name,
								iconURL:
									"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
								url: "https://github.com/Ratot-Team/Ratot",
							})
							.setFooter({
								text:
									"Copyright © " +
									currentYear +
									" by Captain Ratax",
								iconURL:
									"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
							});
						await userToAdd.send({ embeds: [adminEmbed] });
					} catch {
						errorLogger.error("Could not send admin notification to user");
						try {
							await interaction.followUp({
								content:
									"It wasn't possible to send private message to the user with the admin informations.",
								flags: MessageFlags.Ephemeral,
							});
						} catch {
							errorLogger.error("Could not report admin notification failure");
						}
					}
					return;
				} else {
					return interaction.reply({
						content: "That user is already my administrator",
						flags: anonym ? MessageFlags.Ephemeral : undefined,
					});
				}
			}
		} catch (error) {
			errorLogger.error(`Add admin command failed: ${safeDatabaseError(error)}`);
			const response = {
				content:
					"Something wrong happened when trying to execute that command...",
				flags: MessageFlags.Ephemeral,
			};
			return interaction.replied || interaction.deferred
				? interaction.followUp(response)
				: interaction.reply(response);
		}
	},
};
