const server = require("./csdl_google_lib");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const { getClient, getNameGlobal } = require("./mogodb_lib");
const client = getClient();
const name_global_databases = getNameGlobal();
const path = require("path");
const archiver = require("archiver");
const { v4: uuidv4 } = require("uuid");
const PdfPrinter = require("pdfmake");
const util = require("util");
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
    const fullPath = req.baseUrl + req.path;
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
    if (user.pow[0] && !user.pow[1]) {
      res.locals.iskhoa = false;
      res.locals.isbancansu = false;
      res.locals.isgiaovien = false;
      res.locals.isST = true;
    } else if (user.pow[1] && user.pow[3] && !user.pow[4]) {
      res.locals.iskhoa = false;
      res.locals.isbancansu = true;
      res.locals.isgiaovien = false;
      res.locals.isST = false;
    } else if (user.pow[1] && user.pow[3] && user.pow[4]) {
      res.locals.iskhoa = false;
      res.locals.isbancansu = false;
      res.locals.isgiaovien = true;
      res.locals.isST = false;
    } else if (user.pow[8]) {
      res.locals.iskhoa = true;
      res.locals.isbancansu = false;
      res.locals.isgiaovien = false;
      res.locals.isST = false;
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
      [`img_ids.global`]: data.img_ids,
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
      .createIndex(
        {
          mssv: 1,
        },
        {
          name: "_mssv",
        }
      );

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

    updateStudentTotalScore(
      table,
      school_year.year,
      mssv,
      data.total,
      marker.last_name + " " + marker.first_name
    );
  }
}

