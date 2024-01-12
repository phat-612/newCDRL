/////// thông báo
const toast = document.querySelector('.toast');
const toast_icon = document.querySelector('.toast-content i');
const closeIcon = document.getElementById('close_thongbao');
const progress = document.querySelector('.progress');
const ok_btn = document.querySelector('.ok');
const not_btn = document.querySelector('.not');
let timer1; // Đặt biến timer ngoài hàm notify để có thể sử dụng ở nhiều lần gọi

closeIcon.addEventListener('click', () => {
    toast.classList.remove('active');
});

function notify(type, text_2) {
    if (timer1) {
        clearTimeout(timer1);
    }
    const button = document.querySelector('.button');
    button.style.display = 'none';
    switch (type) {
        // thong bao
        case 'n':
            toast_icon.classList = ['fas fa-solid fa-check icon-right'];
            toast.querySelector('.text-1').innerHTML = 'Thông báo';
            document.documentElement.style.setProperty('--color_i', '#3adb3a');
            break;
        // chu y
        case '!':
            toast_icon.classList = ['fa-solid fa-exclamation icon-right'];
            toast.querySelector('.text-1').innerHTML = 'Chú ý';
            document.documentElement.style.setProperty('--color_i', '#e1e11a');

            break;
        // loi
        case 'x':
            toast_icon.classList = ['fa-solid fa-x icon-right'];
            toast.querySelector('.text-1').innerHTML = 'Lỗi';
            document.documentElement.style.setProperty('--color_i', 'red');

            break;
    }

    toast.querySelector('.text-2').innerHTML = text_2;
    toast.classList.add('active');
    progress.classList.add('active');

    timer1 = setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}

function quest(text_2) {
    const button = document.querySelector('.button');
    button.style.display = 'flex';
    return new Promise((resolve, reject) => {
        toast_icon.classList = ['fa-solid fa-question icon-right'];
        toast.querySelector('.text-1').innerHTML = 'Chấm hỏi';
        document.documentElement.style.setProperty('--color_i', '#8f671b');

        toast.querySelector('.text-2').innerHTML = text_2;
        toast.classList.add('active');
        progress.classList.add('active');

        ok_btn.addEventListener('click', () => {
            console.log('ok');
            toast.classList.remove('active');
            resolve(true);
        });

        not_btn.addEventListener('click', () => {
            console.log('not');
            toast.classList.remove('active');
            resolve(false);
        });
    });
}
