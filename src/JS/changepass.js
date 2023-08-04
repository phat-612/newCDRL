$('.login_btn').on('click', async function (e) {
    const old_password = $('.old_password_input').val();
    const new_password = $('.password_input').val();
    const re_new_password = $('.again_password_input').val();
    if (old_password == "") {
        notify("!", "Vui lòng nhập mật khẩu cũ!");
    }else if(new_password == "") {
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
                old_password: old_password,
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
            const response = await fetch('/api/change_pass', requestOptions);
            if (response.ok) {
                
                notify('n', 'Đổi mật khẩu thành công!');
                
                setTimeout(() => {
                    window.location.href = currentURLbase + "/profile";
                }, 2000);
            } else if (response.status == 403) {
                // Error occurred during upload
                notify('x', 'Mật khẩu mới không được trùng mật khẩu cũ!');
            }
            else if (response.status == 404) {
                // Error occurred during upload
                notify('x', 'Mật khẩu cũ chưa đúng!!');
            }
        } catch (error) {
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }

    }
});
