/* Ghi chú: --------------------------------------------------------------------------------------------------------------
Ban all who's name Nguyen Ngoc Long on this server file
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
  classes (in global database)
  0: {
    "_id": "KTPM0121",
    "dep": "CNTT",
    "years": {
      "2021-2022": [1, 2, 3],
      "2022-2023": [1, 2, 3]
    }
  }
  khoa -> nganh -> lop -> sinh vien + giao vien
  sinh vien -> lop -> nganh -> khoa



  tài khoản mặt định:
    {_id: "2101281",
    password: "2101281",
    first: "true"}
  taskDoing:
-------------------------------------------------------------------------------------------------------------------------- */

const express = require("express");
const fs = require('fs');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const https = require('https');
const session = require('express-session');
const cookie = require('cookie');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const server = require("./vip_pro_lib.js");
const MongoStore = require('connect-mongo');
const multer = require('multer'); // Thư viện để xử lý file upload
const XlsxPopulate = require('xlsx-populate');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { data } = require("node-persist");
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
  const name_databases = 'KTPM';
  const name_global_databases = 'global';

  // ------------------------------------------------------------------------------------------------
  async function sendEmail(password, email) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'nguytuan04@gmail.com',
          pass: 'unjwfrdskgezbmym'
        },
      });

      const emailTXT = fs.readFileSync(path.join('src', 'emailTemplate', 'email.txt'), 'utf8');
      const emailHTML = fs.readFileSync(path.join('src', 'emailTemplate', 'email.ejs'), 'utf8');

      const mailOptions = {
        from: '"Quản lý điểm rèn luyện" <nguytuan04@gmail.com>',
        to: email,
        subject: 'Yêu cầu đặt lại mật khẩu',
        text: emailTXT.replace('${password}', password),
        html: ejs.render(emailHTML, { password: password }),
        attachments: [{
          filename: 'image.png',
          path: './src/img/sv_logo_dashboard.png',
          cid: 'fs1120020a17090af28b00b00263fc1ef1aasm843048pjb10' //same cid value as in the html img src
        }]
      };

      const info = await transporter.sendMail(mailOptions);
      // console.log(`SYSTEM | SEND_EMAIL | ${info.response}`);
      // Thực hiện các hoạt động hữu ích khác sau khi gửi email thành công.
    } catch (error) {
      console.log('SYSTEM | SEND_EMAIL | ', error);
    }
  }

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
      } else if ((user.first == 'false')) {
        return res.redirect('/login/updateyourpasswords?tile=ok');
      }
      else {
        const user_info = await client.db(name_global_databases).collection('user_info').findOne({ _id: user._id }, { projection: { _id: 0, avt: 1, displayName: 1 } });
        res.locals.avt = user_info.avt;
        res.locals.displayName = user_info.displayName;
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
      // console.log(txtFilePaths)
      const processFiles = async () => {
        for (const filePath of txtFilePaths) {
          // console.log(filePath);
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

  async function mark(table, user, data, marker, cls) {
    // data = {
    //   first: [],
    //   second: [],
    //   third: [],
    //   fourth: [],
    //   fifth: [],
    //   img_ids: [],
    //   total: 100,
    // }

    const school_year = await client.db(name_global_databases).collection('school_year').findOne({}, { projection: { _id: 0, year: 1 } });

    // update old table if exist or insert new tabl;e
    let update = {
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
    if (table == '_stf_table') {
      update.marker = marker.last_name + " " + marker.first_name;
    }

    await client.db(user.dep).collection(cls + table).updateOne(
      {
        mssv: user._id,
        school_year: school_year.year
      },
      {
        $set: update
      },
      { upsert: true }
    );
  }

  function randomPassword() {
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const number = "0123456789";
    const allChars = upperCase + number;

    return new Promise((resolve, reject) => {
      try {
        let password = "";
        password += upperCase[Math.floor(Math.random() * upperCase.length)];
        password += number[Math.floor(Math.random() * number.length)];

        while (password.length < 6) {
          password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        // console.log('SYSTEM | GEN_PASSWORD | OK')
        resolve(password);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Function to delete the file
  function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        // console.log('File deleted successfully.');
      }
    });
  };

  // Function to schedule the file deletion after 12 hours
  function scheduleFileDeletion(filePath) {
    const twelveHours = 12 * 60 * 60 * 1000; // Convert 12 hours to milliseconds

    setTimeout(() => {
      deleteFile(filePath);
    }, twelveHours);
  };

  // Function to sort name of student in list
  function sortStudentName(std_list) {
    std_list.sort((a, b) => {
      const lastFirstNameWordA = a.first_name.split(' ').pop();
      const lastFirstNameWordB = b.first_name.split(' ').pop();

      const firstNameComparison = lastFirstNameWordA.localeCompare(lastFirstNameWordB, 'vi', { sensitivity: 'base' });
      if (firstNameComparison !== 0) {
        return firstNameComparison;
      }

      return a.last_name.localeCompare(b.last_name, 'vi', { sensitivity: 'base' });
    });
    return std_list;

  }


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
      client, dbName: 'global', crypto: {
        secret: authenticationKey
      }
    }),
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    },
    rolling: true
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
    const user = req.session.user;
    const schoolYear = await client.db(name_global_databases).collection('school_year').findOne({}, { projection: { _id: 0, year: 1 } });
    const schoolYearsToSearch = ['HK1_' + schoolYear.year.slice(4), 'HK2_' + schoolYear.year.slice(4)];
    const studentTotalScores = await Promise.all(schoolYearsToSearch.map(async (year) => {
      const studentTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_std_table')
        .findOne(
          {
            mssv: user._id,
            school_year: year
          },
          {
            projection: { _id: 0, total: 1 }
          }
        );
      return { total: studentTotalScore ? studentTotalScore.total : "Chưa có điểm" };
    }));

    res.render("tracuu", {
      header: "header",
      footer: "footer",
      bandiem: studentTotalScores,
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
      footer: "footer",
      avt: null,
    });
  });

  // firstlogin route
  app.get("/login/updateyourpasswords", async (req, res) => {
    const user = req.session.user;
    let tile = "Đăng nhập lần đầu";
    if (req.query.tile == 'ok') {
      tile = "Cập nhật mật khẩu";
    }
    if (!user?.first) {
      return res.redirect('/');
    }
    res.render("firstlogin", {
      header: "header",
      thongbao: "thongbao",
      footer: "footer",
      avt: null,
      logout: true,
      tile: tile
    });
  });

  // doi password route
  app.get("/profile/change_pass", checkIfUserLoginRoute, async (req, res) => {
    res.render("changepass", {
      header: "header",
      thongbao: "thongbao",
      footer: "footer",
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
  app.get("/bancansunhapdiemdanhgia", checkIfUserLoginRoute, async (req, res) => {
    res.render("bancansunhapbangdiem", {
      header: "header",
      thongbao: "thongbao",
      footer: "footer"
    });
  });
  // ban can su route
  app.get("/bancansu", checkIfUserLoginRoute, async (req, res) => {
    res.render("bancansu", {
      header: "header",
      footer: "footer",
    });
  });

  // doan khoa route
  app.get("/doan_khoa", checkIfUserLoginRoute, async (req, res) => {
    res.render("doan_khoa", {
      header: "header",
      footer: "footer",
    });
  });

  // quan li bo mon - doan khoa route
  app.get("/doan_khoa/quan_li_bm", checkIfUserLoginRoute, async (req, res) => {
    res.render("quan_li_bm", {
      header: "header",
      footer: "footer",
    });
  });

  // quan li lop - doan khoa route
  app.get("/doan_khoa/quan_li_lop", checkIfUserLoginRoute, async (req, res) => {
    res.render("quan_li_lop", {
      header: "header",
      footer: "footer",
    });
  });

  //quan li co van - doan khoa route
  app.get("/doan_khoa/quan_li_cv", checkIfUserLoginRoute, async (req, res) => {
    res.render("quan_li_cv", {
      header: "header",
      footer: "footer",
    });
  });

  // xac thuc route
  app.get("/xacthucOTP", async (req, res) => {
    const user = req.session.user;
    if (user) {
      return res.redirect('/');
    }
    const mssv = req.query.mssv;
    const dataUser = await client.db(name_global_databases).collection('user_info').findOne({ _id: mssv }, { projection: { _id: 0, email: 1 } });
    let emailToShow = '';
    if (dataUser) {
      const email = dataUser.email;
      emailToShow = email.substring(0, 3) + '*'.repeat(email.indexOf('@') - 3) + email.substring(email.indexOf('@'));
    }
    res.render("xacthucOTP", {
      header: "header",
      footer: "footer",
      avt: null,
      thongbao: "thongbao",
      email: emailToShow,
    });
  });

  // Quan li hoat dong lop route
  app.get("/bancansu/quanlihoatdong", checkIfUserLoginRoute, async (req, res) => {
    res.render("quanlihoatdong", {
      header: "header",
      footer: "footer",
    });
  });

  // Quan li hoat dong khoa route
  app.get("/doan_khoa/quan_li_hoat_dong_khoa", checkIfUserLoginRoute, async (req, res) => {
    res.render("quan_li_hoat_dong_khoa", {
      header: "header",
      footer: "footer",
    });
  });


  // Danh gia hoat dong
  app.get("/bancansu/quanlihoatdong/danh_gia_hoat_dong", checkIfUserLoginRoute, async (req, res) => {
    res.render("danh_gia_hoat_dong", {
      header: "header",
      footer: "footer",
    });
  });

  // Quen mat khau
  app.get("/quenmatkhau", async (req, res) => {
    const user = req.session.user;
    if (user) {
      return res.redirect('/');
    }
    res.render("quenmatkhau", {
      header: "header",
      footer: "footer",
      thongbao: "thongbao",
      avt: null,
    });
  });

  // thong tin ca nhan route
  app.get("/profile", checkIfUserLoginRoute, async (req, res) => {
    const user_info = await client.db(name_global_databases).collection('user_info').findOne({ _id: req.session.user._id }, { projection: { last_name: 1, first_name: 1, email: 1 } });
    res.render("edit-profile", {
      header: "header",
      footer: "footer",
      name: user_info.last_name + " " + user_info.first_name,
      mssv: user_info._id,
      email: user_info.email,
      thongbao: "thongbao"
    });
  });

  // danh sach sinh vien // ông đổi lại vụ class nha liên hệ NBM để biết thêm chi tiết
  app.get("/danhsachsinhvien_cv", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;
    const marker = await client.db(name_global_databases).collection('user_info').findOne(
      { _id: user._id },
      {
        projection: {
          _id: 0,
          power: 1
        }
      }
    );
    if (marker.power[1]) {
      res.render("danhsachsinhvien_cv", {
        header: "header",
        footer: "footer",
        thongbao: "thongbao"
      });
    } else {
      return res.redirect('/');
    }



  });
  // danh sach bang diem
  app.get("/danhsachbangdiem", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;
    const school_year = await client.db(name_global_databases).collection('school_year').findOne(
      {},
      { projection: { _id: 0, year: 1 } });
    // get staff member info :
    const marker = await client.db(name_global_databases).collection('user_info').findOne(
      { _id: user._id },
      {
        projection: {
          _id: 0,
          power: 1
        }
      }
    );
    // check user login:
    if (marker.power[1]) {
      const years = await client.db(name_global_databases).collection('classes').findOne(
        { _id: user.cls[0] },
        { projection: { _id: 0, years: 1 } }
      );

      // get all student in staff member class:
      let student_list = await client.db(name_global_databases).collection('user_info').find(
        { class: user.cls[0] },
        { projection: { first_name: 1, last_name: 1 } })
        .toArray();
      student_list = sortStudentName(student_list);

      // get all student total score from themself:
      let render = {
        header: "header",
        footer: "footer",
        thongbao: "thongbao",
        staff_name: [],
        student_list: student_list,
        student_scores: [],
        staff_scores: [],
        department_scores: [],
        cls: user.cls,
        years: years.years,
        curr_year: school_year.year
      }

      for (student of student_list) {
        const curr_student_score = await client.db(user.dep)
          .collection(user.cls[0] + '_std_table')
          .findOne(
            {
              mssv: student._id,
              school_year: school_year.year
            },
            {
              projection: { total: 1 }
            }
          );
        const curr_staff_score = await client.db(user.dep)
          .collection(user.cls[0] + '_stf_table')
          .findOne(
            {
              mssv: student._id,
              school_year: school_year.year
            },
            {
              projection: {
                total: 1,
                marker: 1
              }
            }
          );
        const curr_department_score = await client.db(user.dep)
          .collection(user.cls[0] + '_dep_table')
          .findOne(
            {
              mssv: student._id,
              school_year: school_year.year
            },
            {
              projection: { total: 1 }
            }
          );
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
        if (curr_department_score) {
          render.department_scores.push(curr_department_score.total);
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
        let user = await client.db(name_global_databases).collection('login_info').findOne({ _id: data.mssv });
        if (user === null) {
          // Đăng nhập không thành công
          res.sendStatus(403);
        } else if (user._id === data.mssv && user.password === data.password) {
          let seasionIDs = await client.db(name_global_databases).collection('sessions_manager').findOne({ _id: data.mssv });
          if (seasionIDs) {
            seasionIDs = seasionIDs.sessionId;
            const existingDocs = await client.db(name_global_databases).collection('sessions').find({ _id: { $in: seasionIDs } }).toArray();
            const existingIDs = existingDocs.map(doc => doc._id);
            const idsToDelete = seasionIDs.filter(id => !existingIDs.includes(id));
            if (idsToDelete.length > 0) {
              await client.db(name_global_databases).collection('sessions_manager').updateOne(
                { _id: data.mssv },
                { $pull: { sessionId: { $in: idsToDelete } } }
              );
            }
          }

          // get user class(cls) and department(dep)
          const cls = await client.db(name_global_databases).collection('user_info').findOne(
            { _id: data.mssv },
            { projection: { _id: 0, class: 1 } }
          );
          const dep = await client.db(name_global_databases).collection('classes').findOne(
            { _id: cls.class[0] },
            { projection: { _id: 0, dep: 1 } }
          );

          user.cls = cls.class;
          user.dep = dep.dep;
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
          await client.db(name_global_databases).collection('sessions_manager').updateOne(
            { _id: user._id },
            { $push: { sessionId: sessionId } },
            { upsert: true }
          );

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
    const mssv = req.session.user._id;
    req.session.destroy((err) => {
      if (err) {
        console.error('SYSTEM | LOG_OUT | Failed to logout:', err);
        res.sendStatus(500);
      } else {
        let seasionIDs;
        async function processSessionIDs() {
          try {
            seasionIDs = await client.db(name_global_databases).collection('sessions_manager').findOne({ _id: mssv });
            if (seasionIDs) {
              seasionIDs = seasionIDs.sessionId;
              const existingDocs = await client.db(name_global_databases).collection('sessions').find({ _id: { $in: seasionIDs } }).toArray();
              const existingIDs = existingDocs.map(doc => doc._id);
              const idsToDelete = seasionIDs.filter(id => !existingIDs.includes(id));

              if (idsToDelete.length > 0) {
                await client.db(name_global_databases).collection('sessions_manager').updateOne(
                  { _id: mssv },
                  { $pull: { sessionId: { $in: idsToDelete } } }
                );
              }
            }

            res.redirect('/login'); // Chạy hàm dưới sau khi đã xử lý xong
          } catch (error) {
            console.error('SYSTEM | LOG_OUT | Failed to clean up sessions:', error);
            res.sendStatus(500);
          }
        }

        processSessionIDs();
      }
    });

  });

  // Đăng xuất tất cả thiết bị
  app.get("/api/logoutAlldevice", checkIfUserLoginAPI, async (req, res) => {
    // Xóa thông tin phiên (session) của người dùng
    const _id = req.session.user._id;
    const result = await client.db(name_global_databases).collection('sessions_manager').findOne({ _id: _id });
    const listSeasionId = result.sessionId;
    listSeasionId.splice(listSeasionId.indexOf(req.session.id), 1);
    await client.db(name_global_databases).collection('sessions_manager').updateOne(
      { _id: _id },

      { $pull: { sessionId: { $ne: req.session.id } } }
    );
    await client.db(name_global_databases).collection('sessions').deleteMany({ _id: { $in: listSeasionId } });
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
      await client.db(name_global_databases).collection('user_info').updateOne(
        { "_id": req.session.user._id },
        {
          $set: {
            displayName: data.displayName,
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

  // Reset pass ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/resetpassword", async (req, res) => {
    try {
      const data = req.body;
      // console.log(`SYSTEM | RESET_PASSWORD | Dữ liệu nhận được`, data);
      const OTP = await client.db(name_global_databases).collection("OTP").findOne({ _id: data.mssv }, { projection: { _id: 0 } });
      if (OTP && (OTP.otpcode === data.otp)) {
        await client.db(name_global_databases).collection("OTP").deleteOne({ _id: data.mssv });
        const user = await client.db(name_global_databases).collection('login_info').findOneAndUpdate({ _id: data.mssv }, { $set: { first: "false" } }, { returnDocument: "after" });
        // Đăng nhập thành công, lưu thông tin người dùng vào phiên
        req.session.user = user.value;
        req.session.cookie.maxAge = 3600000; // 1 hour
        const sessionId = req.session.id;
        await client.db(name_global_databases).collection('sessions_manager').updateOne(
          { _id: user._id },
          { $push: { sessionId: sessionId } },
          { upsert: true }
        );
        res.sendStatus(200);
      } else { res.sendStatus(403); }
    } catch (err) {
      console.log("SYSTEM | RESET_PASSWORD | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Resent OTP ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/resendotp", async (req, res) => {
    try {
      const mssv = req.body.mssv;
      const dataUser = await client.db(name_global_databases).collection('user_info').findOne({ _id: mssv }, { projection: { _id: 0, email: 1 } });
      // Thêm tài liệu mới có thời gian hết hạn sau 1 phút
      const OTPscode = await randomPassword();
      await client.db(name_global_databases).collection('OTP').updateOne({ _id: mssv }, {
        $set: {
          otpcode: OTPscode,
          expireAt: new Date(Date.now() + (60 * 5) * 1000) // Hết hạn sau 5 phút
        }
      },
        { upsert: true }
      );
      if (dataUser) {
        const email = dataUser.email;
        await sendEmail(OTPscode, email);
      }
      res.sendStatus(200);
    }
    catch (err) {
      console.log("SYSTEM | RESEND_OTP | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Đổi pass ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/change_pass", checkIfUserLoginAPI, async (req, res) => {
    try {
      const data = req.body;
      // console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu nhận được`, data);
      const old_pass = await client.db(name_global_databases).collection("login_info").findOne({ _id: req.session.user._id }, { projection: { _id: 0, password: 1 } });
      if ((old_pass.password == data.old_password)) {
        if (old_pass.password !== data.new_password) {
          await client.db(name_global_databases).collection('login_info').updateOne(
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
      // console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu nhận được`, data);
      const old_pass = await client.db(name_global_databases).collection('login_info').findOne({ _id: req.session.user._id }, { projection: { _id: 0, password: 1 } });

      if (old_pass.password == data.new_password) {
        res.sendStatus(403);
      } else {
        delete req.session.user.first;
        await client.db(name_global_databases).collection('login_info').updateOne(
          { "_id": req.session.user._id },
          { $unset: { first: "" } }
        );
        await client.db(name_global_databases).collection('login_info').updateOne(
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
      const marker = await client.db(name_global_databases).collection('user_info').findOne(
        { _id: user._id },
        {
          projection: {
            _id: 0,
            last_name: 1,
            first_name: 1
          }
        }
      );

      await mark("_std_table", user, data, marker, user.cls[0]);

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
    // console.log('SYSTEM | UPLOAD_FILE | Files uploaded:', req.files);
    res.writeHead(200, { 'Content-Type': 'applicaiton/json' });
    res.end(JSON.stringify(await get_full_id(uploadDirectory, list_name)));
  });

  // Create new account -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/createAccount", upload.single('file'), checkIfUserLoginAPI, async (req, res) => {
    try {
      // read excel file:
      // create all account
      const fileStudents = req.file;
      const workbook = await XlsxPopulate.fromFileAsync(fileStudents.path);
      const sheet = workbook.sheet(0);
      const values = sheet.usedRange().value();
      //[['MSSV', 'Họ', 'Tên' ]]
      // let dataInsertUser = [];
      // let dataInsertLogin = [];
      for (let i = 1; i < values.length; i++) {
        let dataInsertUser = {
          _id: values[i][0].toString(),
          first_name: values[i][2],
          last_name: values[i][1],
          avt: "https://i.pinimg.com/236x/89/08/3b/89083bba40545a72fa15321af5fab760--chibi-girl-zero.jpg",
          power: { 0: true },
          class: [req.body.cls],
          displayName: `${values[i][1]} ${values[i][2]}`,
          email: "",
        };
        let dataInsertLogin = {
          _id: values[i][0].toString(),
          password: await randomPassword()
        }
        client.db('global').collection('user_info').updateOne({
          _id: dataInsertUser._id
        }, {
          $set:dataInsertUser
        },
        {
          upsert:true
        });
        client.db('global').collection('login_info').updateOne({
          _id: dataInsertLogin._id
        }, {
          $set:dataInsertLogin
        },
        {
          upsert:true
        });
        
        console.log(`Thêm thành công ${dataInsertUser.displayName}`);
      }
      // xoa file sau khi xu ly
      fs.unlink(fileStudents.path, (err) => {
        if (err) {
          console.error("Lỗi khi xóa tệp:", err);
        }
      });
      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | MARK | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Export class score report --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.get("/api/exportClassScore", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.query;
      //data = {year: "HK1_2022-2023", cls: '1'}
      const school_year = data.year;
      let cls = data.cls;

      // create uuid for download file
      const uuid = uuidv4();

      // get staff member info :
      const marker = await client.db(name_global_databases).collection('user_info').findOne(
        { _id: user._id },
        {
          projection: {
            _id: 0,
            power: 1
          }
        }
      );

      // check for post data.cls if class define this mean they choose class so that must
      if (!cls) {
        cls = 0;
      };

      // check user login:
      if (marker.power[1]) {
        // get all student in staff member class:
        const student_list = await client.db(name_global_databases).collection('user_info').find(
          { class: user.cls[parseInt(cls)] },
          { projection: { first_name: 1, last_name: 1 } })
          .sort({ first_name: 1, last_name: 1 })
          .toArray();

        // get all student total score from themself:
        let scores = [];

        for (let i = 0; i < student_list.length; i++) {
          // [stt, mssv. ho, ten, lop, 
          // 1.0, 1.1, 1.2, 1.3, 1.4,
          // 2.0, 2.1,
          // 3.0, 3.1, 3.2,
          // 4.0, 4.1, 4.2,
          // 5.0, 5.1, 5.2, 5.3,
          // "", total, conduct, ""]
          let curr_score = [
            i + 1,
            student_list[i]._id,
            student_list[i].last_name,
            student_list[i].first_name,
            user.cls[parseInt(cls)]
          ];

          const curr_departmentt_score = await client.db(user.dep)
            .collection(user.cls[parseInt(cls)] + '_dep_table')
            .findOne(
              {
                mssv: student_list[i]._id,
                school_year: school_year
              },
              {
                projection: {
                  first: 1,
                  second: 1,
                  third: 1,
                  fourth: 1,
                  fifth: 1,
                  total: 1
                }
              }
            );

          if (curr_departmentt_score) {
            curr_score.push(...curr_departmentt_score.first);
            curr_score.push(...curr_departmentt_score.second);
            curr_score.push(...curr_departmentt_score.third);
            curr_score.push(...curr_departmentt_score.fourth);
            curr_score.push(...curr_departmentt_score.fifth);
          } else {
            for (let j = 0; j < 17; j++) {
              curr_score.push(null);
            }
          }

          curr_score.push(null);

          if (curr_departmentt_score) {
            curr_score.push(curr_departmentt_score.total)
            // set kind of conduct:
            if (curr_departmentt_score.total >= 90) {
              curr_score.push('xuất sắc');
            } else if (curr_departmentt_score.total >= 80) {
              curr_score.push('tốt');
            } else if (curr_departmentt_score.total >= 65) {
              curr_score.push('khá');
            } else if (curr_departmentt_score.total >= 50) {
              curr_score.push('trung bình');
            } else if (curr_departmentt_score.total >= 35) {
              curr_score.push('yếu');
            } else {
              curr_score.push('kém');
            }
          }

          // add curr_score to scores
          scores.push(curr_score);
        }

        // Load an existing workbook
        const workbook = await XlsxPopulate.fromFileAsync("./src/excelTemplate/Bang_diem_ca_lop_xuat_tu_he_thong.xlsx")
        await workbook.sheet(0).cell("A7").value(scores);
        // Write to file.
        await workbook.toFileAsync(path.join('.downloads', uuid + ".xlsx"));

        // tải file xlsx về máy người dùng
        // res.download(path.join('.downloads', uuid + ".xlsx"));
        res.download(path.join('.downloads', uuid + ".xlsx"));

        // delete file after 12 hours
        scheduleFileDeletion(path.join('.downloads', uuid + ".xlsx"))
      }
    } catch (err) {
      console.log("SYSTEM | MARK | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Load score list of student in specific class at specific time ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.get("/api/loadScoresList", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.query;
      //data = {year: "HK1_2022-2023", cls: "1"}
      const school_year = data.year;
      let cls = data.cls;
      // get staff member info :
      const marker = await client.db(name_global_databases).collection('user_info').findOne(
        { _id: user._id },
        {
          projection: {
            _id: 0,
            power: 1,
          }
        }
      );

      // check for post data.cls if class define this mean they choose class so that must
      if (!cls) {
        cls = 0;
      }

      if (marker.power[1]) {
        // get all student in staff member class:
        const student_list = await client.db(name_global_databases).collection('user_info').find(
          { class: user.cls[parseInt(cls)] },
          { projection: { first_name: 1, last_name: 1 } })
          .sort({ first_name: 1, last_name: 1 })
          .toArray();



        // get all student total score from themself:
        let result = {
          staff_name: [],
          student_list: student_list,
          student_scores: [],
          staff_scores: [],
          department_scores: []
        }

        for (student of student_list) {
          const curr_student_score = await client.db(user.dep)
            .collection(user.cls[parseInt(cls)] + '_std_table')
            .findOne(
              {
                mssv: student._id,
                school_year: school_year
              },
              {
                projection: {
                  _id: 0,
                  total: 1
                }
              }
            );
          const curr_staff_score = await client.db(user.dep)
            .collection(user.cls[parseInt(cls)] + '_stf_table')
            .findOne(
              {
                mssv: student._id,
                school_year: school_year
              },
              {
                projection: {
                  _id: 0,
                  total: 1,
                  marker: 1
                }
              }
            );
          const curr_departmentt_score = await client.db(user.dep)
            .collection(user.cls[parseInt(cls)] + '_dep_table')
            .findOne(
              {
                mssv: student._id,
                school_year: school_year
              },
              {
                projection: {
                  _id: 0,
                  total: 1
                }
              }
            );
          // student
          if (curr_student_score) {
            result.student_scores.push(curr_student_score.total);
          } else {
            result.student_scores.push('-');
          }
          // staff member
          if (curr_staff_score) {
            result.staff_scores.push(curr_staff_score.total);
            result.staff_name.push(curr_staff_score.marker);
          } else {
            result.staff_scores.push('-');
            result.staff_name.push('-');
          }
          // department
          if (curr_departmentt_score) {
            result.department_scores.push(curr_departmentt_score.total);
          } else {
            result.department_scores.push('-');
          }
        }

        res.status(200).json(result);
      }
      else { // user not staff members 
        // redirect to home
        return res.redirect('/');
      }
    } catch (err) {
      console.log("SYSTEM | LOAD_SCORE_LIST | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // Auto mark (copy student mark to staff mark)
  app.post("/api/autoMark", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body;
      let cls = data.cls;
      //data = {year: "HK1_2022-2023", cls: "1", std_list = []}

      // get staff member info :
      const marker = await client.db(name_global_databases).collection('user_info').findOne(
        { _id: user._id },
        {
          projection: {
            _id: 0,
            last_name: 1,
            first_name: 1
          }
        }
      );

      // check for post data.cls if class define this mean they choose class so that must
      if (!cls) {
        cls = 0;
      }

      // check if table is exist or not
      // update or add new table copy from std_table to staff_table
      for (let i = 0; i < data.std_list.length; i++) {
        const std_table = await client.db(name_databases).collection(user.cls[parseInt(cls)] + '_std_table').findOne(
          {
            mssv: data.std_list[i],
            school_year: data.year
          }
        );

        // update old table if exist else insert new one
        // copy from student table and add marker name
        if (std_table) {
          std_table.marker = marker.last_name + " " + marker.first_name

          await client.db(name_databases).collection(user.cls[parseInt(cls)] + '_stf_table').updateOne(
            {
              mssv: data.std_list[i],
              school_year: data.year
            },
            {
              $set: std_table
            },
            { upsert: true }
          );
        }
      }

      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | LOAD_SCORE_LIST | ERROR | ", err);
      res.sendStatus(500);
    }

  });

  // api danh sach sinh vien // có j sữa tên tiêng anh lại cho nó dồng bộ code nha Phát
  app.post("/api/getStudentList", checkIfUserLoginAPI, async (req, res) => {
    const user = req.session.user;
    const data = req.body;
    const marker = await client.db(name_global_databases).collection('user_info').findOne(
      { _id: user._id },
      {
        projection: {
          _id: 0,
          power: 1
        }
      }
    );
    let reqClass = data.class
    if (!reqClass) {
      reqClass = user.cls[0];
    }
    if (marker.power[1]) {
      const student_list = await client.db(name_global_databases).collection('user_info').find(
        { class: reqClass },
        { projection: { first_name: 1, last_name: 1 } })
        .sort({ first_name: 1, last_name: 1 })
        .toArray();
      res.status(200).json(student_list);
    } else {
      return res.redirect('/');
    }

  })

  app.get("/api/getuserscore", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;
      const schoolYearParam = req.query.schoolYear;
      const schoolYearsToSearch = ['HK1_' + schoolYearParam, 'HK2_' + schoolYearParam];
      const studentTotalScores = await Promise.all(schoolYearsToSearch.map(async (year) => {
        const studentTotalScore = await client.db(user.dep)
          .collection(user.cls[0] + '_std_table')
          .findOne(
            {
              mssv: user._id,
              school_year: year
            },
            {
              projection: { _id: 0, total: 1 }
            }
          );
        return { year: year, total: studentTotalScore ? studentTotalScore.total : "Chưa có điểm" };
      }));
      res.status(200).json(studentTotalScores);
    } catch (err) {
      res.status(500).json({ error: "Lỗi hệ thống" });
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
