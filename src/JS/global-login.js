$('.login_btn').on('click', async function (e) {
    sendata();
});
const sendata = async function () {
    const mssv = $('.mssv_input').val();
    const password = $('.password_input').val();
    if (mssv == '') {
        notify('!', 'Vui lòng nhập mssv!');
    } else if (password == '') {
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
                    window.location.href = '/';
                }
            } else if (response.status == 403) {
                // Error occurred during upload
                notify('!', 'Sai thông tin đăng nhập');
            } else if (response.status == 404) {
                window.location.href = '/';
            }
        } catch (error) {
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }
    }
};
$('.password_input').on('keydown', async function (e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        $('.login_btn').click();
    }
});
nextInput(sendata);
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

// const inputs = Array.prototype.slice.call(document.querySelectorAll('.container input:not([type="checkbox"]'));
// inputs.forEach((input) => {
//     input.addEventListener('keydown', (event) => {
//         const num = Number(event.keyCode);
//         let check = true;
//         let next = true;
//         if (check && next && num && num == 13) {
//             // Only allow numbers
//             event.preventDefault();
//             check = focusNext();
//             console.log(check);
//             // next = true;
//         } else if (check == false && num && num == 13) {
//             console.log(next);
//             // next = false;
//             sendata();
//         }
//     });
// });

// function focusNext() {
//     const currInput = document.activeElement;
//     const currInputIndex = inputs.indexOf(currInput);
//     // const nextinputIndex = (currInputIndex + 1) % inputs.length;
//     const nextinputIndex = currInputIndex + 1;
//     const input = inputs[nextinputIndex];
//     if (input) {
//         console.log(input);
//         input.focus();
//         return true;
//     } else {
//         return false;
//     }
// }
