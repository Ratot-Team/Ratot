// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

var mongoose = require("mongoose");

const botConfigsSchema = new mongoose.Schema(
  {
    config: "string",
    value: "string",
    value2: "string",
    value3: "string",
    lastModifiedBy: "string",
  },
  { timestamps: true }
);

const BotConfigs = mongoose.model("BotConfigs", botConfigsSchema, "botConfigs");

module.exports = {
  BotConfigs,
  botConfigsSchema,
};
