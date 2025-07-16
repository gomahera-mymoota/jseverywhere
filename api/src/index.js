import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

dotenv.config();

import db from './db.js';

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

let notes = [
    { id: '1', content: 'This is a note', author: 'IceMan4U' },
    { id: '2', content: 'This is an another note', author: 'Adam Scott' },
    { id: '3', content: 'Oh hey look, another note!', author: 'Riley Harrison' },
];

// 스키마 구성
const typeDefs = `
  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type Query {
    hello: String
    notes: [Note!]!
    note(id: ID!): Note!
  }

  type Mutation {
  newNote(content: String!): Note!
  }
`;

// 리졸버 구성
const resolvers = {
    Query: {
        hello: () => 'Hello World!~',
        notes: () => notes,
        note: (parent, args) => notes.find(note => note.id === args.id),
    },
    Mutation: {
        newNote: (parent, args) => {
            let noteValue = {
                id: String(notes.length + 1),
                content: args.content,
                author: 'IceMan4U'
            };
            notes.push(noteValue);
            return noteValue;
        }        
    }
};

// MongoDB에 연결
db.connect(DB_HOST)

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
