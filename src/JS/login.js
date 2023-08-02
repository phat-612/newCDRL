$('.login_btn').on('click', async function (e) {
    if ($('.mssv_input').val() == "") {
        notify("!", "Vui lòng nhập mssv!");
    } else if ($('.password_input').val() == "") {
        notify("!", "Vui lòng nhập password!");
        // thong bao: n, chu y: !, loi: x
    } else {
        try {
            let postData = JSON.stringify({
                remember: $('#morning').prop('checked'),
                mssv: $('.mssv_input').val(),
                password: $('.password_input').val()
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
                window.location.href = currentURLbase + "/";
            } else if (response.status == 403) {
                // Error occurred during upload
                notify('!', 'Sai thông tin đăng nhập');
            }
        } catch (error) {
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }

    }
});

if (($('.mssv_input').val() != "") || ($('.password_input').val() != "")) {
    const input = $('.mssv_input');
    let defaultValue = input.prop('defaultValue');
    let currentValue = input.val();
    console.log(defaultValue,currentValue)
    if (defaultValue !== currentValue) {
        console.log('dsa');
    }
    // $('.user-box').addClass('valid');;
}
