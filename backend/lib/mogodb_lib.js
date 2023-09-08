const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://binhminh19112003:Zr3uGIK4dCymOXON@6aesieunhan.sefjqcb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const name_global_databases = "global";
async function connect() {
  try {
    await client.connect();
  } catch (error) {
    console.error("SYSTEM | ERROR | Error connecting to MongoDB:", error);
    throw error;
  }
  return client;
}

module.exports = {
  connect,
  getClient: () => client,
  getNameGlobal: () => name_global_databases
};
