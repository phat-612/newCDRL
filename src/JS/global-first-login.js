const inputs = Array.prototype.slice.call(document.querySelectorAll('.content input:not([type="checkbox"]'));
const btn = document.querySelector('.login_form').querySelector('center .login_btn');
$('.login_btn').on('click', async function (e) {
    e.preventDefault();

    sendata();
});

const sendata = async function () {
    btn.innerHTML = `Loading...
    <span></span>
`;
    const new_password = $('.password_input').val();
    const re_new_password = $('.again_password_input').val();
    if (new_password == '') {
        notify('!', 'Vui lòng nhập mật khẩu mới!');
        btn.innerHTML = `
              Kế tiếp
              <span></span>
            `;
    } else if (re_new_password == '') {
        notify('!', 'Vui lòng nhập lại mật khẩu mới!');
        btn.innerHTML = `
              Kế tiếp
              <span></span>
           `;
    } else if (re_new_password !== new_password) {
        notify('x', 'Mật khẩu nhập lại không trùng, vui lòng kiểm tra lại');
        btn.innerHTML = `
              Kế tiếp
              <span></span>
            `;
    } else if (!/^.{6,}$/.test(new_password)) {
        notify('x', 'Mật khẩu không đủ bảo mật\nYêu cầu mật khẩu có ít nhất 6 ký tự!');
        btn.innerHTML = `
              Kế tiếp
              <span></span>
           `;
    } else {
        try {
            let postData = JSON.stringify({
                new_password: new_password,
                re_new_password: re_new_password,
            });
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: postData,
            };
            const response = await fetch('/api/first_login', requestOptions);

            if (response.ok) {
                window.location.href = '/';
            } else if (response.status == 403) {
                // Error occurred during upload
                notify('x', 'Mật khẩu mới không được trùng mật khẩu cũ!');
                btn.innerHTML = `
                  Kế tiếp
                  <span></span>
                `;
            }
        } catch (error) {
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }
    }
};

const password_input = document.querySelector('.password_input');
const eye = document.querySelector('.eye');
password_input.oninput = () => {
    if (password_input.value === '') {
        password_input.parentElement.querySelector('.eye').style.display = 'none';
    } else {
        password_input.parentElement.querySelector('.eye').style.display = 'block';
    }
};
nextInput(inputs, sendata);

let check = 0;
eye.onclick = () => {
    if (!check) {
        eye.innerHTML = '<i class="fa-regular fa-eye"></i>';
        password_input.type = 'text';
        check = 1;
    } else {
        eye.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
        password_input.type = 'password';
        check = 0;
    }
};
document.addEventListener('keydown', async (event) => {
    const num = Number(event.keyCode);
    if (num && num == 13) {
        await sendata();
    }
});
