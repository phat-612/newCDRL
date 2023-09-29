const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const https = require("https");
const cookie = require("cookie");
const path = require("path");
const databaseLib = require("./lib/mogodb_lib");
const { blockUnwantedPaths } = require("./lib/function_lib");
const createRootRouter = require("./router/rootRouters");
const createLoginRouter = require("./router/loginRouters");
const createProfileRouter = require("./router/profileRouters");
const createApiRouter = require("./router/apiRouters");
const createDepRouter = require("./router/depRouters");
const createStaffRouter = require("./router/staff Routers");
const createTeacherRouter = require("./router/teacherRoutes");
const createStudentRouter = require("./router/studentRouter");

const MongoStore = require("connect-mongo");
const WebSocket = require("ws");

// ----------------------------------------------------------------
databaseLib
  .connect()
  .then((client) => {
    const app = express();
    const privateKey = fs.readFileSync(path.join(".certificate", "localhost.key"), "utf8");
    const certificate = fs.readFileSync(path.join(".certificate", "localhost.crt"), "utf8");
    const credentials = { key: privateKey, cert: certificate };
    // ----------------------------------------------------------------
    const port = 443;
    const secretKey = "5gB#2L1!8*1!0)$7vF@9";
    const authenticationKey = Buffer.from(secretKey.padEnd(32, "0"), "utf8").toString("hex");
    // ----------------------------------------------------------------
    // mongodb database name
    const name_global_databases = "global";
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    app.use(blockUnwantedPaths);
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ limit: "10mb", extended: true }));
    app.use(cors({ origin: true, credentials: true }));
    app.use(cookieParser());
    app.use(
      session({
        name: "howtosavealife?", // Đặt tên mới cho Session ID
        secret: authenticationKey,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client,
          dbName: name_global_databases,
          crypto: {
            secret: authenticationKey,
          },
        }),
        cookie: {
          secure: true,
          httpOnly: true,
          sameSite: "strict",
        },
        rolling: true,
      })
    );
    app.use(express.json());
    const parentDirectory = path.dirname(__dirname);
    app.use(express.static(parentDirectory));
    app.set("view engine", "ejs");
    app.set("views", path.join(parentDirectory, "views"));
    const httpsServer = https.createServer(credentials, app);
    const wss = new WebSocket.Server({ server: httpsServer });
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    const rootRouter = createRootRouter(client);
    const loginRouters = createLoginRouter(client);
    const profileRouter = createProfileRouter(client);
    const apiRouter = createApiRouter(client,wss);
    const depRouter = createDepRouter(client);
    const teacherRouter = createTeacherRouter(client);
    const staffRouter = createStaffRouter(client);
    const studentRouter = createStudentRouter(client);
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    app.use("/", rootRouter);
    app.use("/login", loginRouters);
    app.use("/profile", profileRouter);
    app.use("/api", apiRouter);
    app.use("/doankhoa", depRouter);
    app.use("/giaovien", teacherRouter);
    app.use("/bancansu", staffRouter);
    app.use("/hocsinh", studentRouter);

    // Xử lý đường link không có -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // app.get("*", async function (req, res) {
    //   return res.sendStatus(404);
    // });
    // // WEBSOCKET SPACE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    wss.on("connection", async (ws, req) => {
      // Kiểm tra địa chỉ đích của kết nối WebSocket
      if (req.url === "/howtosavealife?") {
        // console.log(`SYSTEM | WEBSOCKET | A new WebSocket connection is established.`);
        // Gán id cho ws
        if (req.headers.cookie) {
          const cookie_seasion = cookie.parse(req.headers.cookie);
          if ("howtosavealife?" in cookie_seasion) {
            ws.id = cookieParser.signedCookie(cookie_seasion["howtosavealife?"], authenticationKey);
            // Xử lý khi client gửi dữ liệu
            ws.on("message", (message) => {
              // console.log('SYSTEM | WEBSOCKET | Received message: ', message.toString('utf-8'));
              if (message.toString("utf-8") == "logout") {
                ws.close();
              } else if (message.toString("utf-8") == "ok ko e?") {
                ws.send("Ok a");
              }
            });

            // Xử lý khi client đóng kết nối
            ws.on("close", () => {
              // console.log('SYSTEM | WEBSOCKET | WebSocket connection closed for ' + ws.id);
            });
          } else {
            ws.send("Ko a");
            ws.close();
          }
        } else {
          ws.send("Ko a");
          ws.close();
        }
      } else {
        console.log("SYSTEM | WEBSOCKET | Rejected WebSocket connection from:", ws.id);
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
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
