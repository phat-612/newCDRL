const express = require("express");
const router = express.Router();
const { checkIfUserLoginRoute } = require("../lib/function_lib");
const { getNameGlobal } = require('../lib/mogodb_lib');
const name_global_databases = getNameGlobal();
function createRootRouter(client) {
  // index route
  router.get("/", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;
      if (user.pow[0]) {
        const schoolYear = await client
          .db(name_global_databases)
          .collection("school_year")
          .findOne({}, { projection: { _id: 0, year: 1 } });
        const schoolYear_all = await client
          .db(name_global_databases)
          .collection("classes")
          .findOne({ _id: user.cls[0] }, { projection: { _id: 0, years: 1 } });
        let schoolYearsToSearch = [];
        if (schoolYear_all.years[schoolYear.year.slice(4)]) {
          for (let i = 0; i < schoolYear_all.years[schoolYear.year.slice(4)].length; i++) {
            schoolYearsToSearch.push(`HK${i + 1}_` + schoolYear.year.slice(4));
          }
          const studentTotalScores = await Promise.all(
            schoolYearsToSearch.map(async (year) => {
              let studentTotalScore = null;

              // Tìm trong bảng '_dep_table' trước
              const depCollection = client.db(user.dep).collection("_dep_table");
              const depDocument = await depCollection.findOne(
                { mssv: user._id, school_year: year },
                { projection: { _id: 0, total: 1 } }
              );

              if (depDocument) {
                studentTotalScore = depDocument.total;
              } else {
                // Nếu không tìm thấy, tìm trong bảng '_std_table'
                const stdCollection = client.db(user.dep).collection(user.cls[0] + "_std_table");
                const stdDocument = await stdCollection.findOne(
                  { mssv: user._id, school_year: year },
                  { projection: { _id: 0, total: 1 } }
                );

                if (stdDocument) {
                  studentTotalScore = stdDocument.total;
                } else {
                  // Nếu không tìm thấy, tìm trong bảng '_stf_table'
                  const stfCollection = client.db(user.dep).collection("_stf_table");
                  const stfDocument = await stfCollection.findOne(
                    { mssv: user._id, school_year: year },
                    { projection: { _id: 0, total: 1 } }
                  );

                  if (stfDocument) {
                    studentTotalScore = stfDocument.total;
                  }
                }
              }
              return {
                year: year,
                total: studentTotalScore ? studentTotalScore : "Chưa có điểm",
              };
            })
          );
          if (
            user.pow[0] &&
            !user.pow[1] &&
            !user.pow[2] &&
            !user.pow[3] &&
            !user.pow[4] &&
            !user.pow[5] &&
            !user.pow[6] &&
            !user.pow[7] &&
            !user.pow[8]
          ) {
            return res.render("sinhvien-index", {
              header: "global-header",
              footer: "global-footer",
              thongbao: "global-notifications",
              bandiem: studentTotalScores,
              nienkhoa: Object.keys(schoolYear_all.years),
            });
          } else if (
            user.pow[0] &&
            user.pow[1] &&
            !user.pow[2] &&
            user.pow[3] &&
            !user.pow[4] &&
            !user.pow[5] &&
            !user.pow[6] &&
            !user.pow[7] &&
            !user.pow[8]
          ) {
            return res.render("bancansu-index", {
              header: "global-header",
              footer: "global-footer",
              thongbao: "global-notifications",
              pow: 0,
              bandiem: studentTotalScores,
              nienkhoa: Object.keys(schoolYear_all.years),
            });
          } else if (
            user.pow[0] &&
            user.pow[1] &&
            !user.pow[2] &&
            !user.pow[3] &&
            !user.pow[4] &&
            !user.pow[5] &&
            !user.pow[6] &&
            !user.pow[7] &&
            !user.pow[8]
          ) {
            return res.render("bancansu-index", {
              header: "global-header",
              footer: "global-footer",
              thongbao: "global-notifications",
              pow: 1,
              bandiem: studentTotalScores,
              nienkhoa: Object.keys(schoolYear_all.years),
            });
          } else if (
            user.pow[0] &&
            !user.pow[1] &&
            !user.pow[2] &&
            user.pow[3] &&
            !user.pow[4] &&
            !user.pow[5] &&
            !user.pow[6] &&
            !user.pow[7] &&
            !user.pow[8]
          ) {
            return res.render("bancansu-index", {
              header: "global-header",
              footer: "global-footer",
              thongbao: "global-notifications",
              pow: 2,
              bandiem: studentTotalScores,
              nienkhoa: Object.keys(schoolYear_all.years),
            });
          }
        } else {
          return res.status(403).send("Sinh viên đã tốt nghiệp");
        }
      } else {
        if (
          !user.pow[0] &&
          user.pow[1] &&
          !user.pow[2] &&
          user.pow[3] &&
          user.pow[4] &&
          !user.pow[5] &&
          !user.pow[6] &&
          !user.pow[7] &&
          !user.pow[8]
        ) {
          return res.render("teacher-index", {
            header: "global-header",
            footer: "global-footer",
          });
        } else if (
          !user.pow[0] &&
          !user.pow[1] &&
          user.pow[2] &&
          user.pow[3] &&
          user.pow[4] &&
          user.pow[5] &&
          user.pow[6] &&
          user.pow[7] &&
          user.pow[8]
        ) {
          return res.render("doankhoa-index", {
            header: "global-header",
            footer: "global-footer",
            menu: "doankhoa-menu",
          });
        }
        //cc
      }
    } catch (err) {
      console.log("SYSTEM | INDEX_ROUTE | ERROR | ", err);
    }
  });

  // xac thuc route
  router.get("/verifyOTP", async (req, res) => {
    try {
      const user = req.session.user;
      if (user) {
        return res.redirect("/");
      }
      const mssv = req.query.mssv;
      const dataUser = await client
        .db(name_global_databases)
        .collection("user_info")
        .findOne({ _id: mssv }, { projection: { _id: 0, email: 1 } });
      let emailToShow = "";
      if (dataUser) {
        const email = dataUser.email;
        emailToShow =
          email.substring(0, 3) +
          "*".repeat(email.indexOf("@") - 3) +
          email.substring(email.indexOf("@"));
      }
      return res.render("global-verify-otp", {
        header: "global-header",
        footer: "global-footer",
        avt: null,
        thongbao: "global-notifications",
        email: emailToShow,
      });
    } catch (err) {
      console.log("SYSTEM | OTP_ROUTE | ERROR | ", err);
      return res.render("global-verify-otp", {
        header: "global-header",
        footer: "global-footer",
        avt: null,
        thongbao: "global-notifications",
        email: "",
      });
    }
  });

  // Quen mat khau
  router.get("/quenmatkhau", async (req, res) => {
    const user = req.session.user;
    if (user) {
      return res.redirect("/");
    }
    return res.render("global-forgot-password", {
      header: "global-header",
      footer: "global-footer",
      thongbao: "global-notifications",
      avt: null,
    });
  });

  // 403 route
  router.get("/403", async (req, res) => {
    return res.render("index.ejs", {});
  });

  return router;
}
module.exports = createRootRouter;
