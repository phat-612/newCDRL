app.get("/", checkIfUserLoginRoute, async (req, res) => {
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
        for (
          let i = 0;
          i < schoolYear_all.years[schoolYear.year.slice(4)].length;
          i++
        ) {
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
              const stdCollection = client
                .db(user.dep)
                .collection(user.cls[0] + "_std_table");
              const stdDocument = await stdCollection.findOne(
                { mssv: user._id, school_year: year },
                { projection: { _id: 0, total: 1 } }
              );

              if (stdDocument) {
                studentTotalScore = stdDocument.total;
              } else {
                // Nếu không tìm thấy, tìm trong bảng '_stf_table'
                const stfCollection = client
                  .db(user.dep)
                  .collection("_stf_table");
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
          res.render("sinhvien-index", {
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
          !user.pow[3] &&
          !user.pow[4] &&
          !user.pow[5] &&
          !user.pow[6] &&
          !user.pow[7] &&
          !user.pow[8]
        ) {
          res.render("bancansu-index", {
            header: "global-header",
            footer: "global-footer",
            thongbao: "global-notifications",
            bandiem: studentTotalScores,
            nienkhoa: Object.keys(schoolYear_all.years),
          });
        }
      } else {
        res.status(403).send("Sinh viên đã tốt nghiệp");
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
        res.render("teacher-index", {
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
        res.render("doankhoa-index", {
          header: "global-header",
          footer: "global-footer",
          menu: "doankhoa_menu",
        });
      }
      //cc
    }
  } catch (err) {
    console.log("SYSTEM | INDEX_ROUTE | ERROR | ", err);
  }
});
