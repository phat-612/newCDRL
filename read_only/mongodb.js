const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://binhminh19112003:Zr3uGIK4dCymOXON@database.sefjqcb.mongodb.net/?retryWrites=true&w=majority";
const name_databases = 'database';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
exports.add_one_Data = async function (table, myobj) {
    try {
        // await client.connect();
        // let myobj = { user_name: "Long Khoa Hoc", user_id: "longdd", password: ""};
        const resual = await client.db(name_databases).collection(table).insertOne(myobj);
        // console.log('SYSTEM | ADD_ONE_DATA | Add document', myobj, 'successfull');
        return resual;
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

exports.add_many_Data = async function (table, myobj) {
    try {
        // await client.connect();
        // let myobj = [
        //   { user_name: "Long Khoa Hoc", user_id: "longpb", password: "29092006"},
        //   { user_name: "Long Nghien", user_id: "longdd", password: "Nl<3Bp"}
        // ];;
        await client.db(name_databases).collection(table).insertMany(myobj);
        // console.log('SYSTEM | ADD_MANY_DATA | Add many documents', myobj, 'successfull');
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

exports.delete_one_Data = async function (table, myobj) {
    try {
        // await client.connect();
        // let myobj = { user_name: "Long Khoa Hoc"};
        await client.db(name_databases).collection(table).deleteOne(myobj);
        // console.log('SYSTEM | DELETE_ONE_DATA | Delete document', myobj, 'successfull');
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

exports.delete_many_Data = async function (table, myobj) {
    try {
        // await client.connect();
        // let myobj = { user_name: "Long Khoa Hoc"};
        await client.db(name_databases).collection(table).deleteMany(myobj);
        // console.log('SYSTEM | DELETE_MANY_DATA | Delete many documents', myobj, 'successfull');
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

exports.find_one_Data = async function (table, myobj = undefined) {
    try {
        // await client.connect();
        // let myobj = { user_name: "Long Khoa Hoc"};
        let result = await client.db(name_databases).collection(table).findOne(myobj);

        // console.log('SYSTEM | FIND_ONE_DATA | Finding document: ', result);

        return result;
    } finally {
        // Ensures that the client will close when you fiSnish/error
        // await client.close();
    }
}


exports.find_all_Data = async function ({ table, query = undefined, projection = undefined, skip = 0, limit = 0, sort = undefined }) {
    try {
        // await client.connect();
        // let query = { user_name: "Long Khoa Hoc"};
        // sort go here: https://www.w3schools.com/nodejs/nodejs_mongodb_sort.asp
        let result = await client.db(name_databases).collection(table).find(query, { 'projection': projection }).sort(sort).skip(skip).limit(limit).toArray();

        // Chuyển đổi giá trị _id của từng bản ghi sang chuỗi ký tự

        // console.log('SYSTEM | FIND_MANY_DATA | Finding documents: ', result);

        return result;

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

exports.update_one_Data = async function (table, myquery, newvalues) {
    try {
        // await client.connect();
        // let myquery = { user_name: "Long Khoa Hoc"};
        // let newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
        // có nhiều toán từ  $set, $inc, $push, $pull, tự google
        const resual = await client.db(name_databases).collection(table).updateOne(myquery, newvalues);
        // console.log('SYSTEM | UPDATE_ONE_DATA | Update document', myquery, 'to', newvalues, 'successfull');
        return resual;


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

exports.update_many_Data = async function (table, myquery, newvalues) {
    try {
        // await client.connect();
        // let myquery = { user_name: "Long Khoa Hoc"};
        // let newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
        // có nhiều toán từ  $set, $inc, $push, $pull, tự google
        await client.db(name_databases).collection(table).updateMany(myquery, newvalues);

        // console.log('SYSTEM | UPDATE_MANY_DATA | Update documents', myquery, 'to', newvalues, 'successfull');

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

///debug only
exports.atomic = async function (databaseName, password) {
    if (password === '18102003') {
        try {
            // await client.connect();
            const database = client.db(databaseName);

            // Lấy danh sách tên các collection hiện có
            const collections = await database.listCollections().toArray();
            const collectionNames = collections.map((collection) => collection.name);

            // Xoá cơ sở dữ liệu hiện tại
            await database.dropDatabase();
            console.log("SYSTEM | ATOMIC |\n______             _      ______ _            ______         _                   \n| ___ \\           | |     | ___ | |           |  _  \\       | |                  \n| |_/ / __ _ _ __ | |__   | |_/ | |__   ___   | | | |___ ___| |_ _ __ ___  _   _ \n| ___ \\/ _` | \'_ \\| \'_ \\  |  __/| \'_ \\ / _ \\  | | | / _ / __| __| \'__/ _ \\| | | |\n| |_/ | (_| | | | | | | | | |   | | | | (_) | | |/ |  __\\__ | |_| | | (_) | |_| |\n\\____/ \\__,_|_| |_|_| |_| \\_|   |_| |_|\\___/  |___/ \\___|___/\\__|_|  \\___/ \\__, |\n                                                                            __/ |\n                                                                           |___/ \n");

            // Tạo lại các collection với tên cũ
            for (const collectionName of collectionNames) {
                await database.createCollection(collectionName);
                console.log('SYSTEM | ATOMIC | Recreate collection:', collectionName, 'successfull');
            }

            // Các công việc khác, ví dụ: tạo các index, khởi tạo dữ liệu, vv.
        } finally {
            // await client.close();
        }
    }
    else {
        console.log('SYSTEM | ATOMIC | Fail, admin comming to you (╬▔皿▔)╯!!!');
    }
}

exports.atomic_table = async function (databaseName, tableList, password) {
    if (password === '18102003') {
        try {
            // await client.connect();
            const database = client.db(databaseName);
            for (const collectionName of tableList) {
                await database.dropCollection(collectionName);
                console.log('SYSTEM | ATOMIC | Recreate collection:', collectionName, 'successfull');
            }
            // Xoá cơ sở dữ liệu hiện tại
            console.log("SYSTEM | ATOMIC |\n______             _      ______ _            ______         _                   \n| ___ \\           | |     | ___ | |           |  _  \\       | |                  \n| |_/ / __ _ _ __ | |__   | |_/ | |__   ___   | | | |___ ___| |_ _ __ ___  _   _ \n| ___ \\/ _` | \'_ \\| \'_ \\  |  __/| \'_ \\ / _ \\  | | | / _ / __| __| \'__/ _ \\| | | |\n| |_/ | (_| | | | | | | | | |   | | | | (_) | | |/ |  __\\__ | |_| | | (_) | |_| |\n\\____/ \\__,_|_| |_|_| |_| \\_|   |_| |_|\\___/  |___/ \\___|___/\\__|_|  \\___/ \\__, |\n                                                                            __/ |\n                                                                           |___/ \n");

            for (const collectionName of tableList) {
                await database.createCollection(collectionName);
                console.log('SYSTEM | ATOMIC | Recreate collection:', collectionName, 'successfull');
            }

            // Các công việc khác, ví dụ: tạo các index, khởi tạo dữ liệu, vv.
        } finally {
            // await client.close();
        }
    }
    else {
        console.log('SYSTEM | ATOMIC | Fail, admin comming to you (╬▔皿▔)╯!!!');
    }
}