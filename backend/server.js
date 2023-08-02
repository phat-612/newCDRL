const express = require("express");
const fs = require('fs');
const https = require('https');
const session = require('express-session');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const server = require("./vip_pro_lib.js");
const MongoStore = require('connect-mongo');
const multer = require('multer'); // Thư viện để xử lý file upload

// ----------------------------------------------------------------
server.connectMGDB().then((client) => {
  // ----------------------------------------------------------------
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  const app = express();
  const router = express.Router();
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
  // ------------------------------------------------------------------------------------------------

  async function checkCookieUserLogin(req, res, next) {
    const user = req.session.user;
    if (!user) {
      // Cookie không tồn tại, chặn truy cập
      return res.redirect("/login");
    } else {
      if ((user.first == 'true') && !(req.url === '/api/first_login' || req.url === '/api/logout')) {
        return res.redirect('/login/updateyourpasswords');
      } else {
        const user_info = await server.find_one_Data('user_info', { _id: user._id });
        res.locals.avt = user_info.avt;
        res.locals.first_name = user_info.first_name;
        res.locals.last_name = user_info.last_name;
      }
      next();
    }
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

  // Áp dụng middleware để chặn truy cập
  app.use(blockUnwantedPaths);
  app.use(express.json({ limit: "10mb" }));

  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use("/", router);
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
  console.log(path.join(parentDirectory, "views"));
  // ROUTE SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // index route

  // index route
  app.get("/", checkCookieUserLogin, async (req, res) => {
    res.render("tracuu", {
      header: "header",
      footer: "footer",
    });
  });
  // test new table
  app.get("/testnhapbangdiem", checkCookieUserLogin, async (req, res) => {
    res.render("nhapbangdiem_copy", {
      header: "header",
      footer: "footer",
      thongbao: "thongbao",
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

  // nhap bang diem route
  app.get("/nhapdiemdanhgia", checkCookieUserLogin, async (req, res) => {
    res.render("nhapbangdiem", {
      header: "header",
      thongbao: "thongbao",
    });
  });

  // ban can su route
  app.get("/bancansu", checkCookieUserLogin, async (req, res) => {
    res.render("bancansu", {
      header: "header",
    });
  });

  // Quan li hoat dong route
  app.get("/bancansu/quanlihoatdong", checkCookieUserLogin, async (req, res) => {
    res.render("quanlihoatdong", {
      header: "header",
    });
  });

  // thong tin ca nhan route
  app.get("/profile", checkCookieUserLogin, async (req, res) => {
    res.render("edit-profile", {
      header: "header",
    });
  });

  // thong tin ca nhan route
  app.get("/danhsachbangdiem", checkCookieUserLogin, async (req, res) => {
    res.render("danhsachbangdiem", {
      header: "header",
    });
  });

  // API SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Log in --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/login", async (req, res) => {
    const data = req.body;
    // 403: sai thong tin dang nhap
    // data = {mssv: bbp, password: 1234567890, remember: true}
    console.log("SYSTEM | LOG_IN | Dữ liệu nhận được: ", data);
    try {
      const user = req.session.user;
      if (!user) {
        //(log in database)
        const user = await server.find_one_Data("login_info", { _id: data.mssv });
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

  // Logout /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  app.get("/api/logout", checkCookieUserLogin, async (req, res) => {
    // Xóa thông tin phiên (session) của người dùng
    req.session.destroy((err) => {
      if (err) {
        console.error('SYSTEM | LOGOUT | Failed to logout:', err);
        res.sendStatus(500);
      } else {
        res.redirect('/login');
      }
    });
  });

  // Đổi pass ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/change_pass", checkCookieUserLogin, async (req, res) => {
    try {
      const data = req.body;

      console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu nhận được`, data);

    } catch (err) {
      console.log("SYSTEM | CHANGE_PASSWORD | ERROR | ", err);
      res.sendStatus(500);
    }
  });
  app.post("/api/first_login", checkCookieUserLogin, async (req, res) => {
    try {
      const data = req.body;
      console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu nhận được`, data);
      const old_pass = await server.find_one_Data('login_info', { _id: req.session.user._id });
      if (old_pass.password == data.new_password) {
        res.sendStatus(403);
      } else {
        delete req.session.user.first;
        await server.update_one_Data('login_info', { "_id": req.session.user._id }, { $unset: { first: "" } })
        await server.update_one_Data('login_info', { "_id": req.session.user._id }, { $set: { password: data.new_password } })

        res.sendStatus(200);
      }

    } catch (err) {
      console.log("SYSTEM | CHANGE_PASSWORD | ERROR | ", err);
      res.sendStatus(500);
    }
  });
  // Save table and update old table ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/mark", checkCookieUserLogin, async (req, res) => {
    try {

      const data = req.body;
      // data = {
      //   school_year: 'hk1 2022-2023',
      //   first: [],
      //   second: [],
      //   third: [],
      //   fourth: [],
      //   fifth: [],
      //   img_ids: [],
      //   total: 100,
      // }
      const user = req.session.user;
      // check if table is exist or not
      if (await server.find_one_Data('table', { mssv: user._id, school_year: data.school_year })) {
        // update old table
        await server.update_one_Data(
          'table',
          { mssv: user._id, school_year: data.school_year },
          {
            $set: {
              first: data.first,
              second: data.second,
              third: data.third,
              fourth: data.fourth,
              fifth: data.fifth,
              img_ids: data.img_ids,
              total: data.total,
              update_date: new Date()
            }
          }
        )
      } else {
        // create new table
        await server.add_one_Data('table', {
          mssv: user._id,
          school_year: data.school_year,
          first: data.first,
          second: data.second,
          third: data.third,
          fourth: data.fourth,
          fifth: data.fifth,
          img_ids: data.img_ids,
          total: data.total,
          update_date: new Date()
        });
      }

      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | MARK | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // upload file -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post('/api/uploadFile', upload.array('files[]'), async function (req, res) {
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

  app.get("*", async function (req, res) {
    res.sendStatus(404);
  });

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(port, () => {
    console.log(
      `SYSTEM | LOG | Đang chạy server siu cấp vip pro đa vũ trụ ở https://localhost:${port}`
    );
  });
  // ----------------------------------------------------------------
})
  .catch((err) => {
    console.error('SYSTEM | ERROR | got err', err);
  });
