/* Ghi chú: --------------------------------------------------------------------------------------------------------------
Ban all who's name Nguyen Ngoc Long on this server file
@dawn1810:
  phân quyền người dùng:
    0: nhập điểm và tra cứu đie sinh viên (sinh viên)
    1: chấm điểm lần 1 (ban cán sự, giáo viên)
    2: chấp điểm lần 2 || duyệt điểm (khoa)
    3: quản lý hoạt động (ban cán sự, giáo viên)
    4: cấp quyền cho học sinh (giáo viên)
    5: quản lý bộ môn (khoa)
    6: thiết lập thời hạn chấm điểm (khoa)
    7: quản lý lớp (khoa)
    8: quản lý cố vấn (khoa)
    ...
    
    role sv [0]

    role bancansu [0, 1, 3]

    role gv [ 1, 3, 4]

    role khoa [1,2,3,4,5,6,7,8]

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
    {_id: "19112003",
    password: "18102003",
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
const uri = "mongodb+srv://binhminh19112003:Zr3uGIK4dCymOXON@6aesieunhan.sefjqcb.mongodb.net/?retryWrites=true&w=majority";
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
  const uploadDirectory = path.join('.upload_temp');

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
    // console.log(user);
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
  }

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

    const school_year = await client.db(name_global_databases).collection('school_year').findOne(
      {},
      {
        projection: {
          _id: 0,
          year: 1,
          start_day: 1,
          end_day: 1
        }
      });
    let today = new Date().getTime();
    let start_day = new Date(school_year.start_day).getTime();
    let end_day = new Date(school_year.end_day).getTime();
    let forever_day = new Date("2003-10-18").getTime(); // special date

    // check if end mark time or not
    if (start_day <= today && (today < end_day || end_day == forever_day)) {
      // update old table if exist or insert new table
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
      console.log(update);

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
  }

  // Function to schedule the file deletion after 12 hours
  function scheduleFileDeletion(filePath) {
    const twelveHours = 12 * 60 * 60 * 1000; // Convert 12 hours to milliseconds

    setTimeout(() => {
      deleteFile(filePath);
    }, twelveHours);
  }

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

  // Function to create id for string (get all start letter of words and cobine together)
  function createId(str) {
    let arr = str.toUpperCase().trim().split(" ");
    let id = '';
    for (let i of arr) {
      id += i.charAt(0);
    }
    return id;
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
      client, dbName: name_global_databases, crypto: {
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
  app.get("/new", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;

      const schoolYear = await client.db(name_global_databases).collection('school_year').findOne({}, { projection: { _id: 0, year: 1 } });
      const schoolYear_all = await client.db(name_global_databases).collection('classes').findOne({ _id: user.cls[0] }, { projection: { _id: 0, years: 1 } });
      let schoolYearsToSearch = [];
      for (let i = 0; i < schoolYear_all.years[schoolYear.year.slice(4)].length; i++) {
        schoolYearsToSearch.push(`HK${i + 1}_` + schoolYear.year.slice(4));
      }
      const studentTotalScores = await Promise.all(schoolYearsToSearch.map(async (year) => {
        let studentTotalScore = null;

        // Tìm trong bảng '_dep_table' trước
        const depCollection = client.db(user.dep).collection('_dep_table');
        const depDocument = await depCollection.findOne(
          { mssv: user._id, school_year: year },
          { projection: { _id: 0, total: 1 } }
        );

        if (depDocument) {
          studentTotalScore = depDocument.total;
        } else {
          // Nếu không tìm thấy, tìm trong bảng '_std_table'
          const stdCollection = client.db(user.dep).collection(user.cls[0] + '_std_table');
          const stdDocument = await stdCollection.findOne(
            { mssv: user._id, school_year: year },
            { projection: { _id: 0, total: 1 } }
          );

          if (stdDocument) {
            studentTotalScore = stdDocument.total;
          } else {
            // Nếu không tìm thấy, tìm trong bảng '_stf_table'
            const stfCollection = client.db(user.dep).collection('_stf_table');
            const stfDocument = await stfCollection.findOne(
              { mssv: user._id, school_year: year },
              { projection: { _id: 0, total: 1 } }
            );

            if (stfDocument) {
              studentTotalScore = stfDocument.total;
            }
          }
        }
        return { year: year, total: studentTotalScore ? studentTotalScore : "Chưa có điểm" };
      }));

      res.render("index", {
        header: "global-header",
        footer: "global-footer",
        thongbao: "global-notifications",
        bandiem: studentTotalScores,
        pow: user.pow,
        nienkhoa: Object.keys(schoolYear_all.years),
      });

    } catch (err) { console.log(err); }
  });

  app.get("/", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;

      const schoolYear = await client.db(name_global_databases).collection('school_year').findOne({}, { projection: { _id: 0, year: 1 } });
      const schoolYear_all = await client.db(name_global_databases).collection('classes').findOne({ _id: user.cls[0] }, { projection: { _id: 0, years: 1 } });
      let schoolYearsToSearch = [];
      if (schoolYear_all.years[schoolYear.year.slice(4)]) {
        for (let i = 0; i < schoolYear_all.years[schoolYear.year.slice(4)].length; i++) {
          schoolYearsToSearch.push(`HK${i + 1}_` + schoolYear.year.slice(4));
        }
        const studentTotalScores = await Promise.all(schoolYearsToSearch.map(async (year) => {
          let studentTotalScore = null;

          // Tìm trong bảng '_dep_table' trước
          const depCollection = client.db(user.dep).collection('_dep_table');
          const depDocument = await depCollection.findOne(
            { mssv: user._id, school_year: year },
            { projection: { _id: 0, total: 1 } }
          );

          if (depDocument) {
            studentTotalScore = depDocument.total;
          } else {
            // Nếu không tìm thấy, tìm trong bảng '_std_table'
            const stdCollection = client.db(user.dep).collection(user.cls[0] + '_std_table');
            const stdDocument = await stdCollection.findOne(
              { mssv: user._id, school_year: year },
              { projection: { _id: 0, total: 1 } }
            );

            if (stdDocument) {
              studentTotalScore = stdDocument.total;
            } else {
              // Nếu không tìm thấy, tìm trong bảng '_stf_table'
              const stfCollection = client.db(user.dep).collection('_stf_table');
              const stfDocument = await stfCollection.findOne(
                { mssv: user._id, school_year: year },
                { projection: { _id: 0, total: 1 } }
              );

              if (stfDocument) {
                studentTotalScore = stfDocument.total;
              }
            }
          }
          return { year: year, total: studentTotalScore ? studentTotalScore : "Chưa có điểm" };
        }));

        res.render("sinhvien-index", {
          header: "global-header",
          footer: "global-footer",
          thongbao: "global-notifications",
          bandiem: studentTotalScores,
          nienkhoa: Object.keys(schoolYear_all.years),
        });
      } else {
        res.status(403).send('Sinh viên đã tốt nghiệp');
      }

    } catch (err) { console.log(err); }
  });

  // login route
  app.get("/login", async (req, res) => {
    const user = req.session.user;
    if (user) {
      return res.redirect('/');
    }
    res.render("global-login", {
      header: "global-header",
      thongbao: "global-notifications",
      footer: "global-footer",
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
    res.render("global-first-login", {
      header: "global-header",
      thongbao: "global-notifications",
      footer: "global-footer",
      avt: null,
      logout: true,
      tile: tile
    });
  });

  // xac thuc route
  app.get("/xacthucOTP", async (req, res) => {
    try {
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
      res.render("global-verify-otp", {
        header: "global-header",
        footer: "global-footer",
        avt: null,
        thongbao: "global-notifications",
        email: emailToShow,
      });
    } catch (err) {
      console.log(err);
      res.render("global-verify-otp", {
        header: "global-header",
        footer: "global-footer",
        avt: null,
        thongbao: "global-notifications",
        email: "",
      });
    }
  });

  // thong tin ca nhan route
  app.get("/profile", checkIfUserLoginRoute, async (req, res) => {
    const user_info = await client.db(name_global_databases).collection('user_info').findOne({ _id: req.session.user._id }, { projection: { last_name: 1, first_name: 1, email: 1 } });
    res.render("global-edit-profile", {
      header: "global-header",
      footer: "global-footer",
      name: user_info.last_name + " " + user_info.first_name,
      mssv: user_info._id,
      email: user_info.email,
      thongbao: "global-notifications"
    });

  });

  // doi password route
  app.get("/profile/change_pass", checkIfUserLoginRoute, async (req, res) => {
    res.render("global-change-password", {
      header: "global-header",
      thongbao: "global-notifications",
      footer: "global-footer",
    });
  });

  // Quen mat khau
  app.get("/quenmatkhau", async (req, res) => {
    const user = req.session.user;
    if (user) {
      return res.redirect('/');
    }
    res.render("global-forgot-password", {
      header: "global-header",
      footer: "global-footer",
      thongbao: "global-notifications",
      avt: null,
    });
  });

  // nhap bang diem route
  app.get("/nhapdiemdanhgia", checkIfUserLoginRoute, async (req, res) => {
    const school_year = await client.db(name_global_databases).collection('school_year').findOne(
      {},
      {
        projection: {
          _id: 0,
          year: 1,
          start_day: 1,
          end_day: 1
        }
      });
    let today = new Date().getTime();
    let start_day = new Date(school_year.start_day).getTime();
    let end_day = new Date(school_year.end_day).getTime();
    let forever_day = new Date("2003-10-18").getTime(); // special date

    // check if end mark time or not
    if (start_day <= today && (today < end_day || end_day == forever_day)) {
      res.render("sinhvien-enter-grades", {
        header: "global-header",
        thongbao: "global-notifications",
        footer: "global-footer"
      });
    } else {
      res.redirect("/");
    }
  });

  // xem bang diem route
  app.get("/xembangdiem", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;
      const mssv = req.session.user._id;
      const schoolYearParam = req.query.schoolYear;
      const studentTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_std_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );

      let stfTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_stf_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );


      let depTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_dep_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );
      nulltable = {
        "fifth": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "first": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "fourth": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "second": [
          'Chưa chấm',
          'Chưa chấm'
        ],
        "third": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "total": 'Chưa chấm'
      }
      if (!stfTotalScore) {
        stfTotalScore = nulltable
      }
      if (!depTotalScore) {
        depTotalScore = nulltable
      }

      if (studentTotalScore) {
        res.render("sinhvien-view-grades", {
          header: "global-header",
          thongbao: "global-notifications",
          footer: "global-footer",
          Scorestd: studentTotalScore,
          Score: stfTotalScore,
          Scorek: depTotalScore
        });

      }
      else { res.sendStatus(404); }
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: "Lỗi hệ thống" });
    }

  });


  // giao vien route
  app.get("/giaovien", checkIfUserLoginRoute, async (req, res) => {
    res.render("teacher-index", {
      header: "global-header",
      footer: "global-footer",

    });
  });
  app.get("/giaovien/quanlyquyen", checkIfUserLoginRoute, async (req, res) => {
    res.render("teacher_QL_sv", {
      header: "global-header",
      footer: "global-footer",
      thongbao: "global-notifications",

    });
  });
  // ban can su route
  app.get("/bancansu", checkIfUserLoginRoute, async (req, res) => {
    res.render("bancansu-index", {
      header: "global-header",
      footer: "global-footer",
    });
  });

  // ban can su / giang vien nhap diem route
  app.get("/bancansu/nhapdiemdanhgia", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;
      const mssv = req.query.studentId;
      const schoolYearParam = req.query.schoolYear;
      const studentTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_std_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );

      let stfTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_stf_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );


      let depTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_dep_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );
      nulltable = {
        "fifth": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "first": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "fourth": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "second": [
          'Chưa chấm',
          'Chưa chấm'
        ],
        "third": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "total": 'Chưa chấm'
      }
      if (!stfTotalScore) {
        stfTotalScore = nulltable
      }
      if (!depTotalScore) {
        depTotalScore = nulltable
      }

      if (studentTotalScore) {
        res.render("bancansu-manage-grades", {
          header: "global-header",
          thongbao: "global-notifications",
          footer: "global-footer",
          Scorestd: studentTotalScore,
          Score: stfTotalScore,
          Scorek: depTotalScore
        });

      }
      else { res.sendStatus(404); }
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: "Lỗi hệ thống" });
    }

  });

  // ban can su quan ly hoat dong
  app.get("/bancansu/quanlihoatdong", checkIfUserLoginRoute, async (req, res) => {
    res.render("bancansu-manage-activities", {
      header: "global-header",
      footer: "global-footer",
    });
  });

  // danh gia hoat dong
  app.get("/bancansu/quanlihoatdong/danh_gia_hoat_dong", checkIfUserLoginRoute, async (req, res) => {
    res.render("bancansu-activity-assessment", {
      header: "global-header",
      footer: "global-footer",
    });
  });

  // danh sach bang diem
  app.get("/bancansu/danhsachbangdiem", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;
    const school_year = await client.db(name_global_databases).collection('school_year').findOne(
      {},
      { projection: { _id: 0, year: 1 } }
    );
    // check user login:
    if (user.pow[1]) {
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
        header: "global-header",
        footer: "global-footer",
        thongbao: "global-notifications",
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

      res.render("bancansu-grade-list", render);
    }
    else { // user not staff members 
      // redirect to home
      return res.redirect('/');
    }

  });

  // danh sach bang diem khoa
  app.get("/doan_khoa/danhsachbangdiem", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;
    const school_year = await client.db(name_global_databases).collection('school_year').findOne(
      {},
      { projection: { _id: 0, year: 1 } }
    );
    console.log(school_year)
    // check user login:
    if (user.pow[1]) {
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
        header: "global-header",
        footer: "global-footer",
        thongbao: "global-notifications",
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
        console.log(curr_student_score)
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

      res.render("doankhoa-grade-list", render);
    }
    else { // user not staff members 
      // redirect to home
      return res.redirect('/');
    }

  });
  // doan khoa grade
  app.get("/khoaxembangdiem", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;
      const mssv = req.session.user._id;
      const schoolYearParam = req.query.schoolYear;
      const studentTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_std_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );

      let stfTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_stf_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );


      let depTotalScore = await client.db(user.dep)
        .collection(user.cls[0] + '_dep_table')
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam
          },
          {
            projection: { _id: 0, first: 1, second: 1, third: 1, fourth: 1, fifth: 1, total: 1 }
          }
        );
      nulltable = {
        "fifth": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "first": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "fourth": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "second": [
          'Chưa chấm',
          'Chưa chấm'
        ],
        "third": [
          'Chưa chấm',
          'Chưa chấm',
          'Chưa chấm'
        ],
        "total": 'Chưa chấm'
      }
      if (!stfTotalScore) {
        stfTotalScore = nulltable
      }
      if (!depTotalScore) {
        depTotalScore = nulltable
      }

      if (studentTotalScore) {
        res.render("sinhvien-view-grades", {
          header: "global-header",
          thongbao: "global-notifications",
          footer: "global-footer",
          Scorestd: studentTotalScore,
          Score: stfTotalScore,
          Scorek: depTotalScore
        });

      }
      else { res.sendStatus(404); }
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: "Lỗi hệ thống" });
    }

  });

  // doan khoa route
  app.get("/doan_khoa", checkIfUserLoginRoute, async (req, res) => {
    res.render("doankhoa-index", {
      header: "global-header",
      footer: "global-footer",
      menu: "doankhoa_menu",

    });
  });

  // quan li bo mon - doan khoa route
  app.get("/doan_khoa/quan_li_bm", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;

    // get all branch of department:
    const branchs = await client.db(name_global_databases).collection('branchs').find(
      {
        dep: user.dep
      }, // find all data
      {
        projection: {
          _id: 0,
          name: 1,
        }
      }
    ).toArray();

    // get department name:
    const dep_name = await client.db(name_global_databases).collection('deps').findOne(
      {
        _id: user.dep
      }, // find all data
      {
        projection: {
          _id: 0,
          name: 1,
        }
      }
    );

    res.render("doankhoa-manage-departments", {
      header: "global-header",
      footer: "global-footer",
      thongbao: 'global-notifications',
      dep: dep_name.name, // every branch have same department
      branchs: branchs
    });
  });

  //  khoa danh sach bang diem 
  // app.get("/doan_khoa/khoadanhsachbangdiem", checkIfUserLoginRoute, async (req, res) => {
  //   const user = req.session.user;
  //   const school_year = await client.db(name_global_databases).collection('school_year').findOne(
  //     {},
  //     { projection: { _id: 0, year: 1 } }
  //   );
  //   // check user login:
  //   if (user.pow[1]) {
  //     const years = await client.db(name_global_databases).collection('classes').findOne(
  //       { _id: user.cls[0] },
  //       { projection: { _id: 0, years: 1 } }
  //     );

  //     // get all student in staff member class:
  //     let student_list = await client.db(name_global_databases).collection('user_info').find(
  //       { class: user.cls[0] },
  //       { projection: { first_name: 1, last_name: 1 } })
  //       .toArray();
  //     student_list = sortStudentName(student_list);

  //     // get all student total score from themself:
  //     let render = {
  //       header: "global-header",
  //       footer: "global-footer",
  //       thongbao: "global-notifications",
  //       staff_name: [],
  //       student_list: student_list,
  //       student_scores: [],
  //       staff_scores: [],
  //       department_scores: [],
  //       cls: user.cls,
  //       years: years.years,
  //       curr_year: school_year.year
  //     }

  //     for (student of student_list) {
  //       const curr_student_score = await client.db(user.dep)
  //         .collection(user.cls[0] + '_std_table')
  //         .findOne(
  //           {
  //             mssv: student._id,
  //             school_year: school_year.year
  //           },
  //           {
  //             projection: { total: 1 }
  //           }
  //         );
  //       const curr_staff_score = await client.db(user.dep)
  //         .collection(user.cls[0] + '_stf_table')
  //         .findOne(
  //           {
  //             mssv: student._id,
  //             school_year: school_year.year
  //           },
  //           {
  //             projection: {
  //               total: 1,
  //               marker: 1
  //             }
  //           }
  //         );
  //       const curr_department_score = await client.db(user.dep)
  //         .collection(user.cls[0] + '_dep_table')
  //         .findOne(
  //           {
  //             mssv: student._id,
  //             school_year: school_year.year
  //           },
  //           {
  //             projection: { total: 1 }
  //           }
  //         );
  //       // student
  //       if (curr_student_score) {
  //         render.student_scores.push(curr_student_score.total);
  //       } else {
  //         render.student_scores.push('-');
  //       }
  //       // staff member
  //       if (curr_staff_score) {
  //         render.staff_scores.push(curr_staff_score.total);
  //         render.staff_name.push(curr_staff_score.marker);
  //       } else {
  //         render.staff_scores.push('-');
  //         render.staff_name.push('-');
  //       }
  //       // department
  //       if (curr_department_score) {
  //         render.department_scores.push(curr_department_score.total);
  //       } else {
  //         render.department_scores.push('-');
  //       }
  //     }

  //     res.render("bancansu-grade-list", render);
  //   }
  //   else { // user not staff members 
  //     // redirect to home
  //     return res.redirect('/');
  //   }

  // });

  // quan li lop - doan khoa route
  app.get("/doan_khoa/quan_li_lop", checkIfUserLoginRoute, async (req, res) => {
    res.render("doankhoa-manage-classes", {
      header: "global-header",
      footer: "global-footer",
    });
  });

  //quan li co van - doan khoa route
  app.get("/doan_khoa/quan_li_cv", checkIfUserLoginRoute, async (req, res) => {
    try {
      // get all branch
      const all_branchs = await client.db(name_global_databases).collection('branchs').find(
        {},
        {
          projection: {
            name: 1
          }
        }
      ).toArray();

      // get user name and class
      const teachers = await client.db(name_global_databases).collection('user_info').find(
        { "power.4": { $exists: true } }, // user is teacher
        {
          projection: {
            first_name: 1,
            last_name: 1,
            class: 1,
            branch: 1
          }
        }
      ).toArray();

      let branch_list = [];
      for (let i = 0; i < teachers.length; i++) {
        const branch = await client.db(name_global_databases).collection('branchs').findOne(
          { _id: teachers[i].branch },
          {
            projection: {
              _id: 0,
              name: 1
            }
          }
        );
        branch_list.push(branch.name);
      }

      res.render("doankhoa-manage-teacher", {
        header: "global-header",
        footer: "global-footer",
        thongbao: "global-notifications",
        teachers: teachers,
        branchs: branch_list,
        all_branchs: all_branchs
      });
    }
    catch (err) {
      console.log(err);
    }
  });

  // Quan li hoat dong khoa route
  app.get("/doan_khoa/quan_li_hoat_dong_khoa", checkIfUserLoginRoute, async (req, res) => {
    res.render("doankhoa-manage-activities", {
      header: "global-header",
      footer: "global-footer",
    });
  });

  // danh sach sinh vien // ông đổi lại vụ class nha liên hệ NBM để biết thêm chi tiết
  app.get("/doan_khoa/danhsachsinhvien", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;
    if (user.pow[4] || user.pow[7]) {
      res.render("doankhoa-student-list", {
        header: "global-header",
        footer: "global-footer",
        thongbao: "global-notifications"
      });
    } else {
      return res.redirect('/');
    }
  });

  app.get("/doan_khoa/thoihan", checkIfUserLoginRoute, async (req, res) => {
    const curr_date = new Date();
    const school_year = await client.db(name_global_databases).collection('school_year').findOne(
      {},
      {
        projection: { year: 1, start_day: 1, end_day: 1 }
      });

    // set cbx text 
    let cbx = 'Đang diễn ra';
    if (school_year.start_day <= curr_date && (curr_date <= school_year.end_day || school_year.end_day.toISOString() == "2003-10-18T00:00:00.000Z")) {
      cbx = 'Đang diễn ra';
    } else if (school_year.start_day > curr_date) {
      cbx = 'Sắp diễn ra';
    } else if (curr_date > school_year.end_day) {
      cbx = 'Đã kết thúc';
    }

    // check if end day is foreverday or not 
    if (school_year.end_day.toISOString() == "2003-10-18T00:00:00.000Z") {
      school_year.end_day = undefined
    }

    res.render("doankhoa-time", {
      header: "global-header",
      thongbao: "global-notifications",
      footer: "global-footer",
      school_year: school_year,
      cbx: cbx
    })
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

          // get user class(cls), power and department(dep)
          const cls = await client.db(name_global_databases).collection('user_info').findOne(
            { _id: data.mssv },
            { projection: { _id: 0, class: 1, power: 1 } }
          );
          const branch = await client.db(name_global_databases).collection('classes').findOne(
            { _id: cls.class[0] },
            { projection: { _id: 0, branch: 1 } }
          );
          const dep = await client.db(name_global_databases).collection('branchs').findOne(
            { _id: branch.branch },
            { projection: { _id: 0, dep: 1 } }
          );

          user.cls = cls.class;
          user.pow = cls.power;
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

        // get user class(cls), power and department(dep)
        const cls = await client.db(name_global_databases).collection('user_info').findOne(
          { _id: data.mssv },
          { projection: { _id: 0, class: 1, power: 1 } }
        );
        const branch = await client.db(name_global_databases).collection('classes').findOne(
          { _id: cls.class[0] },
          { projection: { _id: 0, branch: 1 } }
        );
        const dep = await client.db(name_global_databases).collection('branchs').findOne(
          { _id: branch.branch },
          { projection: { _id: 0, dep: 1 } }
        );

        user.cls = cls.class;
        user.pow = cls.power;
        user.dep = dep.dep;
        // Đăng nhập thành công, lưu thông tin người dùng vào phiên
        req.session.user = user;
        // Kiểm tra xem người dùng có chọn "Remember me" không

        // Thiết lập thời gian sống cookie lại về mặc định (1 giờ)
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

  // Save table and update old table std------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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

  // Save table and update old table stf------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  app.post("/api/stf_mark", checkIfUserLoginAPI, async (req, res) => {
    if (user.pow[1]) {
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

        await mark("_stf_table", user, data, marker, user.cls[0]);

        res.sendStatus(200);
      } catch (err) {
        console.log("SYSTEM | MARK | ERROR | ", err);
        res.sendStatus(500);
      }
    } else {
      return res.redirect('/');
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
    const user = req.session.user;
    if(user.pow[4] || user.pow[7]){
      const fileStudents = req.file;
      function generateEmail(str) {
        let s1 = 'ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ'
        let s0 = 'AAAAEEEIIOOOOUUYaaaaeeeiioooouuyAaDdIiUuOoUuAaAaAaAaAaAaAaAaAaAaAaAaEeEeEeEeEeEeEeEeIiIiOoOoOoOoOoOoOoOoOoOoOoOoUuUuUuUuUuUuUuYyYyYyYy'
        let newStr = ''
        let listSpace = [];
        for (let i = 0; i < str.length; i++) {
          if (s1.indexOf(str[i]) != -1) {
            newStr += s0[s1.indexOf(str[i])]
          } else {
            newStr += str[i]
          }
          if (str[i] == ' ') {
            listSpace.push(i)
          }
        }
        let output = newStr[0]
        for (let i = 0; i < listSpace.length - 2; i++) {
          output += newStr.charAt(listSpace[i] + 1)
        }
        output += newStr.slice(listSpace[listSpace.length - 2] + 1).replace(/\s/g, "");
        return output.toLowerCase() + '@student.ctuet.edu.vn'
      }
      if (fileStudents) {
        try {
          // read excel file:
          // create all account
          const workbook = await XlsxPopulate.fromFileAsync(fileStudents.path);
          const sheet = workbook.sheet(0);
          const values = sheet.usedRange().value();
          let maxWidthEmail = 0;
          //[['MSSV', 'Họ', 'Tên' ]]
          sheet.cell('D1').value('Email');
          sheet.cell('E1').value('Password');
          for (let i = 1; i < values.length; i++) {
            let pw = await randomPassword()
            let email = generateEmail(`${values[i][1]} ${values[i][2]} ${values[i][0].toString()}`)
            let dataInsertUser = {
              _id: values[i][0].toString(),
              first_name: values[i][2],
              last_name: values[i][1],
              avt: "https://i.pinimg.com/236x/89/08/3b/89083bba40545a72fa15321af5fab760--chibi-girl-zero.jpg",
              power: { 0: true },
              class: [req.body.cls],
              displayName: `${values[i][1]} ${values[i][2]}`,
              email: email
            };
            let dataInsertLogin = {
              _id: values[i][0].toString(),
              password: pw
            }
            client.db('global').collection('user_info').updateOne({
              _id: dataInsertUser._id
            }, {
              $set: dataInsertUser
            },
              {
                upsert: true
              });
            client.db('global').collection('login_info').updateOne({
              _id: dataInsertLogin._id
            }, {
              $set: dataInsertLogin
            },
              {
                upsert: true
              });
            await sheet.cell(`D${i + 1}`).value(email);
            await sheet.cell(`E${i + 1}`).value(pw);
            const range = sheet.range(`D${i + 1}:E${i + 1}`);
            range.style({ border: true });
            if (email.length > maxWidthEmail) {
              maxWidthEmail = email.length
            }
          }
          // Write to file.
          sheet.column('D').width(maxWidthEmail);
          await workbook.toFileAsync(fileStudents.path);
          res.download(fileStudents.path);
          // xoa file sau khi xu ly
          setTimeout(() => {
            fs.unlink(fileStudents.path, (err) => {
              if (err) {
                console.error("Lỗi khi xóa tệp:", err);
              }
            });
          }, 2000)
        } catch (err) {
          console.log("SYSTEM | MARK | ERROR | ", err);
          res.sendStatus(500);
        }
      } else {
        // console.log('them 1 sinh vien');
        const dataStudent = req.body
        let pw = await randomPassword()
        let email = generateEmail(`${dataStudent['ho']} ${dataStudent['ten']} ${dataStudent['mssv'].toString()}`)
        let power
        if (dataStudent['vaitro'] == '1') {
          power = {
            0: true,
            1: true,
            3: true,
          }
        } else {
          power = {
            0: true,
            1: dataStudent['chamdiem'],
            3: dataStudent['lbhd'],
          }
        }
        let dataInsertUser = {
          _id: dataStudent['mssv'].toString(),
          first_name: dataStudent['ten'],
          last_name: dataStudent['ho'],
          avt: "https://i.pinimg.com/236x/89/08/3b/89083bba40545a72fa15321af5fab760--chibi-girl-zero.jpg",
          power: power,
          class: [dataStudent['cls']],
          displayName: `${dataStudent['ho']} ${dataStudent['ten']}`,
          email: email
        };
        let dataInsertLogin = {
          _id: dataStudent['mssv'].toString(),
          password: pw
        }
        client.db('global').collection('user_info').updateOne({
          _id: dataInsertUser._id
        }, {
          $set: dataInsertUser
        },
          {
            upsert: true
          });
        client.db('global').collection('login_info').updateOne({
          _id: dataInsertLogin._id
        }, {
          $set: dataInsertLogin
        },
          {
            upsert: true
          });
        // xu ly sau khi them sinh vien
        const uuid = uuidv4();
        const workbook = await XlsxPopulate.fromFileAsync("./src/excelTemplate/Tao_danh_sach_lop_moi.xlsx");
        const sheet = workbook.sheet(0);
        await sheet.cell(`A2`).value(dataStudent['mssv'].toString());
        await sheet.cell(`B2`).value(dataStudent['ho']);
        await sheet.cell(`C2`).value(dataStudent['ten']);
        await sheet.cell(`D1`).value('Email');
        await sheet.cell(`E1`).value('Password');
        await sheet.cell(`D2`).value(email);
        await sheet.cell(`E2`).value(pw);
        let range = sheet.range(`D2:E2`);
        range.style({ border: true });
        sheet.column('D').width(email.length);
        await workbook.toFileAsync(path.join('.downloads', uuid + ".xlsx"));
        res.download(path.join('.downloads', uuid + ".xlsx"));
        // xoa file sau khi xu ly
        setTimeout(() => {
          fs.unlink(path.join('.downloads', uuid + ".xlsx"), (err) => {
            if (err) {
              console.error("Lỗi khi xóa tệp:", err);
            }
          });
        }, 2000)
      }
  } else{
    res.send(403);
  }
  });
  app.get("/api/getTemplateAddStudent", upload.single('file'), checkIfUserLoginAPI, async (req, res) => {
    res.download("./src/excelTemplate/Tao_danh_sach_lop_moi.xlsx");
  });
  app.post("/api/deleteAccount", checkIfUserLoginAPI, async (req, res) => {
    const user = req.session.user;
    if(user.pow[4] || user.pow[7]){
      try {
        const listDelete = req.body.dataDelete;
        for (let i = 0; i < listDelete.length; i++) {
          client.db('global').collection('user_info').deleteOne({ _id: listDelete[i] })
          client.db('global').collection('login_info').deleteOne({ _id: listDelete[i] })
        }
        res.sendStatus(200);
      } catch (err) {
        console.log("SYSTEM | MARK | ERROR | ", err);
        res.sendStatus(500);
      }
  } else{
    res.send(403);
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

      // check for post data.cls if class define this mean they choose class so that must
      if (!cls) {
        cls = 0;
      };

      // check user login:
      if (user.pow[1]) {
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

      // check for post data.cls if class define this mean they choose class so that must
      if (!cls) {
        cls = 0;
      }

      if (user.pow[1]) {
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
        const std_table = await client.db(user.dep).collection(user.cls[parseInt(cls)] + '_std_table').findOne(
          {
            mssv: data.std_list[i],
            school_year: data.year
          }
        );

        // update old table if exist else insert new one
        // copy from student table and add marker name
        if (std_table) {
          std_table.marker = marker.last_name + " " + marker.first_name

          await client.db(user.dep).collection(user.cls[parseInt(cls)] + '_stf_table').updateOne(
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
    let reqClass = data.class
    // if (!reqClass) {
    //   reqClass = user.cls[0];
    // }
    if (reqClass) {

      if (user.pow[1]) {
        const student_list = await client.db(name_global_databases).collection('user_info').find(
          { class: reqClass },
          { projection: { first_name: 1, last_name: 1 } })
          .sort({ first_name: 1, last_name: 1 })
          .toArray();
        res.status(200).json(sortStudentName(student_list));
      } else {
        return res.redirect('/');
      }
    }
    else {
      res.sendStatus(404);
    }

  })

  app.get("/api/getuserscore", checkIfUserLoginAPI, async (req, res) => {
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
        return { year: year.slice(0, 3), total: studentTotalScore ? studentTotalScore.total : "Chưa có điểm" };
      }));
      res.status(200).json(studentTotalScores);
    } catch (err) {
      console.log("SYSTEM | LOAD_SCORE_LIST | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // api add or edit branch of department base on it exist or not
  app.post("/api/addOrEditBranchs", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {old_name: "Hệ thống thông tin", name: "Kỹ Thuật Phần Mềm"}

      // must be department to use this api
      if (user.pow[5]) {
        // remove old branch
        await client.db(name_global_databases).collection('branchs').deleteOne(
          {
            _id: createId(data.old_name),
          }
        )
        // add new branch
        await client.db(name_global_databases).collection('branchs').insertOne(
          {
            _id: createId(data.name),
            name: data.name,
            dep: user.dep
          }
        );

      } else {
        return res.redirect('/'); // back to home
      }

      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | ADD_OR_EDIT_BRANCHS | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // api delete cheked branchs
  app.post("/api/deleteBranchs", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {rm_bs: ["Kỹ Thuật Phần Mềm", ...]}

      // must be department to use this api
      if (user.pow[5]) {
        // remove all cheked branch in remove branchs líst
        for (let i = 0; i < data.rm_bs.length; i++) {
          await client.db(name_global_databases).collection('branchs').deleteOne(
            {
              _id: createId(data.rm_bs[i]),
            }
          )
        }
      } else {
        return res.redirect('/'); // back to home
      }

      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | DELETE_BRANCHS | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // change mark deadline
  app.post("/api/changeDeadLine", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {sch_y: "HK1_2022-2023", start_day: '18/10/2023', end_day: '19/11/999999999999999999']}

      // set end day to special date if it is ''
      if (!data.end_day) {
        data.end_day = '2003-10-18'; // special date
      }
      // must be department to use this api
      if (user.pow[6]) {
        await client.db(name_global_databases).collection('school_year').updateOne(
          {},
          {
            $set: {
              year: data.sch_y,
              start_day: new Date(data.start_day), // change string to Date
              end_day: new Date(data.end_day),
            }
          }
        );
      } else {
        return res.redirect('/'); // back to home
      }

      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | CHANGE_DEADLINE | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // api add or edit teacher of department base on it exist or not
  app.post("/api/addOrEditTeachers", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {old_id: "19112003", new_id: "18102003", new_name: "Nguyễn Văn A", branch: "KTPM"}

      // must be department to use this api
      if (user.pow[8]) {
        // find to get old pass ò teacher before remove it
        const teacher_pass = await client.db(name_global_databases).collection('login_info').findOne(
          {
            _id: data.old_id,
          },
          {
            projection: {
              password: 1
            }
          }
        )
        // remove old teachers
        await client.db(name_global_databases).collection('user_info').deleteOne(
          {
            _id: data.old_id,
          }
        )
        await client.db(name_global_databases).collection('login_info').deleteOne(
          {
            _id: data.old_id,
          }
        )
        // add new teachers
        await client.db(name_global_databases).collection('user_info').insertOne(
          {
            _id: data.new_id,
            first_name: data.new_name.split(' ').slice(0, -1).join(' '),
            last_name: data.new_name.split(' ').slice(-1).join(' '),
            avt: "",
            power: {
              "4": true,
              // tất cả các quyền của giáo viên
            },
            class: [],
            displayName: data.new_name, // here before pop
            branch: data.branch,
            email: "",
          }
        );
        await client.db(name_global_databases).collection('login_info').insertOne(
          {
            _id: data.new_id,
            password: teacher_pass.password
          }
        )

      } else {
        return res.redirect('/'); // back to home
      }

      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | ADD_OR_EDIT_BRANCHS | ERROR | ", err);
      res.sendStatus(500);
    }
  });

  // api delete teachers checked
  app.post("/api/deleteTeachers", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {rm_ts: ["19112003" (teacher_id), ...]}

      // must be department to use this api
      if (user.pow[8]) {
        // remove all cheked branch in remove branchs líst
        await client.db(name_global_databases).collection('user_info').deleteMany(
          {
            _id: { $in: data.rm_ts },
          }
        );
      } else {
        return res.redirect('/'); // back to home
      }

      res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | DELETE_BRANCHS | ERROR | ", err);
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
