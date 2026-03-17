// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

var mongoose = require("mongoose");

const botAdminsSchema = new mongoose.Schema(
  {
    userId: "string",
    userName: "string",
    createdBy: "string",
    createdById: "string",
  },
  { timestamps: true }
);

const BotAdmin = mongoose.model("BotAdmin", botAdminsSchema, "botAdmins");

module.exports = {
  BotAdmin,
  botAdminsSchema,
};
