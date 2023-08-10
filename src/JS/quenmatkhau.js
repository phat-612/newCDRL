$('.login_btn').on('click', function () {
    const mssv = $('.mssv_input').val();
    if (mssv == "") {
        notify("!", "Vui lòng nhập mssv!");
    } else {
        window.location.href = "/xacthucOTP?mssv=" + mssv;
    }

})