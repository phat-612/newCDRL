const express = require('express');
const router = express.Router();
const { checkIfUserLoginRoute } = require('../lib/function_lib');
const { getNameGlobal } = require('../lib/mogodb_lib');
const name_global_databases = getNameGlobal();
require('dotenv').config();
const publicKey = process.env.PUBLIC_KEY;

function createProfileRouter(client) {
    // thong tin ca nhan route
    router.get('/', checkIfUserLoginRoute, async (req, res) => {
        const user = req.session.user;
        const user_info = await client
            .db(name_global_databases)
            .collection('user_info')
            .findOne({ _id: req.session.user._id }, { projection: { last_name: 1, first_name: 1, email: 1 } });

        return res.render('global-edit-profile', {
            header: 'global-header',
            footer: 'global-footer',
            menu: 'doankhoa-menu',
            name: user_info.last_name + ' ' + user_info.first_name,
            mssv: user_info._id,
            email: user_info.email,
            quyen: user,
            thongbao: 'global-notifications',
        });
    });
    // doi password route
    router.get('/change_pass', checkIfUserLoginRoute, async (req, res) => {
        const user = req.session.user;
        return res.render('global-change-password', {
            header: 'global-header',
            thongbao: 'global-notifications',
            menu: 'doankhoa-menu',
            quyen: user,
            footer: 'global-footer',
            secretKey: publicKey,
        });
    });
    return router;
}
module.exports = createProfileRouter;
