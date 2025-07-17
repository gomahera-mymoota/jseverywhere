// ES6
import mongoose from 'mongoose';

// CommonJS
// const mongoose = require('mongoose');

// CommonJS
// module.exports = {
    
// ES6
export default {
    connect: DB_HOST => {
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