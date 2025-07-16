import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

dotenv.config();

// 스키마 구성
const typeDefs = `
  type Query {
    hello: String
  }
`;

// 리졸버 구성
const resolvers = {
    Query: {
        hello: () => 'Hello World!~'
    }
};

const port = process.env.PORT || 4000;
const path = '/api'

// 아폴로 서버 설정
const server = new ApolloServer({
    typeDefs,
    resolvers
});

const url = startStandaloneServer(server, {
    listen: { port, path },
});

console.log(`🚀 GraphQL Server running at http://localhost:${url}`)