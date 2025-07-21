import Query from './query.js';
import Mutation from './mutation.js';
import { DateTimeResolver } from 'graphql-scalars';

export default {
    Query,
    Mutation,
    DateTime: DateTimeResolver
}