async function updateStudentTotalScore(table, school_year, mssv, total, marker) {
  // update total score list for student
  switch (table) {
    case "_std_table":
      await client
        .db(name_global_databases)
        .collection("user_info")
        .updateOne(
          {
            _id: mssv,
          },
          {
            $set: {
              [`total_score.${school_year}.std`]: total,
            },
          },
          {
            upsert: true,
          }
        );
      break;
    case "_stf_table":
      await client
        .db(name_global_databases)
        .collection("user_info")
        .updateOne(
          {
            _id: mssv,
          },
          {
            $set: {
              [`total_score.${school_year}.stf`]: total,
              [`total_score.${school_year}.marker`]: marker,
            },
          },
          {
            upsert: true,
          }
        );
      break;
    case "_dep_table":
      await client
        .db(name_global_databases)
        .collection("user_info")
        .updateOne(
          {
            _id: mssv,
          },
          {
            $set: {
              [`total_score.${school_year}.dep`]: total,
            },
          },
          {
            upsert: true,
          }
        );
      break;
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
  if (std_list) {
    std_list.sort((a, b) => {
      if (a && b) {
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
      } else {
        return std_list;
      }
    });
    return std_list;
  } else {
    return std_list;
  }
}

// xoá class
async function deleteClassApi(data, user) {
  // console.log(data);
  for (let i = 0; i < data.rm_cls.length; i++) {
    await client
      .db(name_global_databases)
      .collection("classes")
      .deleteMany({ _id: data.rm_cls[i] });
    const collections = await client.db(user.dep).listCollections().toArray();

    // Lặp qua từng collection và xoá nếu tên bắt đầu bằng "lớp"
    for (const collection of collections) {
      if (collection.name.startsWith(data.rm_cls[i])) {
        await client.db(user.dep).collection(collection.name).drop();
        // console.log(`Đã xoá collection: ${collection.name}`);
      }
    }
    // xoá học sinh đang thuộc class bên user_info (chuyển sang ghost account)
    await client
      .db(name_global_databases)
      .collection("user_info")
      .deleteMany({
        class: [data.rm_cls[i]],
        "power.0": { $exists: true },
      });
    // xoa lop khoi giao vien
    await client
      .db(name_global_databases)
      .collection("user_info")
      .updateMany(
        {
          _id: data.rm_ts[i],
          "power.1": { $exists: true },
          "power.4": { $exists: true },
        },
        {
          $pull: { class: data.rm_cls[i] },
        }
      );
  }
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

async function createPdf(path_save, scorce) {
  function sum(arr, start, end) {
    if (arr[0] == "N/A") {
      return "N/A";
    }
    // Đảm bảo start và end không vượt qua giới hạn của mảng
    if (start < 0) start = 0;
    if (end >= arr.length) end = arr.length - 1;

    // Kiểm tra nếu start lớn hơn end hoặc mảng rỗng
    if (start > end || arr.length === 0) return 0;

    // Sử dụng slice và reduce để tính tổng
    const subArray = arr.slice(start, end + 1);
    const total = subArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return total;
  }
  let name_zip;
  let output;
  let archive;
  if (scorce.length > 1) {
    name_zip = uuidv4();
    output = fs.createWriteStream(path.join(path_save, name_zip + ".zip"));
    archive = archiver("zip", {
      zlib: { level: 2 }, // Mức nén, có thể là 0-9 (9 là mức nén cao nhất)
    });
    if (!fs.existsSync(path.join(path_save, name_zip))) {
      // Nếu thư mục không tồn tại, tạo thư mục mới
      fs.mkdirSync(path.join(path_save, name_zip));
    }
  }
  const createPdfAsync = util.promisify((printer, pdfDoc, outputPath, callback) => {
    pdfDoc.pipe(fs.createWriteStream(outputPath));
    pdfDoc.end();
    pdfDoc.on("end", () => {
      callback();
    });
  });
  for (let index = 0; index < scorce.length; index++) {
    // Define font files
    const std_score = scorce[index].std;
    const stf_score = scorce[index].stf;
    const dep_score = scorce[index].dep;
    let namefile;
    if (scorce.length > 1) {
      namefile = scorce[index].name + "-" + scorce[index].mssv + ".pdf";
    } else {
      namefile = uuidv4() + ".pdf";
    }
    const fonts = {
      Roboto: {
        normal: "backend/font/Roboto-Regular.ttf",
        bold: "backend/font/Roboto-Medium.ttf",
        italics: "backend/font/Roboto-Italic.ttf",
        bolditalics: "backend/font/Roboto-MediumItalic.ttf",
      },
    };
    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
        { text: "Bảng điểm cá nhân", style: "header" },
        {
          columns: [{ text: "Tên:", bold: true }, scorce[index].name],
        },
        {
          columns: [{ text: "MSSV:", bold: true }, scorce[index].mssv],
        },
        {
          columns: [{ text: "Lớp:", bold: true }, scorce[index].class],
        },
        {
          columns: [{ text: "Học kỳ:", bold: true }, scorce[index].year],
        },

        // 		{text: 'Defining column widths', style: 'subheader'},
        // 		'Tables support the same width definitions as standard columns:',
        {
          style: "tableExample",
          table: {
            widths: [230, "*", "*", "*", "*"],
            body: [
              [
                { text: "Nội Dung Đánh Giá", style: "tableHeader" },
                { text: "Điểm Tối Đa", style: "tableHeader" },
                { text: "Điểm SV Tự Đánh Giá", style: "tableHeader" },
                { text: "Tập Thể Lớp", style: "tableHeader" },
                { text: "Khoa Đánh Giá", style: "tableHeader" },
              ],
              [{ text: "1. Đánh giá về ý thức học tập", style: "tableSubHeader" }, "", "", "", ""],
              [
                {
                  text: "a. Ý thức, thái độ trong học tập.\n(Nghỉ học 1 buổi không phép trừ 1 điểm; đi muộn hoặc bỏ tiết mỗi 3 lần trừ 1 điểm)",
                  style: "tableSubSubHeader",
                },
                { text: "7 điểm", style: "tablepoint" },
                { text: `${std_score[0]} điểm`, style: "tablepoint" },
                { text: `${stf_score[0]} điểm`, style: "tablepoint" },
                { text: `${dep_score[0]} điểm`, style: "tablepoint" },
              ],
              [
                {
                  text: "b. Tham gia các câu lạc bộ học thuật; các hoạt động học thuật; hoạt động ngoại khóa; hoạt động nghiên cứu khoa học",
                  style: "tableSubSubHeader",
                },
                { text: "2 điểm", style: "tablepoint" },
                { text: `${std_score[1]} điểm`, style: "tablepoint" },
                { text: `${stf_score[1]} điểm`, style: "tablepoint" },
                { text: `${dep_score[1]} điểm`, style: "tablepoint" },
              ],
              [
                {
                  text: "c. Ý thức thực hiện tốt quy chế khi tham gia các kỳ thi, cuộc thi",
                  style: "tableSubSubHeader",
                },
                { text: "4 điểm", style: "tablepoint" },
                { text: `${std_score[2]} điểm`, style: "tablepoint" },
                { text: `${stf_score[2]} điểm`, style: "tablepoint" },
                { text: `${dep_score[2]} điểm`, style: "tablepoint" },
              ],
              [
                { text: "- Bị nhắc nhở khi thi, kiểm tra", style: "tableSubSubSubHeader" },
                { text: "2 điểm", style: "tablepoint" },
                { text: std_score[2] == 2 ? "•" : "", style: "tablepoint" },
                { text: stf_score[2] == 2 ? "•" : "", style: "tablepoint" },
                { text: dep_score[2] == 2 ? "•" : "", style: "tablepoint" },
              ],
              [
                {
                  text: "- Bị lập biên bản xử lý khi thi và kiểm tra",
                  style: "tableSubSubSubHeader",
                },
                { text: "0 điểm", style: "tablepoint" },
                { text: std_score[2] == 0 ? "•" : "", style: "tablepoint" },
                { text: stf_score[2] == 0 ? "•" : "", style: "tablepoint" },
                { text: dep_score[2] == 0 ? "•" : "", style: "tablepoint" },
              ],
              [
                {
                  text: "d. Có tinh thần vượt khó, phấn đấu vươn lên trong học tập",
                  style: "tableSubSubHeader",
                },
                { text: "2 điểm", style: "tablepoint" },
                { text: `${std_score[3]} điểm`, style: "tablepoint" },
                { text: `${stf_score[3]} điểm`, style: "tablepoint" },
                { text: `${dep_score[3]} điểm`, style: "tablepoint" },
              ],
              [
                { text: "đ. Đạt kết quả cao trong học tập", style: "tableSubSubHeader" },
                { text: "5 điểm", style: "tablepoint" },
                { text: `${std_score[4]} điểm`, style: "tablepoint" },
                { text: `${stf_score[4]} điểm`, style: "tablepoint" },
                { text: `${dep_score[4]} điểm`, style: "tablepoint" },
              ],

              [
                {
                  text: "- Loại Trung bình: Điểm số từ 2.0 đến 2.49",
                  style: "tableSubSubSubHeader",
                },
                { text: "2 điểm", style: "tablepoint" },
                { text: std_score[4] == 2 ? "•" : "", style: "tablepoint" },
                { text: stf_score[4] == 2 ? "•" : "", style: "tablepoint" },
                { text: dep_score[4] == 2 ? "•" : "", style: "tablepoint" },
              ],

              [
                { text: "- Loại Khá: Điểm số từ 2.5 đến 3.19", style: "tableSubSubSubHeader" },
                { text: "3 điểm", style: "tablepoint" },
                { text: std_score[4] == 3 ? "•" : "", style: "tablepoint" },
                { text: stf_score[4] == 3 ? "•" : "", style: "tablepoint" },
                { text: dep_score[4] == 3 ? "•" : "", style: "tablepoint" },
              ],

              [
                { text: "- Loại Giỏi: Điểm số từ 3.2 đến 3.59", style: "tableSubSubSubHeader" },
                { text: "4 điểm", style: "tablepoint" },
                { text: std_score[4] == 4 ? "•" : "", style: "tablepoint" },
                { text: stf_score[4] == 4 ? "•" : "", style: "tablepoint" },
                { text: dep_score[4] == 4 ? "•" : "", style: "tablepoint" },
              ],
              [
                { text: "- Loại Xuất sắc: Điểm số từ 3.6 đến 4.0", style: "tableSubSubSubHeader" },
                { text: "5 điểm", style: "tablepoint" },
                { text: std_score[4] == 5 ? "•" : "", style: "tablepoint" },
                { text: stf_score[4] == 5 ? "•" : "", style: "tablepoint" },
                { text: dep_score[4] == 5 ? "•" : "", style: "tablepoint" },
              ],
              [
                { text: "Điểm tối đa nội dung 1 là", style: "tableSubHeaderTotal" },
                { text: "20 điểm", style: "tableSubPointTotal" },
                { text: `${sum(std_score, 0, 4)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(stf_score, 0, 4)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(dep_score, 0, 4)} điểm`, style: "tableSubPointTotal" },
              ],
              [
                {
                  text: "2. Đánh giá về ý thức và kết quả chấp hành nội quy, quy chế, quy định trong nhà trường",
                  style: "tableSubHeader",
                },
                "",
                "",
                "",
                "",
              ],
              [
                {
                  text: "a. Ý thức chấp hành các văn bản chỉ đạo của ngành, của cơ quan chỉ đạo cấp trên được thực hiện trong nhà trường.",
                  style: "tableSubSubHeader",
                },
                { text: "15 điểm", style: "tablepoint" },
                { text: `${std_score[5]} điểm`, style: "tablepoint" },
                { text: `${stf_score[5]} điểm`, style: "tablepoint" },
                { text: `${dep_score[5]} điểm`, style: "tablepoint" },
              ],
              [
                { text: "- Bị nhắc nhở trong việc thực hiện", style: "tableSubSubSubHeader" },
                { text: "10 điểm", style: "tablepoint" },
                { text: std_score[5] == 10 ? "•" : "", style: "tablepoint" },
                { text: stf_score[5] == 10 ? "•" : "", style: "tablepoint" },
                { text: dep_score[5] == 10 ? "•" : "", style: "tablepoint" },
              ],
              [
                {
                  text: "- Bị xử lý kỷ luật từ mức khiển trách trở lên",
                  style: "tableSubSubSubHeader",
                },
                { text: "0 điểm", style: "tablepoint" },
                { text: std_score[5] == 0 ? "•" : "", style: "tablepoint" },
                { text: stf_score[5] == 0 ? "•" : "", style: "tablepoint" },
                { text: dep_score[5] == 0 ? "•" : "", style: "tablepoint" },
              ],

              [
                {
                  text: "b. Ý thức chấp hành tốt, đầy đủ các nội quy, quy chế và các quy định khác của nhà trường",
                  style: "tableSubSubHeader",
                },
                { text: "10 điểm", style: "tablepoint" },
                { text: `${std_score[6]} điểm`, style: "tablepoint" },
                { text: `${stf_score[6]} điểm`, style: "tablepoint" },
                { text: `${dep_score[6]} điểm`, style: "tablepoint" },
              ],
              [
                { text: "- Bị nhắc nhở trong việc thực hiện", style: "tableSubSubSubHeader" },
                { text: "5 điểm", style: "tablepoint" },
                { text: std_score[6] == 5 ? "•" : "", style: "tablepoint" },
                { text: stf_score[6] == 5 ? "•" : "", style: "tablepoint" },
                { text: dep_score[6] == 5 ? "•" : "", style: "tablepoint" },
              ],
              [
                {
                  text: "- Bị xử lý kỷ luật từ mức khiển trách trở lên",
                  style: "tableSubSubSubHeader",
                },
                { text: "0 điểm", style: "tablepoint" },
                { text: std_score[6] == 0 ? "•" : "", style: "tablepoint" },
                { text: stf_score[6] == 0 ? "•" : "", style: "tablepoint" },
                { text: dep_score[6] == 0 ? "•" : "", style: "tablepoint" },
              ],
              [
                { text: "Điểm tối đa nội dung 2 là", style: "tableSubHeaderTotal" },
                { text: "25 điểm", style: "tableSubPointTotal" },
                { text: `${sum(std_score, 5, 6)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(stf_score, 5, 6)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(dep_score, 5, 6)} điểm`, style: "tableSubPointTotal" },
              ],

              //////////////
              [
                {
                  text: "3. Đánh giá về ý thức và kết quả tham gia các hoạt động chính trị, xã hội, văn hoá, văn nghệ, thể thao, phòng chống tội phạm và các tệ nạn xã hội",
                  style: "tableSubHeader",
                },
                "",
                "",
                "",
                "",
              ],
              [
                {
                  text: "a. Tham gia tích cực các hoạt động chính trị, xã hội, văn hoá, văn nghệ, thể thao và có sự trưởng thành của bản thân qua các hoạt động rèn luyện:",
                  style: "tableSubSubHeader",
                },
                { text: "8 điểm", style: "tablepoint" },
                { text: `${std_score[7]} điểm`, style: "tablepoint" },
                { text: `${stf_score[7]} điểm`, style: "tablepoint" },
                { text: `${dep_score[7]} điểm`, style: "tablepoint" },
              ],
              [
                {
                  text: "- Tích cực tham gia các hoạt động chính trị, xã hội, văn hoá, văn nghệ, thể thao",
                  style: "tableSubSubSubHeader",
                },
                { text: "5 điểm", style: "tablepoint" },
                { text: std_score[7] == 5 ? "•" : "", style: "tablepoint" },
                { text: stf_score[7] == 5 ? "•" : "", style: "tablepoint" },
                { text: dep_score[7] == 5 ? "•" : "", style: "tablepoint" },
              ],
              [
                {
                  text: "- Được kết nạp Đảng hoặc đạt danh hiệu Đoàn viên ưu tú hoặc đạt giải Nhất, Nhì, Ba trong các hoạt động chính trị, văn hóa, thể thao từ cấp trường trở lên",
                  style: "tableSubSubSubHeader",
                },
                { text: "8 điểm", style: "tablepoint" },
                { text: std_score[7] == 8 ? "•" : "", style: "tablepoint" },
                { text: stf_score[7] == 8 ? "•" : "", style: "tablepoint" },
                { text: dep_score[7] == 8 ? "•" : "", style: "tablepoint" },
              ],

              [
                {
                  text: "b. Tích cực tham gia các hoạt động công ích, tình nguyện, công tác xã hội",
                  style: "tableSubSubHeader",
                },
                { text: "6 điểm", style: "tablepoint" },
                { text: `${std_score[8]} điểm`, style: "tablepoint" },
                { text: `${stf_score[8]} điểm`, style: "tablepoint" },
                { text: `${dep_score[8]} điểm`, style: "tablepoint" },
              ],
              [
                {
                  text: "c. Tham gia tuyên truyền, phòng chống tội phạm, các tệ nạn xã hội và các hoạt động khác do lớp, khoa, trường, các đoàn thể, địa phương tổ chức",
                  style: "tableSubSubHeader",
                },
                { text: "6 điểm", style: "tablepoint" },
                { text: `${std_score[9]} điểm`, style: "tablepoint" },
                { text: `${stf_score[9]} điểm`, style: "tablepoint" },
                { text: `${dep_score[9]} điểm`, style: "tablepoint" },
              ],

              [
                { text: "Điểm tối đa nội dung 3 là", style: "tableSubHeaderTotal" },
                { text: "20 điểm", style: "tableSubPointTotal" },
                { text: `${sum(std_score, 7, 9)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(stf_score, 7, 9)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(dep_score, 7, 9)} điểm`, style: "tableSubPointTotal" },
              ],
              //////////
              [
                {
                  text: "4. Đánh giá về ý thức công dân trong quan hệ cộng đồng",
                  style: "tableSubHeader",
                },
                "",
                "",
                "",
                "",
              ],
              [
                {
                  text: "a. Chấp hành và tham gia tuyên truyền các chủ trương của Đảng, chính sách, pháp luật của Nhà nước tại nơi cư trú",
                  style: "tableSubSubHeader",
                },
                { text: "10 điểm", style: "tablepoint" },
                { text: `${std_score[10]} điểm`, style: "tablepoint" },
                { text: `${stf_score[10]} điểm`, style: "tablepoint" },
                { text: `${dep_score[10]} điểm`, style: "tablepoint" },
              ],

              [
                {
                  text: "b. Được ghi nhận, biểu dương, khen thưởng về tham gia các hoạt động xã hội",
                  style: "tableSubSubHeader",
                },
                { text: "5 điểm", style: "tablepoint" },
                { text: `${std_score[11]} điểm`, style: "tablepoint" },
                { text: `${stf_score[11]} điểm`, style: "tablepoint" },
                { text: `${dep_score[11]} điểm`, style: "tablepoint" },
              ],
              [
                {
                  text: "c. Có tinh thần chia sẻ, giúp đỡ bạn bè, người thân, người có hoàn cảnh khó khăn, hoạn nạn.",
                  style: "tableSubSubHeader",
                },
                { text: "10 điểm", style: "tablepoint" },
                { text: `${std_score[12]} điểm`, style: "tablepoint" },
                { text: `${stf_score[12]} điểm`, style: "tablepoint" },
                { text: `${dep_score[12]} điểm`, style: "tablepoint" },
              ],

              [
                { text: "Điểm tối đa nội dung 4 là", style: "tableSubHeaderTotal" },
                { text: "25 điểm", style: "tableSubPointTotal" },
                { text: `${sum(std_score, 10, 12)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(stf_score, 10, 12)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(dep_score, 10, 12)} điểm`, style: "tableSubPointTotal" },
              ],
              ////////
              [
                {
                  text: "5. Đánh giá về ý thức và kết quả tham gia công tác phụ trách lớp, các đoàn thể, tổ chức trong nhà trường hoặc đạt được thành tích đặc biệt trong học tập, rèn luyện của học sinh, sinh viên",
                  style: "tableSubHeader",
                },
                "",
                "",
                "",
                "",
              ],
              [
                {
                  text: "a. Tham gia tích cực vào phong trào của Lớp, Đoàn, Hội sinh viên và các công tác đoàn thể xã hội khác",
                  style: "tableSubSubHeader",
                },
                { text: "3 điểm", style: "tablepoint" },
                { text: `${std_score[13]} điểm`, style: "tablepoint" },
                { text: `${stf_score[13]} điểm`, style: "tablepoint" },
                { text: `${dep_score[13]} điểm`, style: "tablepoint" },
              ],

              [
                {
                  text: "b. Phát huy vai trò và hoàn thành tốt nhiệm vụ người cán bộ Chi đoàn, Lớp, Câu lạc bộ, Đội tự quản",
                  style: "tableSubSubHeader",
                },
                { text: "3 điểm", style: "tablepoint" },
                { text: `${std_score[14]} điểm`, style: "tablepoint" },
                { text: `${stf_score[14]} điểm`, style: "tablepoint" },
                { text: `${dep_score[14]} điểm`, style: "tablepoint" },
              ],
              [
                {
                  text: "c. Đảm nhiệm, đóng góp có hiệu quả cho công tác Đoàn trường, Hội sinh viên, Liên chi đoàn, Đội tự quản, Câu lạc bộ",
                  style: "tableSubSubHeader",
                },
                { text: "2 điểm", style: "tablepoint" },
                { text: `${std_score[15]} điểm`, style: "tablepoint" },
                { text: `${stf_score[15]} điểm`, style: "tablepoint" },
                { text: `${dep_score[15]} điểm`, style: "tablepoint" },
              ],
              [
                {
                  text: "d. Được biểu dương, khen thưởng vì có thành tích đặc biệt trong học tập, rèn luyện và các hoạt động khác",
                  style: "tableSubSubHeader",
                },
                { text: "2 điểm", style: "tablepoint" },
                { text: `${std_score[16]} điểm`, style: "tablepoint" },
                { text: `${stf_score[16]} điểm`, style: "tablepoint" },
                { text: `${dep_score[16]} điểm`, style: "tablepoint" },
              ],

              [
                { text: "- Cấp khoa", style: "tableSubSubSubHeader" },
                { text: "1 điểm", style: "tablepoint" },
                { text: std_score[16] == 1 ? "•" : "", style: "tablepoint" },
                { text: stf_score[16] == 1 ? "•" : "", style: "tablepoint" },
                { text: dep_score[16] == 1 ? "•" : "", style: "tablepoint" },
              ],
              [
                { text: "- Cấp trường trở lên", style: "tableSubSubSubHeader" },
                { text: "2 điểm", style: "tablepoint" },
                { text: std_score[16] == 2 ? "•" : "", style: "tablepoint" },
                { text: stf_score[16] == 2 ? "•" : "", style: "tablepoint" },
                { text: dep_score[16] == 2 ? "•" : "", style: "tablepoint" },
              ],

              [
                { text: "Điểm tối đa nội dung 5 là", style: "tableSubHeaderTotal" },
                { text: "10 điểm", style: "tableSubPointTotal" },
                { text: `${sum(std_score, 13, 16)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(stf_score, 13, 16)} điểm`, style: "tableSubPointTotal" },
                { text: `${sum(dep_score, 13, 16)} điểm`, style: "tableSubPointTotal" },
              ],
              [
                { text: "Tổng điểm tối đa", style: "tableSubHeaderTotal" },
                { text: "100 điểm", style: "tableSubPointTotal" },
                { text: `${std_score[17]} điểm`, style: "tableSubPointTotal" },
                { text: `${stf_score[17]} điểm`, style: "tableSubPointTotal" },
                { text: `${dep_score[17]} điểm`, style: "tableSubPointTotal" },
              ],
            ],
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              if (rowIndex === 0) {
                // Màu cho hàng đầu tiên
                return "#9fe6ff"; // Ví dụ: Màu đỏ
              } else {
                // Màu cho các hàng còn lại
                return rowIndex % 2 === 0 ? "#e6e6e6" : null;
              }
            },
          },
        },
        { text: "Ký tên", style: "subheader", alignment: "right", margin: [0, 0, 50, 0] },
      ],
      styles: {
        header: {
          fontSize: 21,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
          alignment: "center",
        },
        tableSubHeader: {
          bold: true,
          fontSize: 12,
          color: "black",
        },
        tableSubHeaderTotal: {
          bold: true,
          fontSize: 12,
          color: "red",
        },
        tableSubPointTotal: {
          bold: true,
          fontSize: 12,
          color: "red",
          alignment: "center",
        },
        tableSubSubHeader: {
          bold: true,
          fontSize: 11,
          color: "black",
        },
        tableSubSubSubHeader: {
          bold: true,
          fontSize: 10,
          color: "black",
          margin: [15, 0, 0, 0],
        },
        tablepoint: {
          bold: true,
          fontSize: 11,
          color: "black",
          alignment: "center",
        },
      },
      defaultStyle: {
        // alignment: 'justify'
      },
    };
    options = {};

    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    if (scorce.length > 1) {
      await createPdfAsync(printer, pdfDoc, path.join(path_save, name_zip, namefile));
    } else {
      await createPdfAsync(printer, pdfDoc, path.join(path_save, namefile));
      return namefile;
    }
  }
  if (scorce.length > 1) {
    archive.pipe(output);
    archive.directory(path.join(path_save, name_zip), false);
    archive.finalize();
  }

  if (scorce.length > 1) {
    return new Promise((resolve, reject) => {
      output.on("close", () => {
        // console.log("Nén hoàn tất, kích thước:", archive.pointer() + " bytes");
        fs.rm(path.join(path_save, name_zip), { recursive: true }, (err) => {
          if (err) {
            console.error("Lỗi khi xóa thư mục:", err);
            reject(err);
          } else {
            // console.log("Đã xóa thư mục thành công.");
            resolve(name_zip + ".zip");
          }
        });
      });

      archive.on("error", (err) => {
        console.log("Lỗi khi nén");
        reject(err);
      });
    });
  }
}

module.exports = {
  sendEmail,
  checkIfUserLoginAPI,
  checkIfUserLoginRoute,
  get_full_id,
  blockUnwantedPaths,
  mark,
  updateStudentTotalScore,
  randomPassword,
  scheduleFileDeletion,
  sortStudentName,
  createId,
  deleteClassApi,
  createPdf,
};
