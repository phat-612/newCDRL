$('.login_btn').on('click', async function (e) {
    const new_password = $('.password_input').val();
    const re_new_password = $('.again_password_input').val();
    if (new_password == "") {
        notify("!", "Vui lòng nhập password mới!");
    } else if (re_new_password == "") {
        notify("!", "Vui lòng nhập lại password mới!");
    } else if (re_new_password !== new_password) {
        notify("x", "Password nhập lại không trùng, vui lòng kiểm tra lại");
    } else if (!/^.{6,}$/.test(new_password)) {
        notify('x', 'Password không đủ bảo mật\nYêu cầu mật khẩu có ít nhất 6 ký tự!');
    }
    else {
        try {
            let postData = JSON.stringify({
                new_password: new_password,
                re_new_password: re_new_password
            });
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: postData
            };
            const response = await fetch('/api/first_login', requestOptions);
            if (response.ok) {
                window.location.href = currentURLbase + "/";
            } else if (response.status == 403) {
                // Error occurred during upload
                notify('x', 'Password mới không được trùng password cũ!');
            }
        } catch (error) {
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }

    }
});
