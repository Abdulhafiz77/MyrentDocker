import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DistrictSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		province: {
			type: Schema.Types.ObjectId,
			ref: 'Province',
		},
	},
	{ versionKey: false }
);

const District = mongoose.model('District', DistrictSchema);

export default District;
