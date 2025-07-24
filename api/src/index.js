import 'dotenv/config'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import db from './db.js';
import models from './models/index.js';
import typeDefs from './schema.js';
import resolvers from './resolvers/index.js';

// 환경 변수 검증 및 정의
const { DB_HOST, PORT, JWT_SECRET } = process.env;

// 필수 환경 변수 검증
if (!DB_HOST) {
    console.error('❌ 환경 변수 DB_HOST가 설정되지 않았습니다. MongoDB 연결 정보가 필요합니다.');
    process.exit(1); // 중요한 환경 변수가 없으면 즉시 프로세스 종료
}

if (!JWT_SECRET) {
    console.error('❌ 환경 변수 JWT_SECRET이 설정되지 않았습니다. JWT 사용에 필요합니다.');
    process.exit(1); // 보안상 중요한 변수 누락 시 즉시 종료
}

const port = parseInt(PORT || '4000', 10);
const path = '/api'

// 서버 시작 로직을 비동기 함수로 묶어 에러 처리 강화
async function startGraphQLServer() {
    try {
        // 1. 데이터베이스 연결 시도
        console.log(`Attempting to connect to MongoDB at: ${DB_HOST}`);
        await db.connect(DB_HOST);
        console.log('✅ MongoDB connected successfully!');
        
        // 2. Apollo Server 인스턴스 생성
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            // 프로덕션 환경에서는 상세한 에러 정보를 클라이언트에 노출하지 않도록 설정
            // introspection: process.env.NODE_ENV !== 'production', // 스키마 인트로스펙션 제어
            // playground: process.env.NODE_ENV !== 'production',     // 플레이그라운드 제어 (Apollo Server v4에서는 Playground가 Apollo Sandbox로 대체됨)
            formatError: (error) => {
                // 모든 GraphQL 에러를 서버 콘솔에 로깅
                console.error('🚨 GraphQL Error:', error);
                // 프로덕션 환경에서는 민감한 정보(예: 스택 트레이스)를 클라이언트에 노출하지 않도록
                // 에러 객체를 필터링하거나 일반적인 메시지로 대체할 수 있습니다.
                // if (process.env.NODE_ENV === 'production' && error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
                //     return new GraphQLError('Internal server error occurred.', {
                //         extensions: { code: 'INTERNAL_SERVER_ERROR' }
                //     });
                // }
                return error; // 개발 환경에서는 원본 에러 반환
            },
        });

        // 3. Standalone 서버 시작
        const { url } = await startStandaloneServer(server, {
            context: async () => { models },
            listen: { port, path },
        });

        console.log(`🚀 GraphQL Server running at ${url}`);
        console.log(`💡 Access GraphQL playground at ${url}`);
    } catch (error) {
        // 데이터베이스 연결 실패 또는 서버 시작 실패 시
        console.error('❌ Failed to start GraphQL server:', error);
        process.exit(1); // 서버 시작 실패 시 프로세스 종료
    }
}

// 서버 시작 함수 호출
startGraphQLServer();

// 애플리케이션 종료 시 MongoDB 연결 닫기 (선택 사항이지만 권장)
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    try {
        await db.close();
        console.log('MongoDB connection closed due to app termination.');
        process.exit(0);
    } catch (error) {
        console.error('Error during MongoDB shutdown:', error);
        process.exit(1);
    }
});
