// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

require("dotenv").config();
var { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } = require("discord.js");

const { errorLogger, warnLogger } = require("../../utils/logger");
const { BotAdmin } = require("../../../models/botAdminsSchema");
const e = require("express");

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
			let checkAdmin = await BotAdmin.find({
				userId: interaction.member.user.id,
			});
			let isBotAdmin;
			if (!checkAdmin.length || checkAdmin.length === 0) {
				isBotAdmin =
					interaction.member.user.id ===
					process.env.RATOT_CREATOR_DISCORD_ID;
			} else {
				isBotAdmin = true;
			}
			if (!isBotAdmin) {
				return interaction.reply({
					content: "Only bot admins can use this command!",
					flags: MessageFlags.Ephemeral,
				});
			} else {
				if (userToAdd.id === process.env.RATOT_CURRENT_DISCORD_ID) {
					return interaction.reply({
						content: "I cannot be my own administrator",
						flags: MessageFlags.Ephemeral,
					}); //Send a warning message to the user
				}
				let verifyUser = await BotAdmin.find({
					userId: userToAdd.id,
				});
				if (!verifyUser.length || verifyUser.length === 0) {
					let newAdmin = new BotAdmin({
						userId: userToAdd.id,
						userName: userToAdd.username,
						createdBy: interaction.member.user.username,
						createdById: interaction.member.user.id,
					});
					newAdmin.save();
					interaction.reply({
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
									process.env.RATOT_CURRENT_NAME +
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
								"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
							)
							.setAuthor({
								name: process.env.RATOT_CURRENT_NAME,
								iconURL:
									"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
								url: "https://github.com/Ratot-Team/Ratot",
							})
							.setFooter({
								text:
									"Copyright © " +
									currentYear +
									" by Captain Ratax",
								iconURL:
									"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
							});
						try {
							userToAdd
								.send({
									embeds: [adminEmbed],
								})
								.catch(() =>
									interaction.reply({
										content:
											"It wasn't possible to send private message to the user with the admin informations.",
										flags: MessageFlags.Ephemeral,
									}),
								);
						} catch (err) {
							errorLogger.error(
								"An error as occurred when trying to send private message to user. Error:",
								error,
							);
						}
					} catch (error) {
						errorLogger.error(
							"An error as occurred when trying to send private message to user. Error:",
							error,
						);
						return interaction.reply({
							content:
								"It wasn't possible to send private message to the user with the admin informations.",
							flags: MessageFlags.Ephemeral,
						});
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
			errorLogger.error("Error on  command add admin. Errors:", error);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
