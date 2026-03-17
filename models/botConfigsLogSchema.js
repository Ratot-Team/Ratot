// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

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
