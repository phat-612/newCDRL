const express = require('express');
const router = express.Router();
const server = require('../lib/csdl_google_lib');
const { checkIfUserLoginRoute, sortStudentName } = require('../lib/function_lib');
const { getNameGlobal } = require('../lib/mogodb_lib');
const name_global_databases = getNameGlobal();
function createTeacherRouter(client) {
    // giao vien route
    router.get('/quanlyquyen', checkIfUserLoginRoute, async (req, res) => {
        const user = req.session.user;
        return res.render('teacher-manage-student', {
            header: 'global-header',
            footer: 'global-footer',
            thongbao: 'global-notifications',
            cls: user.cls,
        });
    });
    // danh sach bang diem co van
    router.get('/danhsachbangdiem', checkIfUserLoginRoute, async (req, res) => {
        try {
            const user = req.session.user;

            const school_year = await client
                .db(name_global_databases)
                .collection('school_year')
                .findOne({}, { projection: { _id: 0, year: 1 } });
            // check user login:
            if (user.pow[1]) {
                const years = await client
                    .db(name_global_databases)
                    .collection('classes')
                    .findOne({ _id: user.cls[0] }, { projection: { _id: 0, years: 1 } });

                // get all student in staff member class:
                const student_list = sortStudentName(
                    await client
                        .db(name_global_databases)
                        .collection('user_info')
                        .find(
                            { class: user.cls[0], 'power.0': { $exists: true } },
                            {
                                projection: {
                                    first_name: 1,
                                    last_name: 1,
                                    class: 1,
                                    total_score: 1,
                                },
                            },
                        )
                        .toArray(),
                );
                // get all student total score from themself:
                let render = {
                    header: 'global-header',
                    footer: 'global-footer',
                    thongbao: 'global-notifications',
                    student_list: student_list,
                    cls: user.cls,
                    years: years.years,
                    curr_year: school_year.year,
                };

                return res.render('teacher-grade-list', render);
            } else {
                // user not staff members
                // redirect to home
                return res.redirect('/');
            }
        } catch (e) {
            console.log('SYSTEM | BAN_CAN_SU_DANH_SACH_BANG_DIEM | ERROR | ', e);
        }
    });
    // quang ly hoat dong
    router.get('/quanlihoatdong', checkIfUserLoginRoute, async (req, res) => {
        const user = req.session.user;

        const school_year = await client
            .db(name_global_databases)
            .collection('school_year')
            .findOne({}, { projection: { _id: 0, year: 1 } });

        // check user login:

        let branch_list = await client
            .db(name_global_databases)
            .collection('branchs')
            .find({ dep: user.dep }, { projection: { _id: 1, name: 1 } })
            .toArray();

        const classlist = await client
            .db(name_global_databases)
            .collection('classes')
            .find({ branch: { $in: branch_list.map((branch) => branch._id) } }, { projection: { _id: 1, branch: 1 } })
            .toArray();

        const years = await client
            .db(name_global_databases)
            .collection('classes')
            .findOne({ _id: classlist[0]._id }, { projection: { _id: 0, years: 1 } });

        // get all activities of school
        const school_atv = await client
            .db(name_global_databases)
            .collection('activities')
            .find(
                {
                    year: school_year.year,
                },
                {
                    projection: {
                        name: 1,
                        content: 1,
                        year: 1,
                        start_time: 1,
                    },
                },
            )
            .limit(10)
            .toArray();

        // get all activities of dep
        const dep_atv = await client
            .db(user.dep)
            .collection('activities')
            .find(
                {
                    year: school_year.year,
                },
                {
                    projection: {
                        name: 1,
                        content: 1,
                        year: 1,
                        start_time: 1,
                    },
                },
            )
            .limit(10)
            .toArray();

        // get all activities of class of department
        const collections = await client.db(user.dep).listCollections().toArray();

        // Filter collections ending with '_activities'
        const activityCollections = collections.filter((collection) => collection.name.endsWith('_activities'));

        // Loop through activity collections and retrieve all documents
        const cls_atvs = await activityCollections.map(async (collection) => {
            const dummy = await client
                .db(user.dep)
                .collection(collection.name)
                .find(
                    {
                        year: school_year.year,
                    },
                    {
                        projection: {
                            name: 1,
                            content: 1,
                            cls: 1,
                            year: 1,
                            start_time: 1,
                        },
                    },
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
                return res.render('teacher-manager-activity', {
                    header: 'global-header',
                    footer: 'global-footer',
                    thongbao: 'global-notifications',
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
    });
    return router;
}
module.exports = createTeacherRouter;
