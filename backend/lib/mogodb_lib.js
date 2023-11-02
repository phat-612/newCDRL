const { ObjectId, MongoClient, ServerApiVersion } = require("mongodb");
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
    const checkFirst = await client
      .db(name_global_databases)
      .collection("user_info")
      .findOne({ _id: ObjectId.createFromHexString("650985a345e2e896b37efd4f") });
    if (!checkFirst) {
      await client
        .db(name_global_databases)
        .collection("user_info")
        .insertOne({
          _id: ObjectId.createFromHexString("650985a345e2e896b37efd4f"),
          first_name: "Đặt",
          last_name: "Chưa",
          avt: "https://i.pinimg.com/236x/89/08/3b/89083bba40545a72fa15321af5fab760--chibi-girl-zero.jpg",
          power: {
            1: true,
            3: true,
            4: true,
            999: true,
          },
          class: [],
          displayName: "Chưa Đặt",
          email: "",
          branch: ObjectId.createFromHexString("650985a345e2e896b37efd4f"),
        });
    }
    const checkFirst2 = await client
      .db(name_global_databases)
      .collection("branchs")
      .findOne({ _id: ObjectId.createFromHexString("650985a345e2e896b37efd4f") });
    if (!checkFirst2) {
      await client
        .db(name_global_databases)
        .collection("branchs")
        .insertOne({
          _id: ObjectId.createFromHexString("650985a345e2e896b37efd4f"),
          name: "Chưa đặt",
          dep: ObjectId.createFromHexString("650985a345e2e896b37efd4f"),
        });
    }
  } catch (error) {
    console.log("SYSTEM | ERROR | Error connecting to MongoDB:", error);
    throw error;
  }
  return client;
}

module.exports = {
  connect,
  getClient: () => client,
  getNameGlobal: () => name_global_databases,
};
