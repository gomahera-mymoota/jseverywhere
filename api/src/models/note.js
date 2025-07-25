import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            require: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        }
    },
    {
        // Date 자료형으로 crateAt, updateAt 필드 할당
        timestamps: true
    }
);

export default mongoose.model('Note', noteSchema);