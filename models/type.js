import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TypeSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{ versionKey: false }
);

const Type = mongoose.model('Type', TypeSchema);

export default Type;
