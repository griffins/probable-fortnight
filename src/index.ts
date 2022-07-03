import {ApolloServer} from 'apollo-server'
import {typeDefs, resolvers} from "./graphql";
import {context} from './context'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    csrfPrevention: true,
    cache: 'bounded',
});


server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});
