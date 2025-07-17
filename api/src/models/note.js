import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            require: true
        },
        author: {
            type: String,
            require: true
        }
    },
    {
        // Date 자료형으로 crateAt, updateAt 필드 할당
        timestamps: true
    }
);

export default mongoose.model('Note', noteSchema);