var {
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} = require("discord.js");

const bulkDeleteMessages = require("../../utils/bulkDeleteMessages");
const { errorLogger } = require("../../utils/logger");

var del_command_timeouts = Object.create(null);

module.exports = {
	name: "prune",
	description:
		"The bot deletes a certain number of messages. Only admins can use this command.",
	options: [
		{
			name: "number",
			description: "Number of messages to delete",
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
	// botAdminOnly: true,
	// permissionsRequired: [PermissionFlagsBits.ManageMessages],
	// botPermissions: [PermissionFlagsBits.ManageMessages],
	// deleted: true,
	callback: async (client, interaction) => {
		try {
			const messagesToDelete = interaction.options.getInteger("number");

			if (
				!interaction.member.permissions.has(
					PermissionFlagsBits.Administrator
				) &&
				!interaction.member
					.permissionsIn(interaction.channel)
					.has(PermissionFlagsBits.ManageMessages)
			) {
				return interaction.reply({
					content:
						"Only users with the manage messages permission can delete messages!",
					ephemeral: true,
				});
			}
			//Only proceed to the deletion of the messages if the user is an admin
			const bot = interaction.guild.members.me;
			if (
				!bot.permissions.has(PermissionFlagsBits.Administrator) &&
				!interaction.member.guild.members.cache
					.get(client.user.id)
					.permissionsIn(interaction.channel)
					.has(PermissionFlagsBits.ManageMessages)
			) {
				return interaction.reply({
					content: "I don't have permission to delete messages!",
					ephemeral: true,
				});
			}

			if (messagesToDelete > 99) {
				return interaction.reply({
					content:
						"Unfortunately you can only delete a maximum of 99 messages at a time",
				});
			}
			if (messagesToDelete < 0) {
				return interaction.reply({
					content:
						"Think a little bit of what you asked me to do... Did you really thought you could delete negative messages? Pff humans...",
				});
			}
			if (messagesToDelete === 0) {
				return interaction.reply({
					content:
						"Nothing deleted! Because you know... 0 is nothing... human...",
				});
			}

			let currentDate = new Date();

            let channelId = interaction.channel.id;

			if (!del_command_timeouts[channelId]) {
				del_command_timeouts[channelId] = {
					date: currentDate,
					AlreadyMessaged: false,
				};
				await bulkDeleteMessages(interaction, messagesToDelete);
			} else {
				let timeSpent =
					currentDate.getTime() -
					del_command_timeouts[channelId].date;
				if (timeSpent > 10000) {
					del_command_timeouts[channelId].date = currentDate;
					await bulkDeleteMessages(interaction, messagesToDelete);
				} else {
					del_command_timeouts[channelId].date = currentDate;
					let auxTimeLeft = Math.floor((10000 - timeSpent) / 1000);
					return interaction.reply({
						content:
							"You need to wait 10 seconds before using the delete command on this channel again. " +
							auxTimeLeft +
							" seconds left",
						ephemeral: true,
					});
				}
			}
		} catch (error) {
            errorLogger.error("Error on delete.js file. Errors:", error);
            return interaction.reply({
                content: "Something wrong happened when trying to execute that command...",
                ephemeral: true,
            });
        }
	},
};
