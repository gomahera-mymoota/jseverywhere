import mongoose from 'mongoose';

// module.exports = {
export default {
    connect: DB_HOST => {
        // mongoose.set('useNewUrlParser', true);
        // mongoose.set('useFindAndModify', false);
        // mongoose.set('useCreateIndex', true);
        // mongoose.set('useUnifiedTopology', true);
        mongoose.set('strictQuery', true);

        mongoose.connect(DB_HOST);
        mongoose.connection.on('error', err => {
            console.error(err);
            console.log(
                'MongoDB connection error. Please make sure MongoDB is running.'
            );
            process.exit();
        });
    },
    close: () => mongoose.connection.close()
}