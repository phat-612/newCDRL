const express = require("express");
const router = express.Router();
const server = require("../lib/csdl_google_lib");
const { checkIfUserLoginRoute, sortStudentName } = require("../lib/function_lib");
const { getNameGlobal } = require("../lib/mogodb_lib");
const name_global_databases = getNameGlobal();
function createStaffRouter(client) {
  // ban can su nhap diem route
  router.get("/nhapdiemdanhgia", checkIfUserLoginRoute, async (req, res) => {
    try {
      const user = req.session.user;
      const mssv = req.query.studentId;
      const schoolYearParam = req.query.schoolYear;

      let studentTotalScore = await client
        .db(user.dep)
        .collection(user.cls[0] + "_std_table")
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam,
          },
          {
            projection: {
              _id: 0,
              first: 1,
              second: 1,
              third: 1,
              fourth: 1,
              fifth: 1,
              total: 1,
              img_ids: 1,
            },
          }
        );

      let stfTotalScore = await client
        .db(user.dep)
        .collection(user.cls[0] + "_stf_table")
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam,
          },
          {
            projection: {
              _id: 0,
              first: 1,
              second: 1,
              third: 1,
              fourth: 1,
              fifth: 1,
              total: 1,
              img_ids: 1,
            },
          }
        );

      let depTotalScore = await client
        .db(user.dep)
        .collection(user.cls[0] + "_dep_table")
        .findOne(
          {
            mssv: mssv,
            school_year: schoolYearParam,
          },
          {
            projection: {
              _id: 0,
              first: 1,
              second: 1,
              third: 1,
              fourth: 1,
              fifth: 1,
              total: 1,
              limg_ids: 1,
            },
          }
        );
      
      nulltable = {
        fifth: ["Chưa chấm", "Chưa chấm", "Chưa chấm", "Chưa chấm"],
        first: ["Chưa chấm", "Chưa chấm", "Chưa chấm", "Chưa chấm", "Chưa chấm"],
        fourth: ["Chưa chấm", "Chưa chấm", "Chưa chấm"],
        second: ["Chưa chấm", "Chưa chấm"],
        third: ["Chưa chấm", "Chưa chấm", "Chưa chấm"],
        total: "Chưa chấm",
      };

      if (!stfTotalScore) {
        stfTotalScore = nulltable;
      }
      if (!depTotalScore) {
        depTotalScore = nulltable;
      }
      let link_img = [];
      let std_act_img = {};
      let stf_act_img = {};
      let dep_act_img = {};

      if (studentTotalScore) {
        for (const [key, value] of Object.entries(studentTotalScore.img_ids)) {
          if (key == "global") {
            for (const i of value) {
              link_img.push(await server.getDriveFileLinkAndDescription(i));
            }
          } else {
            let activitie_info;
            activitie_info = await client
              .db(user.dep)
              .collection(`${user.cls[0]}_activities`)
              .findOne(
                {
                  _id: key,
                },
                { projection: { name: 1 } }
              );
            if (activitie_info) {
              for (const i of value) {
                let imginfo = await server.getDriveFileLinkAndDescription(i);
                if (std_act_img[activitie_info.name] && imginfo) {
                  std_act_img[activitie_info.name].push(imginfo);
                } else if (imginfo) {
                  std_act_img[activitie_info.name] = [imginfo];
                }
              }
            } else {
              activitie_info = await client
                .db(user.dep)
                .collection("activities")
                .findOne(
                  {
                    _id: key,
                  },
                  { projection: { name: 1 } }
                );

              if (activitie_info) {
                for (const i of value) {
                  let imginfo = await server.getDriveFileLinkAndDescription(i);
                  if (stf_act_img[activitie_info.name] && imginfo) {
                    stf_act_img[activitie_info.name].push(imginfo);
                  } else if (imginfo) {
                    stf_act_img[activitie_info.name] = [imginfo];
                  }
                }
              } else {
                activitie_info = await client
                  .db(name_global_databases)
                  .collection("activities")
                  .findOne(
                    {
                      _id: key,
                    },
                    { projection: { name: 1 } }
                  );

                if (activitie_info) {
                  for (const i of value) {
                    let imginfo = await server.getDriveFileLinkAndDescription(i);
                    if (dep_act_img[activitie_info.name] && imginfo) {
                      dep_act_img[activitie_info.name].push(imginfo);
                    } else if (imginfo) {
                      dep_act_img[activitie_info.name] = [imginfo];
                    }
                  }
                }
              }
            }
          }
        }

        return res.render("bancansu-manage-grades", {
          header: "global-header",
          thongbao: "global-notifications",
          footer: "global-footer",
          Scorestd: studentTotalScore,
          Score: stfTotalScore,
          Scorek: depTotalScore,
          link_img: link_img,
          std_act_img: std_act_img,
          stf_act_img: stf_act_img,
          dep_act_img: dep_act_img,
        });
      } else {
        return res.sendStatus(404);
      }
    } catch (err) {
      console.log("SYSTEM | BAN_CAN_SU_NHAP_DIEM_ROUTE | ERROR | ", err);
      return res.status(500).json({ error: "Lỗi hệ thống" });
    }
  });

  router.get("/quanlihoatdong", checkIfUserLoginRoute, async (req, res) => {
    const user = req.session.user;

    const school_year = await client
      .db(name_global_databases)
      .collection("school_year")
      .findOne({}, { projection: { _id: 0, year: 1 } });
    // check user login:
    if (user.pow[3] ) {
      let branch_list = await client
        .db(name_global_databases)
        .collection("branchs")
        .find({ dep: user.dep }, { projection: { _id: 1, name: 1 } })
        .toArray();

      const classlist = await client
        .db(name_global_databases)
        .collection("classes")
        .find(
          { branch: { $in: branch_list.map((branch) => branch._id) } },
          { projection: { _id: 1, branch: 1 } }
        )
        .toArray();

      const years = await client
        .db(name_global_databases)
        .collection("classes")
        .findOne({ _id: classlist[0]._id }, { projection: { _id: 0, years: 1 } });

      // get all activities of school
      const school_atv = await client
        .db(name_global_databases)
        .collection("activities")
        .find(
          {
            year: school_year.year
          },
          {
            projection: {
              name: 1,
              content: 1,
              year: 1,
              start_time: 1
            },
          }
        )
        .limit(10)
        .toArray();

      // get all activities of dep
      const dep_atv = await client
        .db(user.dep)
        .collection("activities")
        .find(
          {
            year: school_year.year
          },
          {
            projection: {
              name: 1,
              content: 1,
              year: 1,
              start_time: 1,
            },
          }
        )
        .limit(10)
        .toArray();

      // get all activities of class of department
      const collections = await client.db(user.dep).listCollections().toArray();

      // Filter collections ending with '_activities'
      const activityCollections = collections.filter((collection) =>
        collection.name.endsWith("_activities")
      );

      // Loop through activity collections and retrieve all documents
      const cls_atvs = await activityCollections.map(async (collection) => {
        const dummy = await client
          .db(user.dep)
          .collection(collection.name)
          .find(
            {
              year: school_year.year
            },
            {
              projection: {
                name: 1,
                content: 1,
                cls: 1,
                year: 1,
                start_time: 1,
              },
            }
          )
          .limit(10)
          .toArray();
        return dummy;
      });
      Promise.all(cls_atvs)
        .then((results) => {
          // Khi tất cả các promise đã hoàn thành, results sẽ là một mảng chứa kết quả từ mỗi truy vấn.
          // Bạn có thể làm gì đó với kết quả ở đây.
          
          const cls_atv = [].concat(...results); // Kết hợp kết quả từ các truy vấn vào một mảng duy nhất
          
          return res.render("bancansu-manage-activities", {
            header: "global-header",
            footer: "global-footer",
            thongbao: "global-notifications",
            cls: classlist,
            years: years.years,
            curr_year: school_year.year,
            branch: branch_list,
            school_atv: school_atv,
            dep_atv: dep_atv,
            cls_atv: cls_atv,
          });
        })
        .catch((error) => {
          // Xử lý lỗi nếu có
          console.log(error);
        });
    } else {
      return res.sendStatus(403);
    }
  });

  // danh gia hoat dong
  router.get("/quanlihoatdong/danhgiahoatdong", checkIfUserLoginRoute, async (req, res) => {
    return res.render("bancansu-activity-assessment", {
      header: "global-header",
      footer: "global-footer",
    });
  });

  // danh sach bang diem
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
              { projection: { first_name: 1, last_name: 1, total_score: 1 } }
            )
            .toArray()
        );
        // get all student total score from themself:
        let render = {
          header: "global-header",
          footer: "global-footer",
          thongbao: "global-notifications",
          student_list: student_list,
          cls: user.cls,
          years: years.years,
          curr_year: school_year.year,
        };

        return res.render("bancansu-grade-list", render);
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
module.exports = createStaffRouter;
