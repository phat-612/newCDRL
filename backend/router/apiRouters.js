const express = require("express");
const router = express.Router();
const XlsxPopulate = require("xlsx-populate");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const uploadDirectory = path.join("../../upload_temp");
const multer = require("multer");
const { getNameGlobal } = require("../lib/mogodb_lib");
const name_global_databases = getNameGlobal();
const {
  sortStudentName,
  scheduleFileDeletion,
  mark,
  sendEmail,
  randomPassword,
  checkIfUserLoginAPI,
  createId,
  get_full_id,
} = require("../lib/function_lib");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}
const storage_file = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage_file });

// API SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createAPIRouter(client, wss) {
  // Log in --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post("/login", async (req, res) => {
    const data = req.body;
    // 403: sai thong tin dang nhap
    // data = {mssv: bbp, password: 1234567890, remember: true}
    // console.log("SYSTEM | LOG_IN | Dữ liệu nhận được: ", data);
    try {
      const user = req.session.user;
      if (!user) {
        //(log in database)
        let user = await client
          .db(name_global_databases)
          .collection("login_info")
          .findOne({ _id: data.mssv });
        if (user === null) {
          // Đăng nhập không thành công
          return res.sendStatus(403);
        } else if (user._id === data.mssv && user.password === data.password) {
          let seasionIDs = await client
            .db(name_global_databases)
            .collection("sessions_manager")
            .findOne({ _id: data.mssv });
          if (seasionIDs) {
            seasionIDs = seasionIDs.sessionId;
            const existingDocs = await client
              .db(name_global_databases)
              .collection("sessions")
              .find({ _id: { $in: seasionIDs } })
              .toArray();
            const existingIDs = existingDocs.map((doc) => doc._id);
            const idsToDelete = seasionIDs.filter(
              (id) => !existingIDs.includes(id)
            );
            if (idsToDelete.length > 0) {
              await client
                .db(name_global_databases)
                .collection("sessions_manager")
                .updateOne(
                  { _id: data.mssv },
                  { $pull: { sessionId: { $in: idsToDelete } } }
                );
            }
          }

          // get user class(cls), power and department(dep)
          const cls = await client
            .db(name_global_databases)
            .collection("user_info")
            .findOne(
              { _id: data.mssv },
              { projection: { _id: 0, class: 1, power: 1, dep: 1 } }
            );
          if (!cls.power[2]) {
            const branch = await client
              .db(name_global_databases)
              .collection("classes")
              .findOne(
                { _id: cls.class[0] },
                { projection: { _id: 0, branch: 1 } }
              );
            if (branch) {
              const dep = await client
                .db(name_global_databases)
                .collection("branchs")
                .findOne(
                  { _id: branch.branch },
                  { projection: { _id: 0, dep: 1 } }
                );

              user.dep = dep.dep;
            }
            user.cls = cls.class;
          } else {
            user.dep = cls.dep;
          }
          user.pow = cls.power;
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
          await client
            .db(name_global_databases)
            .collection("sessions_manager")
            .updateOne(
              { _id: user._id },
              { $push: { sessionId: sessionId } },
              { upsert: true }
            );

          if (user.first == "new_user") {
            return res.status(200).json({ check: true });
          } else {
            return res.status(200).json({ check: false });
          }
        } else {
          // Đăng nhập không thành công
          return res.sendStatus(403);
        }
      } else {
        return res.sendStatus(404);
      }
    } catch (err) {
      console.log("SYSTEM | LOG_IN | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // Logout ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.get("/logout", checkIfUserLoginAPI, async (req, res) => {
    // Xóa thông tin phiên (session) của người dùng
    const mssv = req.session.user._id;
    req.session.destroy((err) => {
      if (err) {
        console.error("SYSTEM | LOG_OUT | Failed to logout:", err);
        return res.sendStatus(500);
      } else {
        let seasionIDs;
        async function processSessionIDs() {
          try {
            seasionIDs = await client
              .db(name_global_databases)
              .collection("sessions_manager")
              .findOne({ _id: mssv });
            if (seasionIDs) {
              seasionIDs = seasionIDs.sessionId;
              const existingDocs = await client
                .db(name_global_databases)
                .collection("sessions")
                .find({ _id: { $in: seasionIDs } })
                .toArray();
              const existingIDs = existingDocs.map((doc) => doc._id);
              const idsToDelete = seasionIDs.filter(
                (id) => !existingIDs.includes(id)
              );

              if (idsToDelete.length > 0) {
                await client
                  .db(name_global_databases)
                  .collection("sessions_manager")
                  .updateOne(
                    { _id: mssv },
                    { $pull: { sessionId: { $in: idsToDelete } } }
                  );
              }
            }

            return res.redirect("/login"); // Chạy hàm dưới sau khi đã xử lý xong
          } catch (error) {
            console.error(
              "SYSTEM | LOG_OUT | Failed to clean up sessions:",
              error
            );
            return res.sendStatus(500);
          }
        }

        processSessionIDs();
      }
    });
  });

  // Đăng xuất tất cả thiết bị
  router.get("/logoutAlldevice", checkIfUserLoginAPI, async (req, res) => {
    // Xóa thông tin phiên (session) của người dùng
    const _id = req.session.user._id;
    const result = await client
      .db(name_global_databases)
      .collection("sessions_manager")
      .findOne({ _id: _id });
    const listSeasionId = result.sessionId;
    listSeasionId.splice(listSeasionId.indexOf(req.session.id), 1);
    await client
      .db(name_global_databases)
      .collection("sessions_manager")
      .updateOne(
        { _id: _id },

        { $pull: { sessionId: { $ne: req.session.id } } }
      );
    await client
      .db(name_global_databases)
      .collection("sessions")
      .deleteMany({ _id: { $in: listSeasionId } });
    wss.clients.forEach((ws) => {
      if (listSeasionId.includes(ws.id)) {
        ws.send("reload");
      }
    });
    return res.sendStatus(200);
  });

  // Đổi thông tin người dùng --------------------------------------------------------------------------------------------------------------------------------
  router.post("/updateInfo", checkIfUserLoginAPI, async (req, res) => {
    try {
      const data = req.body;
      // console.log(`SYSTEM | UPDATE_INFO | Dữ liệu nhận được`, data);
      await client
        .db(name_global_databases)
        .collection("user_info")
        .updateOne(
          { _id: req.session.user._id },
          {
            $set: {
              displayName: data.displayName,
              avt: data.avt,
            },
          }
        );
      return res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | UPDATE_INFO | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // Reset pass ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post("/resetpassword", async (req, res) => {
    try {
      const data = req.body;
      // console.log(`SYSTEM | RESET_PASSWORD | Dữ liệu nhận được`, data);
      const OTP = await client
        .db(name_global_databases)
        .collection("OTP")
        .findOne({ _id: data.mssv }, { projection: { _id: 0 } });
      if (OTP && OTP.otpcode === data.otp) {
        await client
          .db(name_global_databases)
          .collection("OTP")
          .deleteOne({ _id: data.mssv });
        const user = await client
          .db(name_global_databases)
          .collection("login_info")
          .findOneAndUpdate(
            { _id: data.mssv },
            { $set: { first: "otp" } },
            { returnDocument: "after" }
          );
        // Đăng nhập thành công, lưu thông tin người dùng vào phiên
        let seasionIDs = await client
          .db(name_global_databases)
          .collection("sessions_manager")
          .findOne({ _id: data.mssv });
        if (seasionIDs) {
          seasionIDs = seasionIDs.sessionId;
          const existingDocs = await client
            .db(name_global_databases)
            .collection("sessions")
            .find({ _id: { $in: seasionIDs } })
            .toArray();
          const existingIDs = existingDocs.map((doc) => doc._id);
          const idsToDelete = seasionIDs.filter(
            (id) => !existingIDs.includes(id)
          );
          if (idsToDelete.length > 0) {
            await client
              .db(name_global_databases)
              .collection("sessions_manager")
              .updateOne(
                { _id: data.mssv },
                { $pull: { sessionId: { $in: idsToDelete } } }
              );
          }
        }
        // get user class(cls), power and department(dep)
        const cls = await client
          .db(name_global_databases)
          .collection("user_info")
          .findOne(
            { _id: data.mssv },
            { projection: { _id: 0, class: 1, power: 1, dep: 1 } }
          );
        if (!cls.power[2]) {
          const branch = await client
            .db(name_global_databases)
            .collection("classes")
            .findOne(
              { _id: cls.class[0] },
              { projection: { _id: 0, branch: 1 } }
            );
          if (branch) {
            const dep = await client
              .db(name_global_databases)
              .collection("branchs")
              .findOne(
                { _id: branch.branch },
                { projection: { _id: 0, dep: 1 } }
              );
            user.dep = dep.dep;
          }
          user.cls = cls.class;
        } else {
          user.dep = cls.dep;
        }
        user.pow = cls.power;
        // Đăng nhập thành công, lưu thông tin người dùng vào phiên
        req.session.user = user;
        // Kiểm tra xem người dùng có chọn "Remember me" không

        // Thiết lập thời gian sống cookie lại về mặc định (1 giờ)
        req.session.cookie.maxAge = 3600000; // 1 hour

        const sessionId = req.session.id;
        await client
          .db(name_global_databases)
          .collection("sessions_manager")
          .updateOne(
            { _id: user._id },
            { $push: { sessionId: sessionId } },
            { upsert: true }
          );
        return res.sendStatus(200);
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | RESET_PASSWORD | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // Resent OTP ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post("/resendotp", async (req, res) => {
    try {
      const mssv = req.body.mssv;
      const dataUser = await client
        .db(name_global_databases)
        .collection("user_info")
        .findOne({ _id: mssv }, { projection: { _id: 0, email: 1 } });
      // Thêm tài liệu mới có thời gian hết hạn sau 1 phút
      const OTPscode = await randomPassword();
      await client
        .db(name_global_databases)
        .collection("OTP")
        .updateOne(
          { _id: mssv },
          {
            $set: {
              otpcode: OTPscode,
              expireAt: new Date(Date.now() + 60 * 5 * 1000), // Hết hạn sau 5 phút
            },
          },
          { upsert: true }
        );
      if (dataUser) {
        const email = dataUser.email;
        await sendEmail(OTPscode, email);
      }
      return res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | RESEND_OTP | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // Đổi pass ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post("/change_pass", checkIfUserLoginAPI, async (req, res) => {
    try {
      const data = req.body;
      // console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu nhận được`, data);
      const old_pass = await client
        .db(name_global_databases)
        .collection("login_info")
        .findOne(
          { _id: req.session.user._id },
          { projection: { _id: 0, password: 1 } }
        );
      if (old_pass.password == data.old_password) {
        if (old_pass.password !== data.new_password) {
          await client
            .db(name_global_databases)
            .collection("login_info")
            .updateOne(
              { _id: req.session.user._id },
              { $set: { password: data.new_password } }
            );
          return res.sendStatus(200);
        } else {
          return res.sendStatus(403);
        }
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      console.log("SYSTEM | CHANGE_PASSWORD | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // Đổi pass lần đầu đăng nhập -------------------------------------------------------------------------------------------------------------------------------
  router.post("/first_login", checkIfUserLoginAPI, async (req, res) => {
    try {
      const data = req.body;
      // console.log(`SYSTEM | CHANGE_PASSWORD | Dữ liệu nhận được`, data);
      const old_pass = await client
        .db(name_global_databases)
        .collection("login_info")
        .findOne(
          { _id: req.session.user._id },
          { projection: { _id: 0, password: 1 } }
        );

      if (old_pass.password == data.new_password) {
        return res.sendStatus(403);
      } else {
        delete req.session.user.first;
        await client
          .db(name_global_databases)
          .collection("login_info")
          .updateOne({ _id: req.session.user._id }, { $unset: { first: "" } });
        await client
          .db(name_global_databases)
          .collection("login_info")
          .updateOne(
            { _id: req.session.user._id },
            { $set: { password: data.new_password } }
          );
        return res.sendStatus(200);
      }
    } catch (err) {
      console.log("SYSTEM | CHANGE_PASSWORD | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // Save table and update old table std------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post("/std_mark", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      if (user.pow[0]) {
        const data = req.body;
        const marker = await client
          .db(name_global_databases)
          .collection("user_info")
          .findOne(
            { _id: user._id },
            {
              projection: {
                _id: 0,
                last_name: 1,
                first_name: 1,
              },
            }
          );

        await mark("_std_table", user, user._id, data, marker, user.cls[0]);

        return res.sendStatus(200);
      } else {
        return res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | STD_MARK | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // Save table and update old table stf------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post("/stf_mark", checkIfUserLoginAPI, async (req, res) => {
    const user = req.session.user;
    if (user.pow[1]) {
      try {
        const data = req.body;
        const marker = await client
          .db(name_global_databases)
          .collection("user_info")
          .findOne(
            { _id: user._id },
            {
              projection: {
                _id: 0,
                last_name: 1,
                first_name: 1,
              },
            }
          );

        await mark("_stf_table", user, data.mssv, data, marker, data.class);

        return res.sendStatus(200);
      } catch (err) {
        console.log("SYSTEM | STF_MARK | ERROR | ", err);
        return res.sendStatus(500);
      }
    } else if (user.pow[4]) {
      try {
        const data = req.body;
        const marker = await client
          .db(name_global_databases)
          .collection("user_info")
          .findOne(
            { _id: user._id },
            {
              projection: {
                _id: 0,
                last_name: 1,
                first_name: 1,
              },
            }
          );

        await mark("_stf_table", user, data.mssv, data, marker, user.cls[0]);

        return res.sendStatus(200);
      } catch (err) {
        console.log("SYSTEM | STF_MARK | ERROR | ", err);
        return res.sendStatus(500);
      }
    } else {
      return res.sendStatus(403);
    }
  });

  // Save table and update old table dep------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post("/dep_mark", checkIfUserLoginAPI, async (req, res) => {
    const user = req.session.user;
    if (user.pow[2]) {
      try {
        const data = req.body;
        const marker = await client
          .db(name_global_databases)
          .collection("user_info")
          .findOne(
            { _id: user._id },
            {
              projection: {
                _id: 0,
                last_name: 1,
                first_name: 1,
              },
            }
          );

        await mark("_dep_table", user, data.mssv, data, marker, data.class);

        return res.sendStatus(200);
      } catch (err) {
        console.log("SYSTEM | STF_MARK | ERROR | ", err);
        return res.sendStatus(500);
      }
    } else {
      return res.sendStatus(403);
    }
  });

  // Upload file -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post(
    "/uploadFile",
    upload.array("files[]"),
    checkIfUserLoginAPI,
    async function (req, res) {
      if (!req.files) {
        return res.status(400).send("No file uploaded.");
      }
      let list_name = [];
      let list_dep = [];
      // Kiểm tra kiểu dữ liệu của các tệp
      for (let i = 0; i < req.files.length; i++) {
        const fileName = req.files[i].originalname;
        const fileDescription = req.body.descripts[i]; // Trích xuất mô tả tương ứng từ danh sách descripts[]
        list_dep.push(fileDescription);
        list_name.push(fileName);
      }

      // Xử lý các tệp đã tải lên ở đây
      // console.log('SYSTEM | UPLOAD_FILE | Files uploaded:', req.files);
      res.writeHead(200, { "Content-Type": "applicaiton/json" });
      return res.end(
        JSON.stringify(await get_full_id(uploadDirectory, list_name, list_dep))
      );
    }
  );

  // Create new account -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.post(
    "/createAccount",
    upload.single("file"),
    checkIfUserLoginAPI,
    async (req, res) => {
      const user = req.session.user;
      if (user.pow[4] || user.pow[7]) {
        const fileStudents = req.file;
        async function generateEmail(str) {
          let s1 =
            "ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ";
          let s0 =
            "AAAAEEEIIOOOOUUYaaaaeeeiioooouuyAaDdIiUuOoUuAaAaAaAaAaAaAaAaAaAaAaAaEeEeEeEeEeEeEeEeEeIiIiOoOoOoOoOoOoOoOoOoOoOoUuUuUuUuUuUuUuYyYyYyYy";
          let newStr = "";
          let listSpace = [];
          for (let i = 0; i < str.length; i++) {
            if (s1.indexOf(str[i]) != -1) {
              newStr += s0[s1.indexOf(str[i])];
            } else {
              newStr += str[i];
            }
            if (str[i] == " ") {
              listSpace.push(i);
            }
          }
          let output = newStr[0];
          for (let i = 0; i < listSpace.length - 2; i++) {
            output += newStr.charAt(listSpace[i] + 1);
          }
          output += newStr
            .slice(listSpace[listSpace.length - 2] + 1)
            .replace(/\s/g, "");
          return output.toLowerCase() + "@student.ctuet.edu.vn";
        }

        if (fileStudents) {
          try {
            // read excel file:
            // create all account
            const workbook = await XlsxPopulate.fromFileAsync(
              fileStudents.path
            );
            const sheet = workbook.sheet(0);
            const values = sheet.usedRange().value();
            let maxWidthEmail = 0;
            //[['MSSV', 'Họ', 'Tên' ]]
            sheet.cell("D1").value("Email");
            sheet.cell("E1").value("Password");
            for (let i = 1; i < values.length; i++) {
              let pw = await randomPassword();
              let email = await generateEmail(
                `${values[i][1]} ${values[i][2]} ${values[i][0].toString()}`
              );
              let dataInsertUser = {
                _id: values[i][0].toString(),
                first_name: values[i][2],
                last_name: values[i][1],
                avt: "https://i.pinimg.com/236x/89/08/3b/89083bba40545a72fa15321af5fab760--chibi-girl-zero.jpg",
                power: { 0: true },
                class: [req.body.cls],
                displayName: `${values[i][1]} ${values[i][2]}`,
                email: email,
              };
              let dataInsertLogin = {
                _id: values[i][0].toString(),
                password: pw,
                first: "new_user",
              };
              client.db("global").collection("user_info").updateOne(
                {
                  _id: dataInsertUser._id,
                },
                {
                  $set: dataInsertUser,
                },
                {
                  upsert: true,
                }
              );
              client.db("global").collection("login_info").updateOne(
                {
                  _id: dataInsertLogin._id,
                },
                {
                  $set: dataInsertLogin,
                },
                {
                  upsert: true,
                }
              );
              await sheet.cell(`D${i + 1}`).value(email);
              await sheet.cell(`E${i + 1}`).value(pw);
              const range = sheet.range(`D${i + 1}:E${i + 1}`);
              range.style({ border: true });
              if (email.length > maxWidthEmail) {
                maxWidthEmail = email.length;
              }
            }
            // Write to file.
            sheet.column("D").width(maxWidthEmail);
            const uuid = uuidv4();
            await workbook.toFileAsync(path.join(".downloads", uuid + ".xlsx"));
            res.download(path.join(".downloads", uuid + ".xlsx"));
            // xoa file sau khi xu ly
            scheduleFileDeletion(path.join(".downloads", uuid + ".xlsx"));
          } catch (err) {
            console.log("SYSTEM | CREATE_ACCOUNT | ERROR | ", err);
            return res.sendStatus(500);
          }
        } else {
          // console.log('them 1 sinh vien');
          const dataStudent = req.body;
          // console.log(dataStudent);
          let pw = await randomPassword();
          let email = await generateEmail(
            `${dataStudent["ho"]} ${dataStudent["ten"]} ${dataStudent[
              "mssv"
            ].toString()}`
          );
          let power;
          if (dataStudent["vaitro"] == "1") {
            power = {
              0: true,
              1: true,
              3: true,
            };
          } else {
            power = {
              0: true,
              1: dataStudent["chamdiem"],
              3: dataStudent["lbhd"],
            };
          }
          let dataInsertUser = {
            _id: dataStudent["mssv"].toString(),
            first_name: dataStudent["ten"],
            last_name: dataStudent["ho"],
            avt: "https://i.pinimg.com/236x/89/08/3b/89083bba40545a72fa15321af5fab760--chibi-girl-zero.jpg",
            power: power,
            class: [dataStudent["cls"]],
            displayName: `${dataStudent["ho"]} ${dataStudent["ten"]}`,
            email: email,
          };
          let dataInsertLogin = {
            _id: dataStudent["mssv"].toString(),
            password: pw,
            first: "new_user",
          };
          client.db("global").collection("user_info").updateOne(
            {
              _id: dataInsertUser._id,
            },
            {
              $set: dataInsertUser,
            },
            {
              upsert: true,
            }
          );
          client.db("global").collection("login_info").updateOne(
            {
              _id: dataInsertLogin._id,
            },
            {
              $set: dataInsertLogin,
            },
            {
              upsert: true,
            }
          );
          // xu ly sau khi them sinh vien
          if (!dataStudent["updateStudent"]) {
            const uuid = uuidv4();
            const workbook = await XlsxPopulate.fromFileAsync(
              "./src/excelTemplate/Tao_danh_sach_lop_moi.xlsx"
            );
            const sheet = workbook.sheet(0);
            await sheet.cell(`A2`).value(dataStudent["mssv"].toString());
            await sheet.cell(`B2`).value(dataStudent["ho"]);
            await sheet.cell(`C2`).value(dataStudent["ten"]);
            await sheet.cell(`D1`).value("Email");
            await sheet.cell(`E1`).value("Password");
            await sheet.cell(`D2`).value(email);
            await sheet.cell(`E2`).value(pw);
            let range = sheet.range(`D2:E2`);
            range.style({ border: true });
            sheet.column("D").width(email.length);
            await workbook.toFileAsync(path.join(".downloads", uuid + ".xlsx"));
            res.download(path.join(".downloads", uuid + ".xlsx"));
            // xoa file sau khi xu ly
            scheduleFileDeletion(path.join(".downloads", uuid + ".xlsx"));
          } else {
            return res.sendStatus(200);
          }
        }
      } else {
        return res.sendStatus(403);
      }
    }
  );
  router.get(
    "/getTemplateAddStudent",
    upload.single("file"),
    checkIfUserLoginAPI,
    async (req, res) => {
      const user = req.session.user;
      if (user.pow[4] || user.pow[7]) {
        return res.download("./src/excelTemplate/Tao_danh_sach_lop_moi.xlsx");
      } else {
        return res.sendStatus(403);
      }
    }
  );
  router.post("/deleteAccount", checkIfUserLoginAPI, async (req, res) => {
    const user = req.session.user;
    if (user.pow[4] || user.pow[7]) {
      try {
        const listDelete = req.body.dataDelete;
        for (let i = 0; i < listDelete.length; i++) {
          client
            .db("global")
            .collection("user_info")
            .deleteOne({ _id: listDelete[i] });
          client
            .db("global")
            .collection("login_info")
            .deleteOne({ _id: listDelete[i] });
        }
        return res.sendStatus(200);
      } catch (err) {
        console.log("SYSTEM | DELETE_ACCOUNT | ERROR | ", err);
        return res.sendStatus(500);
      }
    } else {
      return res.sendStatus(403);
    }
  });
  // Export class score report --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.get("/exportClassScore", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      if (user.pow[1] || user.pow[2]) {
        const data = req.query;
        //data = {year: "HK1_2022-2023", cls: '1'}
        const school_year = data.year;
        let cls = data.cls;
        // create uuid for download file
        const uuid = uuidv4();

        // check for post data.cls if class define this mean they choose class so that must

        let student_list = [];
        if (user.pow[1]) {
          student_list = sortStudentName(
            await client
              .db(name_global_databases)
              .collection("user_info")
              .find(
                { class: user.cls[0], "power.0": { $exists: true } },
                { projection: { first_name: 1, last_name: 1 } }
              )
              .toArray()
          );
        } else {
          student_list = sortStudentName(
            await client
              .db(name_global_databases)
              .collection("user_info")
              .find(
                { class: cls, "power.0": { $exists: true } },
                { projection: { first_name: 1, last_name: 1 } }
              )
              .toArray()
          );
        }

        // get all student total score from themself:
        let scores = [];

        if (student_list.length !== 0) {

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
              cls,
            ];

            const curr_departmentt_score = await client
              .db(user.dep)
              .collection(cls + "_dep_table")
              .findOne(
                {
                  mssv: student_list[i]._id,
                  school_year: school_year,
                },
                {
                  projection: {
                    first: 1,
                    second: 1,
                    third: 1,
                    fourth: 1,
                    fifth: 1,
                    total: 1,
                  },
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
              curr_score.push(curr_departmentt_score.total);
              // set kind of conduct:
              if (curr_departmentt_score.total >= 90) {
                curr_score.push("xuất sắc");
              } else if (curr_departmentt_score.total >= 80) {
                curr_score.push("tốt");
              } else if (curr_departmentt_score.total >= 65) {
                curr_score.push("khá");
              } else if (curr_departmentt_score.total >= 50) {
                curr_score.push("trung bình");
              } else if (curr_departmentt_score.total >= 35) {
                curr_score.push("yếu");
              } else {
                curr_score.push("kém");
              }
            }

            // add curr_score to scores
            scores.push(curr_score);
            console.log(scores);
          }
        } else {
        }

        // Load an existing workbook
        const workbook = await XlsxPopulate.fromFileAsync(
          "./src/excelTemplate/Bang_diem_ca_lop_xuat_tu_he_thong.xlsx"
        );

        if (scores.length != 0) {
          await workbook.sheet(0).cell("A7").value(scores);
        }
        // Write to file.

        await workbook.toFileAsync(path.join(".downloads", uuid + ".xlsx"));

        // tải file xlsx về máy người dùng
        // res.download(path.join('.downloads', uuid + ".xlsx"));

        res.download(path.join(".downloads", uuid + ".xlsx"));

        // delete file after 12 hours
        scheduleFileDeletion(path.join(".downloads", uuid + ".xlsx"));
      } else {
        return res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | EXPORT_CLASS_SCORE | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // Load score list of student in specific class at specific time ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  router.get("/loadScoresList", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      if (user.pow[1]) {
        const data = req.query;
        //data = {year: "HK1_2022-2023", cls: "1"}
        const school_year = data.year;
        let cls = data.cls;
        // check for post data.cls if class define this mean they choose class so that must
        if (!cls) {
          cls = 0;
        }

        const year_available = await client
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

        const student_list = sortStudentName(
          await client
            .db(name_global_databases)
            .collection("user_info")
            .find(
              { class: user.cls[cls], "power.0": { $exists: true } },
              { projection: { first_name: 1, last_name: 1 } }
            )
            .toArray()
        );

        // get all student total score from themself:
        let result = {
          staff_name: [],
          student_list: student_list,
          student_scores: [],
          staff_scores: [],
          department_scores: [],
          year_available: year_available,
        };
        for (student of student_list) {
          const curr_student_score = await client
            .db(cls)
            .collection(user.cls[parseInt(cls)] + "_std_table")
            .findOne(
              {
                mssv: student._id,
                school_year: school_year,
              },
              {
                projection: {
                  _id: 0,
                  total: 1,
                },
              }
            );
          const curr_staff_score = await client
            .db(cls)
            .collection(user.cls[parseInt(cls)] + "_stf_table")
            .findOne(
              {
                mssv: student._id,
                school_year: school_year,
              },
              {
                projection: {
                  _id: 0,
                  total: 1,
                  marker: 1,
                },
              }
            );
          const curr_departmentt_score = await client
            .db(cls)
            .collection(user.cls[parseInt(cls)] + "_dep_table")
            .findOne(
              {
                mssv: student._id,
                school_year: school_year,
              },
              {
                projection: {
                  _id: 0,
                  total: 1,
                },
              }
            );
          // student
          if (curr_student_score) {
            result.student_scores.push(curr_student_score.total);
          } else {
            result.student_scores.push("-");
          }
          // staff member
          if (curr_staff_score) {
            result.staff_scores.push(curr_staff_score.total);
            result.staff_name.push(curr_staff_score.marker);
          } else {
            result.staff_scores.push("-");
            result.staff_name.push("-");
          }
          // department
          if (curr_departmentt_score) {
            result.department_scores.push(curr_departmentt_score.total);
          } else {
            result.department_scores.push("-");
          }
        }

        return res.status(200).json(result);
      } else {
        // user not staff members
        // redirect to home (return 403, api khong the chuyenh huong ve trang chu duoc)
        return res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | LOAD_SCORE_LIST | ERROR | ", err);
      return res.sendStatus(500);
    }
  });
  // doan khoa load scores
  router.get(
    "/doan_khoa/loadScoresList",
    checkIfUserLoginAPI,
    async (req, res) => {
      try {
        const user = req.session.user;
        if (user.pow[2]) {
          const data = req.query;
          //data = {year: "HK1_2022-2023", cls: "1"}
          const school_year = data.year;
          const cls = data.class;
          // const bo_mon = data.bo_mon;
          // check for post data.cls if class define this mean they choose class so that must
          if (!cls) {
            cls = 0;
          }

          const year_available = await client
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

          const student_list = sortStudentName(
            await client
              .db(name_global_databases)
              .collection("user_info")
              .find(
                { class: cls, "power.0": { $exists: true } },
                { projection: { first_name: 1, last_name: 1 } }
              )
              .toArray()
          );

          // get all student total score from themself:
          let result = {
            staff_name: [],
            student_list: student_list,
            student_scores: [],
            staff_scores: [],
            department_scores: [],
            year_available: year_available,
          };
          for (student of student_list) {
            const curr_student_score = await client
              .db(user.dep)
              .collection(cls + "_std_table")
              .findOne(
                {
                  mssv: student._id,
                  school_year: school_year,
                },
                {
                  projection: {
                    _id: 0,
                    total: 1,
                  },
                }
              );
            const curr_staff_score = await client
              .db(user.dep)
              .collection(cls + "_stf_table")
              .findOne(
                {
                  mssv: student._id,
                  school_year: school_year,
                },
                {
                  projection: {
                    _id: 0,
                    total: 1,
                    marker: 1,
                  },
                }
              );
            const curr_departmentt_score = await client
              .db(user.dep)
              .collection(cls + "_dep_table")
              .findOne(
                {
                  mssv: student._id,
                  school_year: school_year,
                },
                {
                  projection: {
                    _id: 0,
                    total: 1,
                  },
                }
              );
            // student
            if (curr_student_score) {
              result.student_scores.push(curr_student_score.total);
            } else {
              result.student_scores.push("-");
            }
            // staff member
            if (curr_staff_score) {
              result.staff_scores.push(curr_staff_score.total);
              result.staff_name.push(curr_staff_score.marker);
            } else {
              result.staff_scores.push("-");
              result.staff_name.push("-");
            }
            // department
            if (curr_departmentt_score) {
              result.department_scores.push(curr_departmentt_score.total);
            } else {
              result.department_scores.push("-");
            }
          }

          return res.status(200).json(result);
        } else {
          // user not staff members
          // redirect to home
          return res.statusCode(403);
        }
      } catch (err) {
        console.log("SYSTEM | DOAN_KHOA_LOAD_SCORE_LIST | ERROR | ", err);
        return res.sendStatus(500);
      }
    }
  );
  // Auto mark (copy student mark to staff mark)
  router.post("/autoMark", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      if (user.pow[1]) {
        const data = req.body;
        let cls = data.cls;
        //data = {year: "HK1_2022-2023", cls: "1", std_list = []}

        // get staff member info :
        const marker = await client
          .db(name_global_databases)
          .collection("user_info")
          .findOne(
            { _id: user._id },
            {
              projection: {
                _id: 0,
                last_name: 1,
                first_name: 1,
              },
            }
          );
        // check for post data.cls if class define this mean they choose class so that must
        if (!cls) {
          cls = 0;
        }

        // check if table is exist or not
        // update or add new table copy from std_table to staff_table
        for (let i = 0; i < data.std_list.length; i++) {
          const std_table = await client
            .db(user.dep)
            .collection(user.cls[parseInt(cls)] + "_std_table")
            .findOne({
              mssv: data.std_list[i],
              school_year: data.year,
            });

          // update old table if exist else insert new one
          // copy from student table and add marker name
          if (std_table) {
            std_table.marker = marker.last_name + " " + marker.first_name;
            delete std_table._id;
            await client
              .db(user.dep)
              .collection(user.cls[parseInt(cls)] + "_stf_table")
              .updateOne(
                {
                  mssv: data.std_list[i],
                  school_year: data.year,
                },
                {
                  $set: std_table,
                },
                { upsert: true }
              );
          }
        }

        return res.sendStatus(200);
      } else {
        return res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | AUTO_MARK | ERROR | ", err);
      return res.sendStatus(500);
    }
  });
  router.post("/doan_khoa/autoMark", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      if (user.pow[2]) {
        const data = req.body;
        let cls = data.cls;
        console.log(cls);
        //data = {year: "HK1_2022-2023", cls: "1", std_list = []}

        // get staff member info :
        const marker = await client
          .db(name_global_databases)
          .collection("user_info")
          .findOne(
            { _id: user._id },
            {
              projection: {
                _id: 0,
                last_name: 1,
                first_name: 1,
              },
            }
          );
     

        // check if table is exist or not
        // update or add new table copy from std_table to staff_table
        for (let i = 0; i < data.std_list.length; i++) {
          const std_table = await client
            .db(user.dep)
            .collection(cls + "_stf_table")
            .findOne({
              mssv: data.std_list[i],
              school_year: data.year,
            });

          // update old table if exist else insert new one
          // copy from student table and add marker name
          if (std_table) {
            std_table.marker = marker.last_name + " " + marker.first_name;
            delete std_table._id;
            await client
              .db(user.dep)
              .collection(cls + "_dep_table")
              .updateOne(
                {
                  mssv: data.std_list[i],
                  school_year: data.year,
                },
                {
                  $set: std_table,
                },
                { upsert: true }
              );
          }
        }

        return res.sendStatus(200);
      } else {
        return res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | AUTO_MARK | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // api danh sach sinh vien // có j sữa tên tiêng anh lại cho nó dồng bộ code nha Phát
  router.post("/getStudentList", checkIfUserLoginAPI, async (req, res) => {
    const user = req.session.user;

    const data = req.body;
    let reqClass = data.class;
    // if (!reqClass) {
    //   reqClass = user.cls[0];
    // }
    if (reqClass) {
      if (user.pow[1] || user.pow[2]) {
        const student_list = sortStudentName(
          await client
            .db(name_global_databases)
            .collection("user_info")
            .find(
              { class: reqClass, "power.0": { $exists: true } },
              { projection: { first_name: 1, last_name: 1, power: 1 } }
            )
            .toArray()
        );
        const transformedData = student_list.map((item) => {
          let role = "UnKnow"; // Giả định giá trị mặc định là 'unknow'
          let dang_vien = false;
          let cham_diem = false;
          let lap_hoat_dong = false;
          if (item.power["1"] || item.power["3"]) {
            role = "Ban cán sự";
            cham_diem = item.power["1"] ? true : false;
            lap_hoat_dong = item.power["3"] ? true : false;
          } else if (item.power["0"]) {
            role = "Sinh viên";
          }

          return {
            _id: item._id,
            first_name: item.first_name,
            last_name: item.last_name,
            role,
            dang_vien,
            cham_diem,
            lap_hoat_dong,
          };
        });
        return res.status(200).json(transformedData);
      } else {
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(404);
    }
  });

  router.get("/getuserscore", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      if (user.pow[0]) {
        const schoolYearParam = req.query.schoolYear;

        const schoolYearsToSearch = [
          "HK1_" + schoolYearParam,
          "HK2_" + schoolYearParam,
        ];
        const studentTotalScores = await Promise.all(
          schoolYearsToSearch.map(async (year) => {
            const studentTotalScore = await client
              .db(user.dep)
              .collection(user.cls[0] + "_std_table")
              .findOne(
                {
                  mssv: user._id,
                  school_year: year,
                },
                {
                  projection: { _id: 0, total: 1 },
                }
              );
            return {
              year: year.slice(0, 3),
              total: studentTotalScore
                ? studentTotalScore.total
                : "Chưa có điểm",
            };
          })
        );
        return res.status(200).json(studentTotalScores);
      } else {
        return res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | GET_USER_SCORE | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // api add or edit branch of department base on it exist or not
  router.post("/addOrEditBranchs", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {old_name: "Hệ thống thông tin", name: "Kỹ Thuật Phần Mềm"}

      // must be department to use this api
      if (user.pow[5]) {
        // remove old branch
        await client
          .db(name_global_databases)
          .collection("branchs")
          .deleteOne({
            _id: createId(data.old_name),
          });
        // add new branch
        await client
          .db(name_global_databases)
          .collection("branchs")
          .insertOne({
            _id: createId(data.name),
            name: data.name,
            dep: user.dep,
          });
      } else {
        return res.sendStatus(403); // back to home
      }

      return res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | ADD_OR_EDIT_BRANCHS | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // api delete cheked branchs
  router.post("/deleteBranchs", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {rm_bs: ["Kỹ Thuật Phần Mềm", ...]}

      // must be department to use this api
      if (user.pow[5]) {
        // remove all cheked branch in remove branchs líst
        for (let i = 0; i < data.rm_bs.length; i++) {
          await client
            .db(name_global_databases)
            .collection("branchs")
            .deleteOne({
              _id: createId(data.rm_bs[i]),
            });
        }
        return res.sendStatus(200);
      } else {
        return res.sendStatus(403); // back to home
      }
    } catch (err) {
      console.log("SYSTEM | DELETE_BRANCHS | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // change mark deadline
  router.post("/changeDeadLine", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      // must be department to use this api
      if (user.pow[6]) {
        const data = req.body; // data = {sch_y: "HK1_2022-2023", start_day: '18/10/2023', end_day: '19/11/999999999999999999']}

        // set end day to special date if it is ''
        if (!data.end_day) {
          data.end_day = "2003-10-18"; // special date
        }

        await client
          .db(name_global_databases)
          .collection("school_year")
          .updateOne(
            {},
            {
              $set: {
                year: data.sch_y,
                start_day: new Date(data.start_day), // change string to Date
                end_day: new Date(data.end_day),
              },
            }
          );
        return res.sendStatus(200);
      } else {
        return res.sendStatus(403); // back to home
      }
    } catch (err) {
      console.log("SYSTEM | CHANGE_DEADLINE | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // api add or edit teacher of department base on it exist or not
  router.post("/addOrEditTeachers", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {old_id: "19112003", new_id: "18102003", new_name: "Nguyễn Văn A", branch: "KTPM"}

      // must be department to use this api
      if (user.pow[8]) {
        // find to get old pass of teacher before remove it
        const teacher_pass = await client
          .db(name_global_databases)
          .collection("login_info")
          .findOne(
            {
              _id: data.old_id,
            },
            {
              projection: {
                password: 1,
              },
            }
          );
        // find to get curr classes
        const curr_classes = await client
          .db(name_global_databases)
          .collection("user_info")
          .findOne(
            {
              _id: data.old_id,
            },
            {
              projection: {
                class: 1,
                avt: 1,
                email: 1,
              },
            }
          );

        if (curr_classes) {
          // remove old teachers
          await client
            .db(name_global_databases)
            .collection("user_info")
            .deleteOne({
              _id: data.old_id,
            });

          // edit old one
          await client
            .db(name_global_databases)
            .collection("user_info")
            .insertOne({
              _id: data.new_id,
              first_name: data.new_name.split(" ").slice(-1).join(" "),
              last_name: data.new_name.split(" ").slice(0, -1).join(" "),
              avt: curr_classes.avt,
              power: {
                1: true,
                3: true,
                4: true,
              },
              class: curr_classes.class,
              displayName: data.new_name, // here before pop
              branch: data.branch,
              email: curr_classes.email,
            });
        } else {
          // add new one
          await client
            .db(name_global_databases)
            .collection("user_info")
            .insertOne({
              _id: data.new_id,
              first_name: data.new_name.split(" ").slice(-1).join(" "),
              last_name: data.new_name.split(" ").slice(0, -1).join(" "),
              avt: "https://i.pinimg.com/236x/89/08/3b/89083bba40545a72fa15321af5fab760--chibi-girl-zero.jpg",
              power: {
                1: true,
                3: true,
                4: true,
              },
              class: [],
              displayName: data.new_name, // here before pop
              branch: data.branch,
              email: "",
            });
        }

        if (teacher_pass) {
          await client
            .db(name_global_databases)
            .collection("login_info")
            .deleteOne({
              _id: data.old_id,
            });
          // edit old one
          await client
            .db(name_global_databases)
            .collection("login_info")
            .insertOne({
              _id: data.new_id,
              password: teacher_pass.password,
            });
        } else {
          // add new one
          await client
            .db(name_global_databases)
            .collection("login_info")
            .insertOne({
              _id: data.new_id,
              password: data.new_id,
            });
        }
      } else {
        return res.sendStatus(403); // back to home
      }

      return res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | ADD_OR_EDIT_BRANCHS | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // api delete teachers checked
  router.post("/deleteTeachers", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {rm_ts: ["19112003" (teacher_id), ...]}

      // must be department to use this api
      if (user.pow[8]) {
        // remove all cheked branch in remove branchs líst in user_info and login_info
        await client
          .db(name_global_databases)
          .collection("user_info")
          .deleteMany({
            _id: { $in: data.rm_ts },
          });

        await client
          .db(name_global_databases)
          .collection("login_info")
          .deleteMany({
            _id: { $in: data.rm_ts },
          });
      } else {
        return res.sendStatus(403); // back to home
      }

      return res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | DELETE_TEACHER | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // api set activities -------------------------------------------------------------------------------------------------------------------------------
  router.post("/add_activities", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      if (user.pow[3]) {
        const data = req.body;
        if (data.cap === "khoa") {
          await client.db(user.dep).collection("activities").insertOne({
            activities_name: data.activities_name,
            activities_content: data.activities_content,
          });
        } else if (data.cap == "lop") {
          await client.db(user.dep).collection("activities_class").insertOne({
            activities_name: data.activities_name,
            activities_content: data.activities_content,
            class: data.class,
          });
        }
      } else {
        return res.sendStatus(403);
      }
    } catch (err) {
      console.log("SYSTEM | ADD_ACTIVITIES | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // load bang diem cua giao vien------------------------------------------------------------------------------------------------------------------
  router.get(
    "/teacher/loadScoresList",
    checkIfUserLoginAPI,
    async (req, res) => {
      try {
        const user = req.session.user;
        if (user.pow[1]) {
          const data = req.query;
          //data = {year: "HK1_2022-2023", cls: "1"}
          const school_year = data.year;
          const year_available = await client
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

          const student_list = sortStudentName(
            await client
              .db(name_global_databases)
              .collection("user_info")
              .find(
                { class: data.cls, "power.0": { $exists: true } },
                { projection: { first_name: 1, last_name: 1 } }
              )
              .toArray()
          );

          // get all student total score from themself:
          let result = {
            staff_name: [],
            student_list: student_list,
            student_scores: [],
            staff_scores: [],
            department_scores: [],
            year_available: year_available,
          };
          for (student of student_list) {
            const curr_student_score = await client
              .db(user.dep)
              .collection(data.cls + "_std_table")
              .findOne(
                {
                  mssv: student._id,
                  school_year: school_year,
                },
                {
                  projection: {
                    _id: 0,
                    total: 1,
                  },
                }
              );
            const curr_staff_score = await client
              .db(user.dep)
              .collection(data.cls + "_stf_table")
              .findOne(
                {
                  mssv: student._id,
                  school_year: school_year,
                },
                {
                  projection: {
                    _id: 0,
                    total: 1,
                    marker: 1,
                  },
                }
              );
            const curr_departmentt_score = await client
              .db(user.dep)
              .collection(data.cls + "_dep_table")
              .findOne(
                {
                  mssv: student._id,
                  school_year: school_year,
                },
                {
                  projection: {
                    _id: 0,
                    total: 1,
                  },
                }
              );
            // student
            if (curr_student_score) {
              result.student_scores.push(curr_student_score.total);
            } else {
              result.student_scores.push("-");
            }
            // staff member
            if (curr_staff_score) {
              result.staff_scores.push(curr_staff_score.total);
              result.staff_name.push(curr_staff_score.marker);
            } else {
              result.staff_scores.push("-");
              result.staff_name.push("-");
            }
            // department
            if (curr_departmentt_score) {
              result.department_scores.push(curr_departmentt_score.total);
            } else {
              result.department_scores.push("-");
            }
          }

          return res.status(200).json(result);
        } else {
          // user not staff members
          // redirect to home (return 403, api khong the chuyenh huong ve trang chu duoc)
          return res.sendStatus(403);
        }
      } catch (err) {
        console.log("SYSTEM | GIAO_VIEN_LOAD_SCORE_LIST | ERROR | ", err);
        return res.sendStatus(500);
      }
    }
  );

  // api add and edit new class
  router.post("/addOrEditClasses", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {new_id: KTPM0121, old_id: CNTT0221, branch: KTPM, cvht: 18101911}

      // must be department to use this api
      if (user.pow[9]) {
        const school_year = await client
          .db(name_global_databases)
          .collection("school_year")
          .findOne(
            {},
            {
              projection: {
                _id: 0,
                year: 1,
              },
            }
          );

        const curr_year = school_year.year.split("_")[1];

        // find year of old_id class before remove it
        const old_class = await client
          .db(name_global_databases)
          .collection("classes")
          .findOne(
            {
              _id: data.old_id,
            },
            {
              projection: {
                _id: 0,
                years: 1,
                cvht: 1,
              },
            }
          );

        if (old_class) {
          // remove old_id class
          await client
            .db(name_global_databases)
            .collection("classes")
            .deleteOne({ _id: data.old_id });

          // add (edit old_id class)
          await client
            .db(name_global_databases)
            .collection("classes")
            .insertOne({
              _id: data.new_id,
              years: old_class.years, // years of old_id class
              branch: data.branch,
              cvht: data.cvht,
            });

          // remove class from old teacher's class
          await client
            .db(name_global_databases)
            .collection("user_info")
            .updateOne(
              {
                _id: old_class.cvht,
              },
              {
                $pull: { class: data.old_id },
              }
            );

          // add new class to new teacher's class
          await client
            .db(name_global_databases)
            .collection("user_info")
            .updateOne(
              {
                _id: data.cvht,
              },
              {
                $push: { class: data.new_id },
              }
            );
        } else {
          // add new_id class
          await client
            .db(name_global_databases)
            .collection("classes")
            .insertOne({
              _id: data.new_id,
              years: {
                [`${curr_year}`]: [1, 2, 3],
              },
              branch: data.branch,
              cvht: data.cvht,
            });

          // add new class to teacher's class
          await client
            .db(name_global_databases)
            .collection("user_info")
            .updateOne(
              {
                _id: data.cvht,
              },
              {
                $push: { class: data.new_id },
              }
            );
        }
      } else {
        return res.sendStatus(403); // back to home
      }

      return res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | DELETE_TEACHER | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  // api delete classes checked
  router.post("/deleteClasses", checkIfUserLoginAPI, async (req, res) => {
    try {
      const user = req.session.user;
      const data = req.body; // data = {rm_cls: ["KTPM0121" (class_id), ...], rm_ts: ["18101911" (teacher_id), ...]}

      // must be department to use this api
      if (user.pow[9]) {
        // remove all checked classes in remove branchs líst in user_info and login_info
        // remove class from teacher's class
        for (let i = 0; i < data.rm_cls.length; i++) {
          await client
            .db(name_global_databases)
            .collection("classes")
            .deleteMany({
              _id: data.rm_cls[i],
            });

          await client
            .db(name_global_databases)
            .collection("user_info")
            .updateOne(
              {
                _id: data.rm_ts[i],
              },
              {
                $pull: { class: data.rm_cls[i] },
              }
            );
        }
      } else {
        return res.sendStatus(403); // back to home
      }
      return res.sendStatus(200);
    } catch (err) {
      console.log("SYSTEM | DELETE_TEACHER | ERROR | ", err);
      return res.sendStatus(500);
    }
  });

  return router;
}
module.exports = createAPIRouter;
