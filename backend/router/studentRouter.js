const express = require('express');
const router = express.Router();
const server = require('../lib/csdl_google_lib');
const { checkIfUserLoginRoute } = require('../lib/function_lib');
const { getNameGlobal } = require('../lib/mogodb_lib');
const name_global_databases = getNameGlobal();
function createStudentRouter(client) {
    // nhap bang diem route
    router.get('/nhapdiemdanhgia', checkIfUserLoginRoute, async (req, res) => {
        const school_year = await client
            .db(name_global_databases)
            .collection('school_year')
            .findOne(
                {},
                {
                    projection: {
                        _id: 0,
                        year: 1,
                        start_day: 1,
                        end_day: 1,
                    },
                },
            );
        let today = new Date().getTime();
        let start_day = new Date(school_year.start_day).getTime();
        let end_day = new Date(school_year.end_day).getTime();
        let forever_day = new Date('2003-10-18').getTime(); // special date

        // check if end mark time or not
        if (start_day <= today && (today < end_day || end_day == forever_day)) {
            return res.render('sinhvien-enter-grades', {
                header: 'global-header',
                thongbao: 'global-notifications',
                footer: 'global-footer',
            });
        } else {
            return res.redirect('/');
        }
    });

    // xem bang diem route
    router.get('/xembangdiem', checkIfUserLoginRoute, async (req, res) => {
        try {
            const user = req.session.user;
            let mssv;
            if (user.pow[1] || user.pow[2]) {
                if (user.pow[0]) {
                    if (req.query.mssv) {
                        mssv = req.query.mssv;
                    } else {
                        mssv = req.session.user._id;
                    }
                } else {
                    mssv = req.query.mssv;
                }
            } else {
                mssv = req.session.user._id;
            }
            const schoolYearParam = req.query.schoolYear;
            const studentTotalScore = await client
                .db(user.dep)
                .collection(user.cls[0] + '_std_table')
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
                    },
                );

            let stfTotalScore = await client
                .db(user.dep)
                .collection(user.cls[0] + '_stf_table')
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
                    },
                );

            let depTotalScore = await client
                .db(user.dep)
                .collection(user.cls[0] + '_dep_table')
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
                    },
                );
            nulltable = {
                fifth: ['Chưa chấm', 'Chưa chấm', 'Chưa chấm', 'Chưa chấm'],
                first: ['Chưa chấm', 'Chưa chấm', 'Chưa chấm', 'Chưa chấm', 'Chưa chấm'],
                fourth: ['Chưa chấm', 'Chưa chấm', 'Chưa chấm'],
                second: ['Chưa chấm', 'Chưa chấm'],
                third: ['Chưa chấm', 'Chưa chấm', 'Chưa chấm'],
                total: 'Chưa chấm',
            };
            if (!stfTotalScore) {
                stfTotalScore = nulltable;
            }
            if (!depTotalScore) {
                depTotalScore = nulltable;
            }
            let link_img = [];
            if (studentTotalScore) {
                for (const [key, value] of Object.entries(studentTotalScore.img_ids)) {
                    if (key == 'global') {
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
                                { projection: { name: 1 } },
                            );
                        if (!activitie_info) {
                            activitie_info = await client
                                .db(user.dep)
                                .collection('activities')
                                .findOne(
                                    {
                                        _id: key,
                                    },
                                    { projection: { name: 1 } },
                                );
                            if (!activitie_info) {
                                activitie_info = await client
                                    .db(name_global_databases)
                                    .collection('activities')
                                    .findOne(
                                        {
                                            _id: key,
                                        },
                                        { projection: { name: 1 } },
                                    );
                            }
                        }
                        if (activitie_info) {
                            for (const i of value) {
                                let imginfo = await server.getDriveFileLinkAndDescription(i);
                                if (imginfo) {
                                    imginfo.fileDescription = activitie_info.name + '-' + imginfo.fileDescription;
                                    link_img.push(imginfo);
                                }
                            }
                        }
                    }
                }

                return res.render('sinhvien-view-grades', {
                    header: 'global-header',
                    thongbao: 'global-notifications',
                    footer: 'global-footer',
                    Scorestd: studentTotalScore,
                    Score: stfTotalScore,
                    Scorek: depTotalScore,
                    img: link_img,
                });
            } else {
                return res.sendStatus(404);
            }
        } catch (err) {
            console.log('SYSTEM | XEM_BANG_DIEM_ROUTE | ERROR | ', err);
            return res.status(500).json({ error: 'Lỗi hệ thống' });
        }
    });

    return router;
}
module.exports = createStudentRouter;
