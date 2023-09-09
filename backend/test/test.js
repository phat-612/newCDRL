const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://binhminh19112003:Zr3uGIK4dCymOXON@database.sefjqcb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
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

client.db('global').collection('user_info').find(
  { dep: user.dep },
  { projection: { _id: 1, name: 0, dep: 0 } }
  ).toArray().then((ok) => { console.log(ok); });
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