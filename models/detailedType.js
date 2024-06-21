import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DetailedTypeSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		parent: {
			type: Schema.Types.ObjectId,
			ref: 'Type',
			required: true,
		},
	},
	{ versionKey: false }
);

const DetailedType = mongoose.model('DetailedType', DetailedTypeSchema);

export default DetailedType;
