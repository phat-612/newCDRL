const inputs = Array.prototype.slice.call(document.querySelectorAll('.container input:not([type="checkbox"]'));
const btn = document.querySelector('.login_form').querySelector('center');
$('.login_btn').on('click', async function (e) {
    e.preventDefault();

    sendata();
});

const sendata = async function () {
    btn.innerHTML = `<center>
                        <div class="login_btn">
                            Loading...
                            <span></span>
                        </div>
                    </center>`;
    const mssv = $('.mssv_input').val();
    const password = $('.password_input').val();
    if (mssv == '') {
        btn.innerHTML = `<center>
        <a class="login_btn">
            Đăng nhập
            <span></span>
        </a>
    </center>`;
        notify('!', 'Vui lòng nhập mssv!');
    } else if (password == '') {
        btn.innerHTML = `<center>
        <a class="login_btn">
            Đăng nhập
            <span></span>
        </a>
    </center>`;
        notify('!', 'Vui lòng nhập password!');
    } else {
        try {
            let postData = JSON.stringify({
                remember: $('#morning').prop('checked'),
                mssv: mssv,
                password: password,
            });
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: postData,
            };
            const response = await fetch('/api/login', requestOptions);
            if (response.ok) {
                const datareturn = await response.json();
                if (datareturn.check) {
                    window.location.href = currentURLbase + '/login/firstlogin';
                } else {
                    btn.innerHTML = `<center>
                                        <a class="login_btn">
                                            Đăng nhập
                                            <span></span>
                                        </a>
                                    </center>`;
                    window.location.href = '/';
                }
            } else if (response.status == 403) {
                btn.innerHTML = `<center>
                                        <a class="login_btn">
                                            Đăng nhập
                                            <span></span>
                                        </a>
                                    </center>`;
                // Error occurred during upload
                notify('!', 'Sai thông tin đăng nhập');
            } else if (response.status == 404) {
                btn.innerHTML = `<center>
                                        <a class="login_btn">
                                            Đăng nhập
                                            <span></span>
                                        </a>
                                    </center>`;
                window.location.href = '/';
            }
        } catch (error) {
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }
    }
};

nextInput(inputs, sendata);

const password_input = document.querySelector('.password_input');
const eye = document.querySelector('.eye');
password_input.oninput = () => {
    if (password_input.value === '') {
        password_input.parentElement.querySelector('.eye').style.display = 'none';
    } else {
        password_input.parentElement.querySelector('.eye').style.display = 'block';
    }
};

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
