import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import 'dotenv/config';
import gravatar from '../util/gravatar.js';

// 상수 정의 [Gemini]
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('환경 변수 JWT_SECRET이 설정되지 않았습니다.');
    process.exit(1);
}

// 공통 인증 에러용 헬퍼 함수 [Gemini]
const throwAuthError = (msg = 'Authentication failed') => {
    throw new GraphQLError(msg, {
        extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 }       // HTTP 상태 코드 포함 -> 클라이언트가 더 잘 처리하도록
        },
    });
};

export default { 
    newNote: async (parent, args, { models }) => await models.Note.create({
        content: args.content,
        author: 'IceMan4U'
    }),

    deleteNote: async (parent, { id }, { models }) => {
        try {
            const result = await models.Note.findOneAndDelete({ _id: id });
            return result.deletedCount === 1;
        } catch (err) {
            console.error('노트 삭제 중 오류 발생: ', err);
            throw new GraphQLError('노트 삭제 중 오류가 발생했습니다.');
        }
    },

    updateNote: async (parent, { content, id }, { models }) => {
        try {
            const updatedNote = await models.Note.findOneAndUpdate(
                { _id: id },
                { $set: { content } },
                { new: true }
            );
            if (!updateNote) {
                throw new GraphQLError('노트를 찾을 수 없거나 업데이트 권한이 없습니다.', {
                    extensions: {
                        code: 'NOT_FOUND',
                        http: { status : 404 }
                    }
                });
            }

            return updatedNote;
        } catch (err) {
            console.error('노트 업데이트 중 오류 발생: ', err);
            throw new GraphQLError('노트 업데이트 중 오류가 발생했습니다.');
        }
    },

    signUp: async (parent, { username, email, password }, { models }) => {
        const processedEmail = email.trim().toLowerCase();
        const hashed = await bcrypt.hash(password, 10);
        const avatarUrl = gravatar(processedEmail);

        try {
            const user = await models.User.create({
                username,
                email: processedEmail,
                avatarUrl,
                password: hashed,
            });

            return jwt.sign({ id: user._id }, JWT_SECRET);
        } catch (err) {
            console.error('회원가입 중 오류 발생: ', err);

            if (err.code === 11000) {
                throw new GraphQLError('이미 존재하는 사용자 이름 또는 이메일입니다.', {
                    extensions: {
                        code: 'DUPLICATE_KEY',
                        http: { status: 409 }   // Conflict
                    },
                });
            }

            throw new GraphQLError('회원가입 중 알 수 없는 오류가 발생했습니다.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    http: { status: 500 }
                }
            });
        }
    },

    signIn: async (parent, { username, email, password }, { models }) => {
        const processedEmail = email ? email.trim().toLowerCase() : undefined;
        
        const user = await models.User.findOne({
            $or: [{ email: processedEmail }, { username }]
        });

        if (!user) {
            throwAuthError('잘못된 사용자 이름 또는 비밀번호입니다.');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throwAuthError('잘못된 사용자 이름 또는 비밀번호입니다.');
        }
        
        return jwt.sign({ id: user._id }, JWT_SECRET);
    }
};
