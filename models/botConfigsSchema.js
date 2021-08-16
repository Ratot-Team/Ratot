var mongoose = require("mongoose");

const botConfigsSchema = new mongoose.Schema({
    config: "string",
    value: "string",
    value2: "string",
    value3: "string",
    lastModifiedBy: "string"
}, { timestamps: true });

const BotConfigs = mongoose.model("BotConfigs", botConfigsSchema, "botConfigs");

module.exports = {
    BotConfigs: BotConfigs,
    botConfigsSchema: botConfigsSchema
};