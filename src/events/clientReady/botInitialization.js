const { infoLogger, errorLogger } = require("../../utils/logger");
const { BotConfigs } = require("../../../models/botConfigsSchema");
const { BotAdmin } = require("../../../models/botAdminsSchema");
const { ActivityType } = require("discord.js");

module.exports = async (client) => {
    try {
        infoLogger.info(process.env.RATOT_CURRENT_NAME + " is online!");
        if (process.env.RATOT_CURRENT_TOKEN === process.env.RATOT_DEV_TOKEN) {
            //If we are using the dev bot
            infoLogger.info("Bot in dev mode.");
        } else {
            infoLogger.info("Bot in production mode.");
        }
        let checkConfigs = await BotConfigs.find({
            config: "Status",
        });
        if (!checkConfigs.length || checkConfigs.length === 0) {
            try {
                client.user.setActivity("/help", {
                    type: ActivityType.Listening,
                }); //Set an activity to the bot saying that he is listening to $help
                infoLogger.info('Bot status set to "LISTENING /help"');
            } catch (err) {
                errorLogger.error("Error on client.once method! Errors:", err);
            }
        } else {
            try {
                client.user.setActivity(checkConfigs[0].value, {
                    type: checkConfigs[0].valueInt,
                });
                infoLogger.info(
                    'Bot status set to "' +
                        checkConfigs[0].value2 +
                        " " +
                        checkConfigs[0].value +
                        '"'
                );
            } catch (err) {
                errorLogger.error("Error on client.once method! Errors:", err);
            }
        }

        //Verify if the creator is already on the database as an admin
        let checkAdmin = await BotAdmin.find({
            userId: process.env.RATOT_CREATOR_DISCORD_ID,
        });
        if (!checkAdmin.length || checkAdmin.length === 0) {
            let creator = new BotAdmin({
                userId: process.env.RATOT_CREATOR_DISCORD_ID,
                userName: process.env.RATOT_CREATOR_DISCORD_USERNAME,
                createdBy: process.env.RATOT_CREATOR_DISCORD_USERNAME,
                createdById: process.env.RATOT_CREATOR_DISCORD_ID,
            });
            creator.save();
        }
    } catch (error) {
        errorLogger.error("Error on client.once method! Errors:", error);
    }
};
