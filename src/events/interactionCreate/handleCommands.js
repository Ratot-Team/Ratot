// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { errorLogger } = require("../../utils/logger");
const getLocalCommands = require("../../utils/getLocalCommands");
const { MessageFlags } = require("discord.js");

require("dotenv").config();

module.exports = async (client, interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const localCommands = getLocalCommands();

	try {
		const commandObject = localCommands.find(
			(cmd) => cmd.name === interaction.commandName,
		);

		if (!commandObject) return;

		if (commandObject.permissionsRequired?.length) {
			for (const permission of commandObject.permissionsRequired) {
				if (!interaction.member.permissions.has(permission)) {
					return interaction.reply({
						content: `You need the permissions to use this command!`,
						flags: MessageFlags.Ephemeral,
					});
				}
			}
		}

		if (commandObject.botPermissions?.length) {
			for (const permission of commandObject.botPermissions) {
				const bot = interaction.guild.members.me;

				if (!bot.permissions.has(permission)) {
					return interaction.reply({
						content: `I need permissions to use this command!`,
						flags: MessageFlags.Ephemeral,
					});
				}
			}
		}

		await commandObject.callback(client, interaction);
	} catch (error) {
		errorLogger.error("Error on handleCommands.js. Errors:", error);
	}
};
