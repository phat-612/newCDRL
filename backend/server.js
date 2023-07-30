// const viplib = require("./vip_pro_lib");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const path = require("path");

// ----------------------------------------------------------------

const app = express();
const router = express.Router();
const port = 8181;
const secretKey = "5gB#2L1!8*1!0)$7vF@9";
const authenticationKey = Buffer.from(
  secretKey.padEnd(32, "0"),
  "utf8"
).toString("hex");

function encrypt(data, secretKey) {
  const algorithm = "aes-256-cbc";
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );

  let encryptedData = cipher.update(data, "utf8", "hex");
  encryptedData += cipher.final("hex");

  const encryptedDataWithIV = iv.toString("hex") + encryptedData;
  console.log("SYSTEM | ENCRYPT | OK");

  return encryptedDataWithIV;
}

function decrypt(encryptedDataWithIV, secretKey) {
  const algorithm = "aes-256-cbc";
  const iv = Buffer.from(encryptedDataWithIV.slice(0, 32), "hex"); // Extract IV from the encrypted data
  const encryptedData = encryptedDataWithIV.slice(32); // Extract the encrypted data without IV
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );

  let decryptedData = decipher.update(encryptedData, "hex", "utf8");
  decryptedData += decipher.final("utf8");

  console.log("SYSTEM | DECRYPT | OK");

  return decryptedData;
}

function set_cookies(res, id, pass) {
  const encryptedString = encrypt(
    `${authenticationKey}:${id}:${pass}`,
    authenticationKey
  );
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  res.cookie("account", encryptedString, {
    expires: oneYearFromNow,
    secure: true,
    sameSite: "none",
    domain: "localhost",
    path: "/",
  });
  res.writeHead(200, { "Content-Type": "text/html" });
  console.log(`SYSTEM | SET_COOKIES | User ${id} login!`);
}
// ------------------------------------------------------------------------------------------------
async function getDataCookieUserLogin(req, res, next) {
  try {
    const data = req.cookies;
    if (!data.account) {
      res.locals.avt = "";
      res.locals.username = "";
      next();
    } else {
      console.log("SYSTEM | AUTHENTICATION | Dữ liệu nhận được: ", data);
      const decode = decrypt(data.account, authenticationKey);
      const decodeList = decode.split(":"); // Output: "replika is best japanese waifu"
      console.log(`SYSTEM | AUTHENTICATION | Dữ liệu đã giải mã ${decodeList}`);
      // decodeList = authenticationKey:id:pass
      if (decodeList[0] == authenticationKey) {
        // tìm thông tin người dùng theo id người dùng decodeList[1]
        if (result != null && result.length != 0) {
          res.locals.avt = result.avatarUrl;
          res.locals.username = result.displayName;
          res.locals.user_id = result._id;
          next();
        } else if (result == null) {
          res.locals.avt = "";
          res.locals.username = "";
          next();
        } else {
          res.locals.avt = "";
          res.locals.username = "";
          next();
        }
      }
    }
  } catch (error) {
    // Xử lý lỗi nếu có
    res.status(500).send("Internal Server Error");
  }
}

async function checkCookieUserLogin(req, res, next) {
  const data = req.cookies;
  if (!data.account) {
    // Cookie không tồn tại, chặn truy cập
    return res.redirect("/login");
  } else {
    next();
  }
}

const blockUnwantedPaths = (req, res, next) => {
  const unwantedPaths = ["/backend/"];
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

// Lắng nghe các yêu cầu POST tới localhost:6969
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use("/", router);
app.use(express.json());
const parentDirectory = path.dirname(__dirname);
app.use(express.static(parentDirectory));
app.set("view engine", "ejs");
// Đặt thư mục chứa các tệp template
app.set("views", path.join(parentDirectory, "views"));
console.log(path.join(parentDirectory, "views"));
// ROUTE SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// index route
app.get("/", getDataCookieUserLogin, async (req, res) => {
  //   res.sendFile(path.join(parentDirectory, "views", "tracuu.html"));
  res.render("tracuu", {
    header: "header",
  });
});

// login route
app.get("/login", getDataCookieUserLogin, async (req, res) => {
  res.render("login", {
    header: "header",
  });
});

// nhap bang diem route
app.get("/nhapdiemdanhgia", getDataCookieUserLogin, async (req, res) => {
  res.render("nhapbangdiem", {
    header: "header",
    thongbao: "thongbao",
  });
});

// ban can su route
app.get("/bancansu", getDataCookieUserLogin, async (req, res) => {
  res.render("bancansu", {
    header: "header",
  });
});

// thong tin ca nhan route
app.get("/profile", getDataCookieUserLogin, async (req, res) => {
  res.render("edit-profile", {
    header: "header",
  });
});

// thong tin ca nhan route
app.get("/danhsachbangdiem", getDataCookieUserLogin, async (req, res) => {
  res.render("danhsachbangdiem", {
    header: "header",
  });
});
// API SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Log in --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/api/login", async (req, res) => {
  const data = req.body;
  // 403: sai mat khau
  // log in database {
  // usr: 18102003
  // pass: 18102003
  // }
  // data = {usr: bbp, pass: 1234567890}
  console.log("SYSTEM | LOG_IN | Dữ liệu nhận được: ", data);
  try {
    //(log in database)
    // tìm pass của user_id trong database theo data.usr

    if (n_result.pass == data.pass) {
      set_cookies(res, data.usr, data.pass); // set cookies
      res.end("Log in success!!!");
    } else {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Log in fail!!!");
    }
  } catch (err) {
    console.log("SYSTEM | LOG_IN | ERROR | ", err);
    res.sendStatus(500);
  }
});

// Logout /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/api/logout", async (req, res) => {
  try {
    const data = req.body;
    console.log("SYSTEM | LOGOUT | Dữ liệu nhận được: ", data);
    const expirationDate = new Date("2018-12-31");
    res.cookie("account", data.account, {
      expires: expirationDate, // Cookie will permernently expire
      secure: true,
      sameSite: "none",
      domain: "localhost",
      // domain: 'c22c-2a09-bac5-d44d-18d2-00-279-87.ngrok-free.app',
      path: "/",
    });
    res.writeHead(200, { "Content-Type": "text/plain" });
    console.log(`SYSTEM | LOGOUT | Dang xuat thành công`);
    res.end("Da dang xuat!");
  } catch (err) {
    res.sendStatus(500);
    console.log("SYSTEM | LOGOUT | ERROR | ", err);
  }
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

app.get("*", getDataCookieUserLogin, async function (req, res) {
  res.sendStatus(404);
});

app.listen(port, async () => {
  console.log(
    `SYSTEM | LOG | Đang chạy server siu cấp vip pro đa vũ trụ ở http://localhost:${port}`
  );
});
