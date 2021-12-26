var mongoose = require("mongoose");

const prefixSchema = new mongoose.Schema({
    prefix: "string",
    guildId: "string",
    updatedBy: "string",
}, { timestamps: true });

const Prefix = mongoose.model("Prefix", prefixSchema, "prefixes");

module.exports = {
    Prefix,
    prefixSchema,
};