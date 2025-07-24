import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import 'dotenv/config';
import gravatar from '../util/gravatar.js';

export default { 
    newNote: async (parent, args, { models }) => await models.Note.create({
        content: args.content,
        author: 'IceMan4U'
    }),
    deleteNote: async (parent, { id }, { models }) => {
        try {
            await models.Note.findOneAndDelete({ _id: id });
            return true;
        } catch (err) {
            return false;
        }
    },
    updateNote: async (parent, { content, id }, { models }) => 
        await models.Note.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $set: {
                    content
                }
            },
            {
                new: true
            }
        ),
    signUp: async (parent, { username, email, password }, { models }) => {
        email = email.trim().toLowerCase();
        const hashed = await bcrypt.hash(password, 10);
        const avatar = gravatar(email);

        try {
            const user = await models.User.create({
                username,
                email,
                avatar,
                password: hashed
            });

            return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        } catch (err) {
            console.log(err);

            throw new Error('Error: creating account');
        }
    },
}
