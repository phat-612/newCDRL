$('.login_btn').on('click', async function (e) {
    const mssv = $('.mssv_input').val();
    const password = $('.password_input').val();
    if (mssv == "") {
        notify("!", "Vui lòng nhập mssv!");
    } else if (password == "") {
        notify("!", "Vui lòng nhập password!");
        // thong bao: n, chu y: !, loi: x
    } else {
        try {
            let postData = JSON.stringify({
                remember: $('#morning').prop('checked'),
                mssv: mssv,
                password: password
            });
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: postData
            };
            const response = await fetch('/api/login', requestOptions);
            if (response.ok) {
                const datareturn = await response.json();
                if (datareturn.check) {
                    window.location.href = currentURLbase + "/login/updateyourpasswords";
                } else {
                    window.location.href = currentURLbase + "/";

                }
            }
            else if (response.status == 403) {
                // Error occurred during upload
                notify('!', 'Sai thông tin đăng nhập');
            } else if (response.status == 404) {
                notify('x', 'Đã đăng nhập rồi!');
            }
        } catch (error) {
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }

    }
});
