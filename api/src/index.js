import 'dotenv/config'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import db from './db.js';
import models from './models/index.js';
import typeDefs from './schema.js';
import resolvers from './resolvers/index.js';

const DB_HOST = process.env.DB_HOST;
const port = process.env.PORT || 4000;
const path = '/api'

// MongoDB에 연결
db.connect(DB_HOST)

// 아폴로 서버 설정
const server = new ApolloServer({
    typeDefs,
    resolvers
});

const url = startStandaloneServer(server, {
    context: () => ({ models }),
    listen: { port, path },
});

console.log(`🚀 GraphQL Server running at http://localhost:${url}`)
