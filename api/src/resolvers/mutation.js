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

const throwForbiddenError = (msg = 'Request failed') => {
    throw new GraphQLError(msg, {
        extensions: {
            code: 'FORBIDDEN',
            http: { status: 403 }
        },
    });
};

export default { 
    newNote: async (parent, args, { models, user }) => {
        if (!user) {
            throwAuthError('노트를 생성하려면 로그인해야 합니다.');
        }

        return await models.Note.create({
            content: args.content,
            author: user.id
        });
    },

    deleteNote: async (parent, { id }, { models, user }) => {
        if (!user) {
            throwAuthError('노트를 삭제하려면 로그인해야 합니다.');
        }

        const note = await models.Note.findById(id);

        if (note && String(note.author) !== user.id) {
            throwForbiddenError('자신의 노트만 삭제할 수 있습니다.');
        }

        try {
            await note.deleteOne();
            return true;
            // const result = await models.Note.findOneAndDelete({ _id: id });
            // return result.deletedCount === 1;
        } catch (err) {
            console.error('노트 삭제 중 오류 발생: ', err);
            throw new GraphQLError('노트 삭제 중 오류가 발생했습니다.');
        }
    },

    updateNote: async (parent, { content, id }, { models, user }) => {
        if (!user) {
            throwAuthError('노트를 수정하려면 로그인해야 합니다.');
        }

        const note = await models.Note.findById(id);

        if (note && String(note.author) !== user.id) {
            throwForbiddenError('자신의 노트만 수정할 수 있습니다.');
        }
        
        try {
            return await models.Note.findOneAndUpdate(
                { _id: id },
                { $set: { content } },
                { new: true }
            );
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
