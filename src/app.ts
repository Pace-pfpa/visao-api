import express from "express";
import cors from "cors";
import logger from "morgan";
import { routes } from "./routes";
import helmet from "helmet";


const app = express();

/**
 * open access to services
 */
app.use(cors());

/**
 * Permission to receive and send json
 */


app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet({
    crossOriginEmbedderPolicy: false,
}))





app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
 


/**
 * Configuration of logs
 */
app.use(logger("dev"));

/**
 * The routes of API
 */
 app.use(routes);


export { app } 