// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { infoLogger, warnLogger, errorLogger } = require("../../utils/logger");
const { getConfig } = require("../../config");
const { addAdminIfAbsent } = require("../../repositories/admins");
const { getStatusConfig } = require("../../repositories/configs");
const { safeDatabaseError } = require("../../db");
const { ActivityType } = require("discord.js");

module.exports = async (client) => {
    const config = getConfig();
    try {
        infoLogger.info(config.discord.name + " is online!");
        infoLogger.info("Bot in " + config.env + " mode.");
        const status = await getStatusConfig();
        const activityTypes = {
            PLAYING: ActivityType.Playing,
            LISTENING: ActivityType.Listening,
            WATCHING: ActivityType.Watching,
            COMPETING: ActivityType.Competing,
        };
        const activityType = status && typeof status.value2 === "string"
            ? activityTypes[status.value2.toUpperCase()]
            : undefined;

        try {
            if (status && status.value && activityType !== undefined) {
                await client.user.setActivity(status.value, { type: activityType });
                infoLogger.info('Bot status set to "' + status.value2 + " " + status.value + '"');
            } else {
                if (status) warnLogger.warn("Stored bot status is invalid; using /help activity.");
                await client.user.setActivity("/help", { type: ActivityType.Listening });
                infoLogger.info('Bot status set to "LISTENING /help"');
            }
        } catch {
            errorLogger.error("Could not apply bot status to Discord on startup");
        }

        await addAdminIfAbsent({
            userId: config.creator.id,
            userName: config.creator.username,
            createdBy: config.creator.username,
            createdById: config.creator.id,
        });
    } catch (error) {
        errorLogger.error(`Bot initialization failed: ${safeDatabaseError(error)}`);
        throw new Error("Bot initialization failed");
    }
};
