const express = require("express");
const router = express.Router();
const server = require("../lib/csdl_google_lib");
const { checkIfUserLoginRoute, sortStudentName } = require("../lib/function_lib");
const { getNameGlobal } = require("../lib/mogodb_lib");
const name_global_databases = getNameGlobal();
function createTeacherRouter(client) {
  // giao vien route
  router.get("/quanlyquyen", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;
    return res.render("teacher-manage-student", {
      header: "global-header",
      footer: "global-footer",
      thongbao: "global-notifications",
      cls: user.cls,
    });
  });
  // danh sach bang diem co van
  router.get("/danhsachbangdiem", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;

      const school_year = await client
        .db(name_global_databases)
        .collection("school_year")
        .findOne({}, { projection: { _id: 0, year: 1 } });
      // check user login:
      if (user.pow[1]) {
        const years = await client
          .db(name_global_databases)
          .collection("classes")
          .findOne({ _id: user.cls[0] }, { projection: { _id: 0, years: 1 } });

        // get all student in staff member class:
        const student_list = sortStudentName(
          await client
            .db(name_global_databases)
            .collection("user_info")
            .find(
              { class: user.cls[0], "power.0": { $exists: true } },
              { projection: { first_name: 1, last_name: 1 } }
            )
            .toArray()
        );
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
          curr_year: school_year.year,
        };
        for (student of student_list) {
          const curr_student_score = await client
            .db(user.dep)
            .collection(user.cls[0] + "_std_table")
            .findOne(
              {
                mssv: student._id,
                school_year: school_year.year,
              },
              {
                projection: { total: 1 },
              }
            );
          const curr_staff_score = await client
            .db(user.dep)
            .collection(user.cls[0] + "_stf_table")
            .findOne(
              {
                mssv: student._id,
                school_year: school_year.year,
              },
              {
                projection: {
                  total: 1,
                  marker: 1,
                },
              }
            );
          const curr_department_score = await client
            .db(user.dep)
            .collection(user.cls[0] + "_dep_table")
            .findOne(
              {
                mssv: student._id,
                school_year: school_year.year,
              },
              {
                projection: { total: 1 },
              }
            );
          // student
          if (curr_student_score) {
            render.student_scores.push(curr_student_score.total);
          } else {
            render.student_scores.push("-");
          }
          // staff member
          if (curr_staff_score) {
            render.staff_scores.push(curr_staff_score.total);
            render.staff_name.push(curr_staff_score.marker);
          } else {
            render.staff_scores.push("-");
            render.staff_name.push("-");
          }
          // department
          if (curr_department_score) {
            render.department_scores.push(curr_department_score.total);
          } else {
            render.department_scores.push("-");
          }
        }

        return res.render("teacher-grade-list", render);
      } else {
        // user not staff members
        // redirect to home
        return res.redirect("/");
      }
    } catch (e) {
      console.log("SYSTEM | BAN_CAN_SU_DANH_SACH_BANG_DIEM | ERROR | ", e);
    }
  });

  return router;
}
module.exports = createTeacherRouter;
