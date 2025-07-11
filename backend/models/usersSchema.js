import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	employeeId: {
		type: String,
		unique: true,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		default: "",
	},
	otp: {
		type: Number,
		required: false,
	},
});

export const Users = mongoose.model("Users", usersSchema);
