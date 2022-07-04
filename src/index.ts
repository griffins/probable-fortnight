import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import bodyParser from "body-parser";
import api from "./api";
import {session} from "./api/middleware";

async function startServer() {
    dotenv.config()
    const app = express()
    const port = process.env.PORT || 4000

    app.use(morgan('common'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded())
    app.use(express.static('public'))
    app.use(session)
    app.use(api)

    app.listen(port, () => {
        console.log(`🚀 Server ready at http://localhost:${port}`);
    })
}

startServer()