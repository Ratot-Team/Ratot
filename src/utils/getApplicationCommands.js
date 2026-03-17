// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

module.exports = async (client, guildId) => {
    let applicationCommands;

    if (guildId) {
        const guild = await client.guilds.fetch(guildId);
        applicationCommands = guild.commands;
    }else{
        applicationCommands = await client.application.commands;
    }

    await applicationCommands.fetch();
    return applicationCommands;
}