const server = require("./vip_pro_lib.js");
// clear seasion của người dùng
// server.atomic_table('database',['sessions'],'18102003').catch(eror => console.log(eror));

// add quyên cho người dùng
// server.update_many_Data('user_info', {}, { $set: { class: 'KTPM0121' } });

// thêm email + tên hiển thị cho người dùng
// server.update_many_Data('user_info', {}, { $set: { displayName: 'con gà', email: 'doconga@gmail.com'} });

// thêm user
const mssv = "xxx2003";
const ho = "Nguyễn";
const ten = "Hưng Thịnh";
server.add_one_Data('login_info', {
    _id: mssv,
    password: mssv,
    first: "true"
}).then(server.add_one_Data('user_info', {
    _id: mssv,
    first_name: ten,
    last_name: ho,
    avt: "https://cdn.discordapp.com/attachments/1128184786347905054/1137028578907803689/sp.jpg",
    power: 0,
    class: "KTPM0121",
    displayName: "HT- kill you",
    email: "kehuydiet@gmail.com"
}).then(console.log('done')));



