// const viplib = require("./vip_pro_lib");
const express = require("express");
const session = require('express-session');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const MongoStore = require('connect-mongodb-session')(session);
const server = require("./vip_pro_lib.js");
// ----------------------------------------------------------------
server.connectMGDB().then((client) => {
  // ----------------------------------------------------------------
  const app = express();
  const router = express.Router();
  // ----------------------------------------------------------------
  const port = 8181;
  const secretKey = "5gB#2L1!8*1!0)$7vF@9";
  const authenticationKey = Buffer.from(
    secretKey.padEnd(32, "0"),
    "utf8"
  ).toString("hex");

  // ------------------------------------------------------------------------------------------------

  async function checkCookieUserLogin(req, res, next) {
    const user = req.session.user;

    if (!user) {
      // Cookie không tồn tại, chặn truy cập
      return res.redirect("/login");
    } else {
      const user_info = await server.find_one_Data('user_info', { _id: user._id });
      res.locals.avt = user_info.avt;
      res.locals.first_name = user_info.first_name;
      res.locals.last_name = user_info.last_name;
      next();
    }
  }

  const blockUnwantedPaths = (req, res, next) => { // cai díu j day @rurimeiko làm lại đi
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
    secret: authenticationKey,
    resave: false,
    saveUninitialized: false,
    // store: new MongoStore({ client: client, dbName: 'database', collection: 'sessions' }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (30 * 24 * 60 * 60 * 1000 milliseconds)
      // secure: true, bật lên 
      httpOnly: true,
      sameSite: 'lax',
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
  app.get("/", checkCookieUserLogin, async (req, res) => {
    res.render("tracuu", {
      header: "header",
    });
  });

  // login route
  app.get("/login", async (req, res) => {
    res.render("login", {
      header: "header",
      thongbao: "thongbao",
      avt: null,
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
        res.sendStatus(200);
      } else {
        // Đăng nhập không thành công
        res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | LOG_IN | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Logout /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  app.get("/api/logout", async (req, res) => {
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
  app.post("/api/change_pass", async (req, res) => {
    try {
      const data = req.body;
      const decode = decrypt(req.cookies.account, authenticationKey);
      const decodeList = decode.split(":"); // Output: "replika is best japanese waifu"
      console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu đã giải mã ${decodeList}`);
      // decodeList = authenticationKey:id:pass
      if (decodeList[0] == authenticationKey) {
        console.log("SYSTEM | CHANGE_PASSWORD |", data);
        // tìm password trên database theo user_id decodeList[1]
        if (data["Old-Password"] == n_result.pass) {
          // đổi pass mới lên server
          res.sendStatus(200);
        } else {
          res.status(403).send("Sai pass cũ");
        }
      } else {
        res.status(404).send("Sai xác thực");
      }
    } catch (err) {
      console.log("SYSTEM | UPDATE INFO | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  app.get("*", checkCookieUserLogin, async function (req, res) {
    res.sendStatus(404);
  });

  app.listen(port, async () => {
    console.log(
      `SYSTEM | LOG | Đang chạy server siu cấp vip pro đa vũ trụ ở http://localhost:${port}`
    );
  });

  // ----------------------------------------------------------------
})
  .catch((err) => {
    console.error('SYSTEM | DATABASE | Failed to connect to MongoDB', err);
  });
