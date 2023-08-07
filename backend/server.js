/* Ghi chú: --------------------------------------------------------------------------------------------------------------
@dawn1810:
  phân quyền người dùng:
    0: nhập điểm sinh viên
    1: chấm điểm lần 1 (ban cán sự, cố vấn học tập)
    2: chấp điểm/ duyệ điểm (khoa)
    3: tạo hoạt động (ban cán sự, ???)
    4: cấp quyền (> cố vấn)
    ...
  power = {
    0: true,
  }
@RuriMeiko
  tài khoản mặt định:
    {_id: "2101281",
    password: "2101281",
    first: "true"}
-------------------------------------------------------------------------------------------------------------------------- */

const express = require("express");
const fs = require('fs');
const https = require('https');
const session = require('express-session');
const cookie = require('cookie');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const server = require("./vip_pro_lib.js");
const MongoStore = require('connect-mongo');
const multer = require('multer'); // Thư viện để xử lý file upload
const WebSocket = require('ws');
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
// ----------------------------------------------------------------
client.connect().then(() => {
  // ----------------------------------------------------------------
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  const app = express();
  const privateKey = fs.readFileSync(path.join('.certificate', 'localhost.key'), 'utf8');
  const certificate = fs.readFileSync(path.join('.certificate', 'localhost.crt'), 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  // ----------------------------------------------------------------
  const port = 8181;
  const secretKey = "5gB#2L1!8*1!0)$7vF@9";
  const authenticationKey = Buffer.from(
    secretKey.padEnd(32, "0"),
    "utf8"
  ).toString("hex");
  // ----------------------------------------------------------------
  const uploadDirectory = path.join('.upload_temp', 'files');

  const storage_file = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        console.log('SYSTEM | GET_NOVEL_LIST | ERROR | Lỗi định dạng file không đúng');

        return cb(new Error('Invalid file type.'), null);
      }

      // Trả về đường dẫn đến thư mục mới
      cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });

  // Thiết lập middleware multer cho việc xử lý upload file
  const upload = multer({ storage: storage_file });

  // mongodb database name
  const name_databases = 'database';
  // ------------------------------------------------------------------------------------------------

  async function checkIfUserLoginAPI(req, res, next) {
    const user = req.session.user;
    if (!user) {
      // Cookie không tồn tại, chặn truy cập
      return res.sendStatus(403);
    } else {
      next();
    }
  }

  async function checkIfUserLoginRoute(req, res, next) {
    const user = req.session.user;

    if (!user) {
      // Cookie không tồn tại, chặn truy cập
      return res.redirect("/login");
    } else {
      if ((user.first == 'true')) {
        return res.redirect('/login/updateyourpasswords');
      } else {
        const user_info = await client.db(name_databases).collection('user_info').findOne({ _id: user._id });
        res.locals.avt = user_info.avt;
        res.locals.displayName = user_info.displayName;
      }
      next();
    }
  }

  function sendHeartbeat(ws) {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  }

  async function get_full_id(directoryPath, listName) {
    let list_id = [];
    try {
      // Đọc các file trong thư mục một cách đồng bộ
      let txtFilePaths = []
      for (const name of listName) {
        txtFilePaths.push(path.join(directoryPath, name))
      }
      console.log(txtFilePaths)
      const processFiles = async () => {
        for (const filePath of txtFilePaths) {
          console.log(filePath);
          list_id.push(await server.uploadFileToDrive(filePath));
        }
      };
      await processFiles();

      return list_id;
    } catch (err) {
      console.error('SYSTEM | GET_ID | ERR | ', err);
    }

  }

  const blockUnwantedPaths = (req, res, next) => { // cai díu j day @rurimeiko làm lại đi // cái block user truy cập file
    const unwantedPaths = ["/.vscode/", "/backend/", "/node_modules/", "/views/", "package-lock.json", "package.json", "README.md"];
    for (const path of unwantedPaths) {
      if (req.url.includes(path)) {
        return res
          .status(403)
          .send(
            '<h1 style="font-size: 46px;">cut di bn oi, <a href="/404">to mo</a> </a> lam d j? </h1> \n<img src ="https://cdn.discordapp.com/attachments/1128270011346210826/1128288383316271204/sticker.webp"><iframe src="https://giphy.com/embed/qs4ll1FSxKnNHeSmom" width="480" height="475" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/DogeBONK-bonk-dobo-dogebonk-qs4ll1FSxKnNHeSmom">via GIPHY</a></p>'
          );
      }
    }
    next();
  };

  async function mark(table, user, data) {
    // data = {
    //   first: [],
    //   second: [],
    //   third: [],
    //   fourth: [],
    //   fifth: [],
    //   img_ids: [],
    //   total: 100,
    // }
    const marker = await client.db(name_databases).collection('user_info').findOne({ _id: user._id });
    const school_year = await client.db(name_databases).collection('school_year').findOne({});
    // check if table is exist or not
    if (await client.db(name_databases).collection(marker.class + table).findOne(
      {
        mssv: user._id,
        school_year: school_year.year
      }
    )) {
      // update old table
      let update = {
        first: data.first,
        second: data.second,
        third: data.third,
        fourth: data.fourth,
        fifth: data.fifth,
        img_ids: data.img_ids,
        total: data.total,
        update_date: new Date()
      }

      // if table is stf_table - mark by staff members or teacher
      if (table == 'stf_table') {
        update.marker = marker.last_name + " " + marker.first_name;
      }

      await client.db(name_databases).collection(marker.class + table).updateOne(
        {
          mssv: user._id,
          school_year: school_year.year
        },
        {
          $set: update
        }
      );

    } else { // entertainment area: https://youtu.be/CufIAJDVZvo
      let insert = {
        mssv: user._id,
        school_year: school_year.year,
        first: data.first,
        second: data.second,
        third: data.third,
        fourth: data.fourth,
        fifth: data.fifth,
        img_ids: data.img_ids,
        total: data.total,
        update_date: new Date()
      }

      // if table is stf_table - mark by staff members or teacher
      if (table == 'stf_table') {
        insert.marker = marker.last_name + " " + marker.first_name;
      }

      // create new table
      await client.db(name_databases).collection(marker.class + table).insertOne(insert);
    }
  }

  function randompass() {
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const number = "0123456789";
    const symbol = "!@#$%^&*_-+="
    const allChars = upperCase + lowerCase + number + symbol

    let password = "";
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += number[Math.floor(Math.random() * number.length)];
    password += symbol[Math.floor(Math.random() * symbol.length)];

    while (password.length < 8) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    console.log('SYSTEM | GEN_PASSWORD | OK')
    return password;
  };

  // Áp dụng middleware để chặn truy cập
  app.use(blockUnwantedPaths);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  // Sử dụng express-session middleware

  app.use(session({
    name: 'howtosavealife?', // Đặt tên mới cho Session ID
    secret: authenticationKey,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client, dbName: 'database', crypto: {
        secret: authenticationKey
      }
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (30 * 24 * 60 * 60 * 1000 milliseconds)
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      rolling: true,
    }
  }));
  app.use(express.json());
  const parentDirectory = path.dirname(__dirname);
  app.use(express.static(parentDirectory));
  app.set("view engine", "ejs");
  // Đặt thư mục chứa các tệp template
  app.set("views", path.join(parentDirectory, "views"));

  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const httpsServer = https.createServer(credentials, app);
  const wss = new WebSocket.Server({ server: httpsServer });
  // ROUTE SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // index route
  app.get("/", checkIfUserLoginRoute, async (req, res) => {
    res.render("tracuu", {
      header: "header",
      footer: "footer",
    });
  });

  // login route
  app.get("/login", async (req, res) => {
    const user = req.session.user;
    if (user) {
      return res.redirect('/');
    }
    res.render("login", {
      header: "header",
      thongbao: "thongbao",
      avt: null,
    });
  });

  // firstlogin route
  app.get("/login/updateyourpasswords", async (req, res) => {
    const user = req.session.user;
    if (!user?.first) {
      return res.redirect('/');
    }
    res.render("firstlogin", {
      header: "header",
      thongbao: "thongbao",
      avt: null,
      logout: true,
    });
  });

  // doi password route
  app.get("/profile/change_pass", checkIfUserLoginRoute, async (req, res) => {
    res.render("changepass", {
      header: "header",
      thongbao: "thongbao",
    });
  });

  // nhap bang diem route
  app.get("/nhapdiemdanhgia", checkIfUserLoginRoute, async (req, res) => {
    res.render("nhapbangdiem", {
      header: "header",
      thongbao: "thongbao",
      footer: "footer"
    });
  });

  // ban can su route
  app.get("/bancansu", checkIfUserLoginRoute, async (req, res) => {
    res.render("bancansu", {
      header: "header",
    });
  });
  // xac thuc route
  app.get("/xacthucOTP", checkIfUserLoginRoute, async (req, res) => {
    res.render("xacthucOTP", {
      header: "header",
    });
  });

  // Quan li hoat dong route
  app.get("/bancansu/quanlihoatdong", checkIfUserLoginRoute, async (req, res) => {
    res.render("quanlihoatdong", {
      header: "header",
    });
  });

  // Danh gia hoat dong
  app.get("/bancansu/quanlihoatdong/danh_gia_hoat_dong", checkIfUserLoginRoute, async (req, res) => {
    res.render("danh_gia_hoat_dong", {
      header: "header",
      footer: "footer",
    });
  });

  // thong tin ca nhan route
  app.get("/profile", checkIfUserLoginRoute, async (req, res) => {
    const user_info = await client.db(name_databases).collection('user_info').findOne({ _id: req.session.user._id });
    res.render("edit-profile", {
      header: "header",
      footer: "footer",
      name: user_info.last_name + " " + user_info.first_name,
      mssv: user_info._id,
      email: user_info.email,
      thongbao: "thongbao"
    });
  });

  // thong tin ca nhan route
  app.get("/danhsachbangdiem", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;
    const school_year = await client.db(name_databases).collection('school_year').findOne({});
    // get staff member info :
    const marker = await client.db(name_databases).collection('user_info').findOne({ _id: user._id });
    // check user login:
    if (marker.power[1]) {
      // get all student in staff member class:
      const student_list = await client.db(name_databases).collection('user_info').find(
        { class: marker.class },
        { 'projection': { first_name: 1, last_name: 1 } })
        .sort({ first_name: 1, last_name: 1 })
        .toArray();

      // get all student total score from themself:
      let render = {
        header: "header",
        staff_name: [],
        student_list: student_list,
        student_scores: [],
        staff_scores: [],
        department_scores: []
      }

      for (student of student_list) {
        const curr_student_score = await client.db(name_databases)
          .collection(marker.class + '_std_table')
          .findOne({
            mssv: student._id,
            school_year: school_year.year
          });
        const curr_staff_score = await client.db(name_databases)
          .collection(marker.class + '_stf_table')
          .findOne({
            mssv: student._id,
            school_year: school_year.year
          });
        const curr_departmentt_score = await client.db(name_databases)
          .collection(marker.class + '_dep_table')
          .findOne({
            mssv: student._id,
            school_year: school_year.year
          });
        // student
        if (curr_student_score) {
          render.student_scores.push(curr_student_score.total);
        } else {
          render.student_scores.push('-');
        }
        // staff member
        if (curr_staff_score) {
          render.staff_scores.push(curr_staff_score.total);
          render.staff_name.push(curr_staff_score.marker);
        } else {
          render.staff_scores.push('-');
          render.staff_name.push('-');
        }
        // department
        if (curr_departmentt_score) {
          render.department_scores.push(curr_departmentt_score.total);
        } else {
          render.department_scores.push('-');
        }
      }

      res.render("danhsachbangdiem", render);
    }
    else { // user not staff members 
      // redirect to home
      return res.redirect('/');
    }

  });

  // API SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Log in --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/login", async (req, res) => {
    const data = req.body;
    // 403: sai thong tin dang nhap
    // data = {mssv: bbp, password: 1234567890, remember: true}
    // console.log("SYSTEM | LOG_IN | Dữ liệu nhận được: ", data);
    try {
      const user = req.session.user;
      if (!user) {
        //(log in database)
        const user = await client.db(name_databases).collection('login_info').findOne({ _id: data.mssv });
        if (user === null) {
          // Đăng nhập không thành công
          res.sendStatus(403);
        } else if (user._id === data.mssv && user.password === data.password) {
          // Đăng nhập thành công, lưu thông tin người dùng vào phiên
          req.session.user = user;
          // Kiểm tra xem người dùng có chọn "Remember me" không
          if (data.remember) {
            // Thiết lập thời gian sống cookie lâu hơn để lưu thông tin đăng nhập trong 30 ngày
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
          } else {
            // Thiết lập thời gian sống cookie lại về mặc định (1 giờ)
            req.session.cookie.maxAge = 3600000; // 1 hour
          }
          const sessionId = req.session.id;
          const resl = await client.db(name_databases).collection('sessions_manager').findOne({ _id: user._id });
          if (resl) {
            await client.db(name_databases).collection('sessions_manager').updateOne(
              { _id: user._id },
              { $push: { sessionId: sessionId } }
            );
          } else {
            await client.db(name_databases).collection('sessions_manager').insertOne(
              {
                _id: user._id,
                sessionId: [sessionId]
              }
            )
          }
          if (user.first == 'true') {
            res.status(200).json({ check: true });
          } else {
            res.status(200).json({ check: false });
          }
        } else {
          // Đăng nhập không thành công
          res.sendStatus(403);
        }
      } else { res.sendStatus(404); }
    } catch (err) {
      console.log("SYSTEM | LOG_IN | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Logout ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.get("/api/logout", checkIfUserLoginAPI, async (req, res) => {
    // Xóa thông tin phiên (session) của người dùng
    req.session.destroy((err) => {
      if (err) {
        console.error('SYSTEM | LOG_OUT | Failed to logout:', err);
        res.sendStatus(500);
      } else {
        res.redirect('/login');
      }
    });
  });

  // Đăng xuất tất cả thiết bị
  app.get("/api/logoutAlldevice", checkIfUserLoginAPI, async (req, res) => {
    // Xóa thông tin phiên (session) của người dùng
    const _id = req.session.user._id;
    const result = await client.db(name_databases).collection('sessions_manager').findOne({ _id: _id });
    const listSeasionId = result.sessionId;
    listSeasionId.splice(listSeasionId.indexOf(req.session.id), 1);
    await client.db(name_databases).collection('sessions_manager').updateOne(
      { _id: _id },
      { $pull: { sessionId: { $ne: req.session.id } } }
    );
    await client.db(name_databases).collection('sessions').deleteMany({ _id: { $in: listSeasionId } });
    wss.clients.forEach((ws) => {
      if (listSeasionId.includes(ws.id)) {
        ws.send('reload');
      }
    });
    res.sendStatus(200);
  });

  // Đổi thông tin người dùng --------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/updateInfo", checkIfUserLoginAPI, async (req, res) => {
    try {
      const data = req.body;
      // console.log(`SYSTEM | UPDATE_INFO | Dữ liệu nhận được`, data);
      await client.db(name_databases).collection('user_info').updateOne(
        { "_id": req.session.user._id },
        {
          $set: {
            displayName: data.displayName,
            email: data.email,
            avt: data.avt
          }
        }
      );
      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | UPDATE_INFO | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Đổi pass ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/change_pass", checkIfUserLoginAPI, async (req, res) => {
    try {
      const data = req.body;
      // console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu nhận được`, data);
      const old_pass = await client.db(name_databases).collection("login_info").findOne({ _id: req.session.user._id });
      if (old_pass.password == data.old_password) {
        if (old_pass.password !== data.new_password) {
          await client.db(name_databases).collection('login_info').updateOne(
            { "_id": req.session.user._id },
            { $set: { password: data.new_password } }
          );
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      } else {
        res.sendStatus(404);
      }

    } catch (err) {
      console.log("SYSTEM | CHANGE_PASSWORD | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Đổi pass lần đầu đăng nhập --------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/first_login", checkIfUserLoginAPI, async (req, res) => {
    try {
      const data = req.body;
      console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu nhận được`, data);
      const old_pass = await client.db(name_databases).collection('login_info').findOne({ _id: req.session.user._id });

      if (old_pass.password == data.new_password) {
        res.sendStatus(403);
      } else {
        delete req.session.user.first;
        await client.db(name_databases).collection('login_info').updateOne(
          { "_id": req.session.user._id },
          { $unset: { first: "" } }
        );
        await client.db(name_databases).collection('login_info').updateOne(
          { "_id": req.session.user._id },
          { $set: { password: data.new_password } }
        );
        res.sendStatus(200);
      }

    } catch (err) {
      console.log("SYSTEM | CHANGE_PASSWORD | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Save table and update old table ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/std_mark", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body;
      await mark("_std_table", user, data);

      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | MARK | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Upload file -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post('/api/uploadFile', upload.array('files[]'), checkIfUserLoginAPI, async function (req, res) {
    if (!req.files) {
      return res.status(400).send('No file uploaded.');
    }
    let list_name = [];

    // Kiểm tra kiểu dữ liệu của các tệp
    for (let i = 0; i < req.files.length; i++) {
      const fileName = req.files[i].originalname;
      list_name.push(fileName);

    }

    // Xử lý các tệp đã tải lên ở đây
    console.log('SYSTEM | UPLOAD_FILE | Files uploaded:', req.files);
    res.writeHead(200, { 'Content-Type': 'applicaiton/json' });
    res.end(JSON.stringify(await get_full_id(uploadDirectory, list_name)));
  });

  // Create new account -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.get("/api/createAccount", checkIfUserLoginAPI, async (req, res) => {
    try {
      // read excel file:
      // create all account
      
      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | MARK | ERROR | ", err);
      res.sendStatus(500);
    }
  });
  
  // Xử lý đường link không có -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.get("*", async function (req, res) {
    res.sendStatus(404);
  });


  // // WEBSOCKET SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  wss.on('connection', async (ws, req) => {
    // Kiểm tra địa chỉ đích của kết nối WebSocket
    if (req.url === '/howtosavealife?') {
      // console.log(`SYSTEM | WEBSOCKET | A new WebSocket connection is established.`);
      // Gán id cho ws
      if (req.headers.cookie) {
        const cookie_seasion = cookie.parse(req.headers.cookie)
        if ("howtosavealife?" in cookie_seasion) {
          ws.id = cookieParser.signedCookie(cookie_seasion["howtosavealife?"], authenticationKey);
          // Gán giá trị cho biến isAlive để thực hiện heartbeat
          ws.isAlive = true;
          // Xử lý khi client gửi dữ liệu
          ws.on('message', (message) => {
            // console.log('SYSTEM | WEBSOCKET | Received message: ', message.toString('utf-8'));
            if (message.toString('utf-8') == 'logout') {
              ws.close();
            } else if (message.toString('utf-8') == 'ok ko e?') {
              ws.send('Ok a');
            }
          });


          // Xử lý khi client đóng kết nối
          ws.on('close', () => {
            // console.log('SYSTEM | WEBSOCKET | WebSocket connection closed for ' + ws.id);
          });
        } else { ws.send('Ko a'); ws.close(); }
      } else { ws.send('Ko a'); ws.close(); }

    } else {
      console.log('SYSTEM | WEBSOCKET | Rejected WebSocket connection from:', ws.id);
      ws.close();
    }
  });

  // Heartbeat websocket
  setInterval(() => {
    wss.clients.forEach((ws) => {
      sendHeartbeat(ws);
    });
  }, 5000);

  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  httpsServer.listen(port, () => {
    console.log(
      `SYSTEM | LOG | Đang chạy server siu cấp vip pro đa vũ trụ ở https://localhost:${port}`
    );
  });
  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
})
  .catch((err) => {
    console.error('SYSTEM | ERROR | got err', err);
  });
