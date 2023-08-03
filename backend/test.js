const server = require("./vip_pro_lib.js");
// clear seasion của người dùng
// server.atomic_table('database',['sessions'],'18102003').catch(eror => console.log(eror));

// add quyên cho người dùng
server.update_many_Data('user_info', {}, { $set: { class: 'KTPM0121' } });