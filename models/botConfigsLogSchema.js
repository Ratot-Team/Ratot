var mongoose = require("mongoose");

const botConfigsLogSchema = new mongoose.Schema(
  {
    changed: "string",
    changedTo: "string",
    changedTo2: "string",
    changedTo3: "string",
    changedBy: "string",
    changedById: "string",
  },
  { timestamps: true }
);

const BotConfigsLog = mongoose.model(
  "BotConfigsLog",
  botConfigsLogSchema,
  "botConfigsLogs"
);

module.exports = {
  BotConfigsLog,
  botConfigsLogSchema,
};
