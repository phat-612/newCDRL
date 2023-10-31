const express = require("express");
const router = express.Router();
const { checkIfUserLoginRoute } = require("../lib/function_lib");
const { getNameGlobal } = require("../lib/mogodb_lib");
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
        if (user.cls[0]) {
          console.log(user);
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

            const studentActivities = await Promise.all(
              schoolYearsToSearch.map(async (year) => {
                info_search = `student_list.${user._id}`;
                console.log(info_search);
                let activitie_info_lop = await client
                  .db(user.dep)
                  .collection(`${user.cls[0]}_activities`)
                  .findOne(
                    {
                      [info_search]: { $exists: true },
                      year: year,
                    },
                    { projection: { name: 1, student_list: 1, ai: 1, level: 1 } }
                  );
                if (activitie_info_lop) {
                  if (activitie_info_lop.ai && activitie_info_lop.ai[user._id]) {
                    activitie_info_lop.thamgia = true;
                  }
                  if (activitie_info_lop.student_list[user._id] == 2) {
                    activitie_info_lop.khenthuong = true;
                  }
                }
                let activitie_info_khoa = await client
                  .db(user.dep)
                  .collection("activities")
                  .findOne(
                    {
                      [info_search]: { $exists: true },
                      year: year,
                    },
                    { projection: { name: 1, student_list: 1, ai: 1, level: 1 } }
                  );
                if (activitie_info_khoa) {
                  if (activitie_info_khoa.ai && activitie_info_khoa.ai[user._id]) {
                    activitie_info_khoa.thamgia = true;
                  }
                  if (activitie_info_khoa.student_list[user._id] == 2) {
                    activitie_info_khoa.khenthuong = true;
                  }
                }
                let activitie_info_truong = await client
                  .db(name_global_databases)
                  .collection("activities")
                  .findOne(
                    {
                      [info_search]: { $exists: true },
                      year: year,
                    },
                    { projection: { name: 1, student_list: 1, ai: 1, level: 1 } }
                  );
                if (activitie_info_truong) {
                  if (activitie_info_truong.ai && activitie_info_truong.ai[user._id]) {
                    activitie_info_truong.thamgia = true;
                  }
                  if (activitie_info_truong.student_list[user._id] == 2) {
                    activitie_info_truong.khenthuong = true;
                  }
                }

                return {
                  year: year,
                  activitie_info_lop: activitie_info_lop,
                  activitie_info_khoa: activitie_info_khoa,
                  activitie_info_truong: activitie_info_truong,
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
                hoatdong: studentActivities,
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
                hoatdong: studentActivities,
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
                hoatdong: studentActivities,

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
                hoatdong: studentActivities,

                nienkhoa: Object.keys(schoolYear_all.years),
              });
            }
          } else {
            return res.status(403).send("Sinh viên đã tốt nghiệp");
          }
        } else {
          return res.sendStatus(403).send("Sinh viên đã tốt nghiệp");
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
    console.log(user);
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

  router.get("/dangkyhoatdong", checkIfUserLoginRoute, async (req, res) => {
    try {
      const query = req.query;
      const user = req.session.user;
      let activitie_info;
      // console.log(user);
      if (query.id && query.level) {
        switch (query.level) {
          case "lop":
            if (user.pow[0]) {
              activitie_info = await client
                .db(user.dep)
                .collection(`${user.cls[0]}_activities`)
                .findOne({
                  _id: query.id,
                });
            } else {
              const collections = await client.db(user.dep).listCollections().toArray();
              // Filter collections ending with '_activities'
              const activityCollections = await collections.filter((collection) =>
                collection.name.endsWith("_activities")
              );
              // Loop through activity collections and retrieve all documents
              for (const activityCollection of activityCollections) {
                activitie_info = await client
                  .db(user.dep)
                  .collection(activityCollection.name)
                  .findOne({
                    _id: query.id,
                  });
                if (activitie_info) {
                  break; // Thoát khỏi vòng lặp khi tìm thấy kết quả
                }
              }
            }
            break;
          case "khoa":
            activitie_info = await client.db(user.dep).collection("activities").findOne({
              _id: query.id,
            });
            break;
          case "truong":
            activitie_info = await client
              .db(name_global_databases)
              .collection("activities")
              .findOne({
                _id: query.id,
              });
              break;

        }
        if (!activitie_info) {
          return res.status(404).send("Not Found");
        }
        activitie_info.join = false;
        activitie_info.diemdanh = false;
        if (activitie_info.student_list) {
          const list_student = Object.keys(activitie_info.student_list);
          let info_student = [];
          for (let i = 0; i < list_student.length; i++) {
            info_student.push(
              await client
                .db(name_global_databases)
                .collection("user_info")
                .findOne(
                  {
                    _id: list_student[i],
                  },
                  { projection: { first_name: 1, last_name: 1, class: 1 } }
                ) // khò khò
            );
          }
          activitie_info.info_student = info_student;
          if (user._id in activitie_info.student_list) {
            activitie_info.join = true;
          }
          if (activitie_info.ai && user._id in activitie_info.ai && activitie_info.ai[user._id]) {
            activitie_info.diemdanh = true;
          }
        }
        // console.log(activitie_info);
        return res.render("sinhvien-activeregistration", {
          header: "global-header",
          thongbao: "global-notifications",
          footer: "global-footer",
          activitie_info: activitie_info,
          id_acti: query.id,
        });
      } else {
        return res.redirect("/");
      }
    } catch (err) {
      return console.log("SYSTEM | HOAT_DONG_DANG_KY_ROUTE | ERROR | ", err);
    }
  });

  // 403 route
  router.get("/403", async (req, res) => {
    return res.render("index.ejs", {});
  });

  return router;
}
module.exports = createRootRouter;
