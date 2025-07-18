import Query from './query.js';
import Mutation from './mutation.js';
import gid from 'graphql-iso-date';

const { GraphQLDateTime } = gid;

export default {
    Query,
    Mutation,
    DateTime: GraphQLDateTime
}