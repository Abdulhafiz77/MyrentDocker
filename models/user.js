import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		name: {
			type: String,
			maxLength: 30,
			required: true,
		},
		password: {
			type: String,
			minLength: 5,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		image: {
			type: String,
			default:
				"https://t4.ftcdn.net/jpg/03/59/58/91/360_F_359589186_JDLl8dIWoBNf1iqEkHxhUeeOulx0wOC5.jpg",
		},
		favorites: [
			{
				type: Schema.Types.ObjectId,
				ref: "Estate",
			},
		],
		role: {
			type: String,
			enum: ["user", "admin", "banned"],
			default: "user",
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{ versionKey: false, timestamps: true }
);

// password hashing
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(this.password, salt);
		this.password = hashedPassword;
	} catch (error) {
		return next(error);
	}
})

// password checking
UserSchema.methods.checkPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
}

// user verify
UserSchema.methods.userVerify = async function () {
    this.verified = true;
    await this.save();
}


const User = mongoose.model('User', UserSchema);
export default User;
