import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const LocationSchema = new Schema(
	{
		province: {
			type: Schema.Types.ObjectId,
			ref: 'Province',
			required: true,
		},
		district: {
			type: Schema.Types.ObjectId,
			ref: 'District',
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
	},
	{ versionKey: false }
);

const Location = mongoose.model('Location', LocationSchema);

export default Location;
