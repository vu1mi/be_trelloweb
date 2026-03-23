import {env} from './environment.js'

import { MongoClient ,ServerApiVersion } from "mongodb";

let trelloDatabaseinstace = null;
 
const client = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export const  CONNECT_DB = async () => {

    try {
        if(trelloDatabaseinstace) return trelloDatabaseinstace;
        await client.connect();
        const database = client.db(env.DATABASE_NAME);
        trelloDatabaseinstace = database;
        console.log("Connected to MongoDB successfully");
        console.log("✅ Database name:", database.databaseName);
        return database;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
    
};

export const GET_DB = () => {  
    if (!trelloDatabaseinstace) {
        throw new Error("Database not connected. Please call CONNECT_DB first.");
    }
    return trelloDatabaseinstace;
}

export const CLOSE_DB = async () => {
    try {
        await client.close();   
        console.log("MongoDB connection closed successfully");
    } catch (error) {
        console.error("Error closing MongoDB connection:", error);
        throw error;
    }
};