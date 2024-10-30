import { MongoClient, ServerApiVersion } from "mongodb";
// Connect to database
export const collections = {};
let database = null;
export const trackedMessageCache = [];
export async function startDatabase() {
    let client;
    try {
        // Create a MongoClient with a MongoClientOptions object to set the Stable API version
        client = new MongoClient(process.env.MONGO_DB_CONNECTION ?? "", {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: false
            },
            monitorCommands: true
        });
    }
    catch (err) {
        console.log("critical", `Invalid mongodb connection url. ${err}`);
        return;
    }
    try {
        // Connect the client to the server
        await client.connect();
        // Connect to databse
        database = client.db("avraesync");
        // Get collections
        collections.activeInits = database.collection("activeInits");
        console.log(`MongoDB: Established connection ${database.databaseName} with ${(await database.collections()).length} collections.`);
        // get cache
        const result = await collections.activeInits.find({}, { projection: { _id: 0, messageId: 1 } }).toArray();
        const array = result.map(doc => doc.messageId);
        trackedMessageCache.push(...array);
        console.log(`MongoDB: Loaded ${trackedMessageCache.length} messages to the cache to watch.`);
    }
    catch (err) {
        console.log("critical", err);
        // Ensures that the client will close on error
        await client.close();
    }
}
