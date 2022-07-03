import express from 'express'
import http from 'http'
import {ApolloServer} from 'apollo-server-express'
import {ApolloServerPluginDrainHttpServer} from 'apollo-server-core';
import {typeDefs, resolvers} from "./graphql"
import {context} from './context'
import dotenv from 'dotenv'

async function startServer() {
    dotenv.config()
    const app = express();
    app.use(express.static('public'))
    const server = http.createServer(app);
    const apollo = new ApolloServer({
        typeDefs,
        resolvers,
        context,
        csrfPrevention: true,
        cache: 'bounded',
        plugins: [ApolloServerPluginDrainHttpServer({httpServer: server})],
    });

    await apollo.start();
    // @ts-ignore
    apollo.applyMiddleware({
        app,
        path: '/'
    });

    await new Promise<void>(resolve => server.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${apollo.graphqlPath}`);
}

startServer()