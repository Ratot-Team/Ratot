// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { errorLogger } = require("../utils/logger");
const { MessageFlags } = require("discord.js");
const pendingConfirmationIds = new Map();

module.exports = async (interaction, messagesToDelete, anonym) => {
	const channelId = interaction.channel.id;
	const excludedIds = pendingConfirmationIds.get(channelId) || new Set();
	const recentMessages = await interaction.channel.messages.fetch({
		limit: Math.min(100, messagesToDelete + excludedIds.size),
	});
	const selectedMessages = recentMessages
		.filter((message) => !excludedIds.has(message.id))
		.first(messagesToDelete);
	const deletedCount = (await interaction.channel.bulkDelete(selectedMessages, true)).size;

	let content;
	if (deletedCount === 0) {
		content = "No messages have been deleted, probably because the messages are older than 14 days.";
	} else if (deletedCount === 1) {
		content = "1 message has been deleted!";
	} else {
		content = `${deletedCount} messages have been deleted!`;
	}

	const response = await interaction.reply({
		content,
		flags: anonym ? MessageFlags.Ephemeral : undefined,
		withResponse: !anonym,
	});
	if (anonym) return;

	const replyId = response?.resource?.message?.id;
	if (replyId) {
		const ids = pendingConfirmationIds.get(channelId) || new Set();
		ids.add(replyId);
		pendingConfirmationIds.set(channelId, ids);
	}
	const timer = setTimeout(() => {
		void interaction.deleteReply().then(() => {
			if (!replyId) return;
			const ids = pendingConfirmationIds.get(channelId);
			ids?.delete(replyId);
			if (ids?.size === 0) pendingConfirmationIds.delete(channelId);
		}).catch(() => errorLogger.error("Could not remove prune confirmation."));
	}, 6000);
	timer.unref?.();
};
