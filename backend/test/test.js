const { ObjectId, MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://binhminh19112003:Zr3uGIK4dCymOXON@database.sefjqcb.mongodb.net/?retryWrites=true&w=majority";
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
// client
//   .db(name_global_databases)
//   .collection("user_info")
//   .insertOne({
//     _id: ObjectId.createFromHexString("650985a345e2e896b37efd4f"),
//     first_name: "Đặt",
//     last_name: "Chưa",
//     avt: "https://i.pinimg.com/236x/89/08/3b/89083bba40545a72fa15321af5fab760--chibi-girl-zero.jpg",
//     power: {
//       1: true,
//       3: true,
//       4: true,
//       999: true,
//     },
//     class: [],
//     displayName: "Chưa Đặt",
//     email: "",
//     branch: ObjectId.createFromHexString("650985a345e2e896b37efd4f"),
//   })
//   .then(function (response) {
//     console.log(response);
//   });
client
  .db(name_global_databases)
  .collection("login_info")
  .updateMany({
  },{$set:{password: "$2b$10$MBowgjWQnlwhvVdeH0T6qOA6gDmg5CLGCR7Epdl5gbFq2v8uAe.F2"}})
  .then(function (response) {
    console.log(response);
  });
// clear seasion của người dùng
// server.atomic_table('global',['sessions', 'sessions_manager'],'18102003').catch(eror => console.log(eror));
// client.db('global').collection('OTP').createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }).then(console.log("ok"));
// server.copy('KTPM','CNTT');
// client.db('global').collection('classes').findOne(
//     { _id: "KTPM0121" },
//     { projection: { _id: 0, years: 1 } }
// ).then(cls => { console.log(cls.years); })

// thêm user info và login info
// client.db('global').collection('user_info').findOne(
//     { _id: '2101381' },
//     { projection: { _id: 0, class: 1, power: 1 } }
// ).then((ok) => { console.log(ok); })

// client.db('global').collection('user_info').find(
//   { dep: user.dep },
//   { projection: { _id: 1, name: 0, dep: 0 } }
//   ).toArray().then((ok) => { console.log(ok); });
// client.db('global').collection('user_info').updateOne(
//     { _id: '2101111' },
//     {$set: {
//         _id: '2101111',
//         first_name: 'Phúc Đạt',
//         last_name: 'Phạm',
//         avt: '',
//         power: { '0': true },
//         class: [ 'KTPM0121' ],
//         displayName: 'Phạm Phúc Đạt',
//         email: ''
//     }},
//     {upsert: true}

// ).then(() => { console.log('them thong tin thanh cong'); })
// client.db('global').collection('login_info').updateOne(
//     { _id: '2101111' },
//     {$set:{
//         _id: '2101111',
//         password: '2101111'
//     }},
//     {upsert: true}

// ).then(() => { console.log('them tai khoan thanh cong'); })

// add quyên cho người dùng
// server.update_many_Data('user_info', {}, { $set: { class: 'KTPM0121' } });

// thêm email + tên hiển thị cho người dùng
// server.update_many_Data('user_info', {}, { $set: { displayName: 'con gà', email: 'doconga@gmail.com'} });

// server.uploadFileToDrive('/Users/rurimeiko/Documents/github/newCDRL/.upload_temp/files/43c5f35b-3675-4515-bde8-020818f6d96b.png').then(console.log('ok'))
// thêm user
// const mssv = "210151";
// const ho = "Nguyễn";
// const ten = "Hưng Thịnh";
// server.add_one_Data('login_info', {
//     _id: mssv,
//     password: mssv,
//     first: "true"
// }).then(server.add_one_Data('user_info', {
//     _id: mssv,
//     first_name: ten,
//     last_name: ho,
//     avt: "https://cdn.discordapp.com/attachments/1128184786347905054/1137028578907803689/sp.jpg",
//     power: 0,
//     class: "KTPM0121",
//     displayName: "HT- kill you",
//     email: "kehuydiet@gmail.com"
// }).then(console.log('done')));

// chỉnh quyền
// client.db('database').collection('user_info').updateOne(
//     {
//         _id: 'xxx'
//     },
//     { $set: { power: { 0: true, 1: true } } }
// ).then(console.log('ok'));

// client
//   .db("global")
//   .collection("activities")
//   .find({}, { projection: { name: 1 } })
//   .toArray()
//   .then((ok) => {
//     console.log(ok);
//   });

// async function inet() {
//   const all_branchs = await client
//     .db(name_global_databases)
//     .collection("branchs")
//     .find(
//       {
//         dep: "CNTT",
//       },
//       {
//         projection: {
//           name: 1,
//         },
//       }
//     )
//     .toArray();
//   const teachers = await client
//     .db(name_global_databases)
//     .collection("user_info")
//     .find(
//       {
//         "power.1": { $exists: true },
//         "power.4": { $exists: true },
//         "power.999": { $exists: false },

//         $or: [
//           { branch: { $in: all_branchs.map((branch) => branch._id) } },
//           { branch: ObjectId.createFromHexString("650985a345e2e896b37efd4f") },
//         ],
//       }, // user is teacher
//       {
//         projection: {
//           first_name: 1,
//           last_name: 1,
//           class: 1,
//           branch: 1,
//         },
//       }
//     )
//     .toArray();

//   const cls = await client.db(name_global_databases).collection("classes").find({}).toArray();
//   teachers.forEach(async (teacher) => {
//     cls.forEach(async (cls) => {
//       await client
//         .db(name_global_databases)
//         .collection("user_info")
//         .updateMany(
//           {
//             _id: teacher._id,
//             "power.1": { $exists: true },
//             "power.4": { $exists: true },
//             "power.999": { $exists: false },
//           },
//           {
//             $push: { class: cls.cvht == teacher._id ? cls._id : null },
//             // $set: { class: [] },
//           }
//         );
//       await client
//         .db(name_global_databases)
//         .collection("user_info")
//         .updateMany(
//           {
//             _id: teacher._id,
//             "power.1": { $exists: true },
//             "power.4": { $exists: true },
//             "power.999": { $exists: false },
//           },
//           {
//             $pull: { class: null },
//             // $set: { class: [] },
//           }
//         );
//     });
//   });
// }
// inet().then(async (inet) => {
//   console.log(inet);
// });

// client.db('global').collection('user_info').updateMany(
//     {
//       "power.0": { $exists: true },
//       "total_score": { $exists: false },
//     },
//     {
//       $set:
//       {
//         total_score: {}
//       }
//     }
// ).then(console.log('ok'));

// const school_year = 'HK1_2022-2023'
// client
//   .db('global')
//   .collection('user_info')
//   .updateOne(
//     {
//       _id: '2101085',
//     },
//     {
//       $set : {
//         [`total_score.${school_year}.stf`]: 2,
//         [`total_score.${school_year}.marker`]: 'Nguyễn Thị E',
//       }
//     },
//     {
//       upsert: true,
//     }
//   ).then(console.log('ok'));;
