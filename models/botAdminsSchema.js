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
