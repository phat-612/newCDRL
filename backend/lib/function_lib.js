const server = require("./csdl_google_lib");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const { getClient, getNameGlobal } = require('./mogodb_lib');
const client = getClient();
const name_global_databases = getNameGlobal();
const path = require("path");

// ------------------------------------------------------------------------------------------------
async function sendEmail(password, email) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nguytuan04@gmail.com",
        pass: "unjwfrdskgezbmym",
      },
    });

    const emailTXT = fs.readFileSync(path.join("src", "emailTemplate", "email.txt"), "utf8");
    const emailHTML = fs.readFileSync(path.join("src", "emailTemplate", "email.ejs"), "utf8");

    const mailOptions = {
      from: '"Quản lý điểm rèn luyện" <nguytuan04@gmail.com>',
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu",
      text: emailTXT.replace("${password}", password),
      html: ejs.render(emailHTML, { password: password }),
      attachments: [
        {
          filename: "image.png",
          path: "./src/img/sv_logo_dashboard.png",
          cid: "fs1120020a17090af28b00b00263fc1ef1aasm843048pjb10", //same cid value as in the html img src
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log(`SYSTEM | SEND_EMAIL | ${info.response}`);
    // Thực hiện các hoạt động hữu ích khác sau khi gửi email thành công.
  } catch (error) {
    console.log("SYSTEM | SEND_EMAIL | ", error);
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
    const hslink = ["/hocsinh/nhapdiemdanhgia"];
    const gvlink = [
      "/giaovien/quanlyquyen",
      "/giaovien/nhapdiemdanhgia",
      "/giaovien/danhsachbangdiem",
    ];
    const stf = [
      "/bancansu/nhapdiemdanhgia",
      "/bancansu/quanlihoatdong",
      "/bancansu/quanlihoatdong/danhgiahoatdong",
      "/bancansu/danhsachbangdiem",
    ];
    const dep = [
      "/doankhoa/quanlibomon",
      "/doankhoa/quanlilop",
      "/doankhoa/danhsachbangdiem",
      "/doankhoa/quanlicv",
      "/doankhoa/quanlihoatdongkhoa",
      "/doankhoa/danhsachsinhvien",
      "/doankhoa/nhapdiemdanhgia",
      "/doankhoa/thoihan",
    ];
    const fullPath = req.baseUrl+req.path;
    if (hslink.includes(fullPath)) {
      if (!user.pow[0]) {
        return res.redirect("/");
      }
    }
    if (gvlink.includes(fullPath)) {
      if (!user.pow[1] && !user.pow[4]) {
        return res.redirect("/");
      }
    }
    if (stf.includes(fullPath)) {
      if (!user.pow[0] && (!user.pow[1] || !user.pow[3])) {
        return res.redirect("/");
      }
    }
    if (dep.includes(fullPath)) {
      if (!user.pow[8]) {
        return res.redirect("/");
      }
    }
    if ((user.pow[1] && user.pow[4]) || user.pow[8]) {
      res.locals.isnotST = true;
    }
    if (user.first == "new_user") {
      return res.redirect("/login/firstlogin");
    } else if (user.first == "otp") {
      return res.redirect("/login/firstlogin?tile=ok");
    } else {
      const user_info = await client
        .db(name_global_databases)
        .collection("user_info")
        .findOne({ _id: user._id }, { projection: { _id: 0, avt: 1, displayName: 1 } });
      res.locals.avt = user_info.avt;
      res.locals.displayName = user_info.displayName;
    }
    next();
  }
}

async function mark(table, user, mssv, data, marker, cls) {
  // data = {
  //   first: [],
  //   second: [],
  //   third: [],
  //   fourth: [],
  //   fifth: [],
  //   img_ids: [],
  //   total: 100,
  // }

  const school_year = await client
    .db(name_global_databases)
    .collection("school_year")
    .findOne(
      {},
      {
        projection: {
          _id: 0,
          year: 1,
          start_day: 1,
          end_day: 1,
        },
      }
    );
  let today = new Date().getTime();
  let start_day = new Date(school_year.start_day).getTime();
  let end_day = new Date(school_year.end_day).getTime();
  let forever_day = new Date("2003-10-18").getTime(); // special date

  // check if end mark time or not
  if (start_day <= today && (today < end_day || end_day == forever_day)) {
    // update old table if exist or insert new table
    let update = {
      mssv: mssv,
      school_year: school_year.year,
      first: data.first,
      second: data.second,
      third: data.third,
      fourth: data.fourth,
      fifth: data.fifth,
      img_ids: data.img_ids,
      total: data.total,
      update_date: new Date(),
    };

    // if table is stf_table - mark by staff members or teacher
    if (table == "_stf_table") {
      update.marker = marker.last_name + " " + marker.first_name;
    }

    await client
      .db(user.dep)
      .collection(cls + table)
      .updateOne(
        {
          mssv: mssv,
          school_year: school_year.year,
        },
        {
          $set: update,
        },
        { upsert: true }
      );
  }
}

async function get_full_id(directoryPath, listName, listdep) {
  let list_id = [];
  try {
    // Đọc các file trong thư mục một cách đồng bộ
    for (let i = 0; i < listName.length; i++) {
      list_id.push(
        await server.uploadFileToDrive(path.join(directoryPath, listName[i]), listdep[i])
      );
    }
    return list_id;
  } catch (err) {
    console.error("SYSTEM | GET_ID | ERR | ", err);
  }
}

const blockUnwantedPaths = (req, res, next) => {
  // cai díu j day @rurimeiko làm lại đi // cái block user truy cập file
  const unwantedPaths = [
    "/.vscode/",
    "/backend/",
    "/node_modules/",
    "/views/",
    "package-lock.json",
    "package.json",
    "README.md",
  ];
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
      console.error("Error deleting file:", err);
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
    const lastFirstNameWordA = a.first_name.split(" ").pop();
    const lastFirstNameWordB = b.first_name.split(" ").pop();

    const firstNameComparison = lastFirstNameWordA.localeCompare(lastFirstNameWordB, "vi", {
      sensitivity: "base",
    });
    if (firstNameComparison !== 0) {
      return firstNameComparison;
    }

    return a.last_name.localeCompare(b.last_name, "vi", {
      sensitivity: "base",
    });
  });
  return std_list;
}

// Function to create id for string (get all start letter of words and cobine together)
function createId(str) {
  let arr = str.toUpperCase().trim().split(" ");
  let id = "";
  for (let i of arr) {
    id += i.charAt(0);
  }
  return id;
}

module.exports = {
  sendEmail,
  checkIfUserLoginAPI,
  checkIfUserLoginRoute,
  get_full_id,
  blockUnwantedPaths,
  mark,
  randomPassword,
  scheduleFileDeletion,
  sortStudentName,
  createId,
};
