import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProvinceSchema = new Schema(
	{
		code: {
			type: Number,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{ versionKey: false }
);

const Province = mongoose.model('Province', ProvinceSchema);

export default Province;
