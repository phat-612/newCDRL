$('.login_btn').on('click', async function (e) {
    const new_password = $('.password_input').val();
    const re_new_password = $('.again_password_input').val();
    if (new_password == "") {
        notify("!", "Vui lòng nhập mật khẩu mới!");
    } else if (re_new_password == "") {
        notify("!", "Vui lòng nhập lại mật khẩu mới!");
    } else if (re_new_password !== new_password) {
        notify("x", "Mật khẩu nhập lại không trùng, vui lòng kiểm tra lại");
    } else if (!/^.{6,}$/.test(new_password)) {
        notify('x', 'Mật khẩu không đủ bảo mật\nYêu cầu mật khẩu có ít nhất 6 ký tự!');
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
                notify('x', 'Mật khẩu mới không được trùng mật khẩu cũ!');
            }
        } catch (error) {
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }

    }
});