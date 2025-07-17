// ES6
import 'dotenv/config'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import db from './db.js';
import models from './models/index.js';

// CommonJS
// const { ApolloServer } = require('@apollo/server');
// const { startStandaloneServer } = require('@apollo/server/standalone');
// const db = require('./db');
// require('dotenv').config();

const DB_HOST = process.env.DB_HOST;
const port = process.env.PORT || 4000;
const path = '/api'

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
        notes: async () => {
            return await models.Note.find();
        },
        note: async (parent, args) => await models.Note.findById(args.id),
    },
    Mutation: {
        newNote: async (parent, args) => await models.Note.create({
            content: args.content,
            author: 'IceMan4U'
        })
    }
};

// MongoDB에 연결
db.connect(DB_HOST)

// 아폴로 서버 설정
const server = new ApolloServer({
    typeDefs,
    resolvers
});

const url = startStandaloneServer(server, {

    listen: { port, path },
});

console.log(`🚀 GraphQL Server running at http://localhost:${url}`)
