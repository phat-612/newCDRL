const server = require("./vip_pro_lib.js");

server.atomic_table('database',['sessions'],'18102003').catch(eror => console.log(eror));