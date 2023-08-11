var otp_inputs = document.querySelectorAll(".otp__digit")
var mykey = "0123456789qwertyuiopasdfghjklzxcvbnm".split("")
otp_inputs.forEach((_) => {
  _.addEventListener("keyup", handle_next_input),
    _.addEventListener("paste", handle_paste_input);
})

function handle_next_input(event) {
  // Kiểm tra nếu phím Control đã được nhấn
  if (event.ctrlKey) {
    event.preventDefault();
    return;
  }

  let current = event.target;
  let index = parseInt(current.classList[1].split("__")[2]);

  // Kiểm tra xem ký tự nằm trong khoảng a đến z và số 0-9
  if ((event.key >= 'a' && event.key <= 'z') || (event.key >= '0' && event.key <= '9')) {
    // Nếu là chữ thường, chuyển thành chữ in hoa
    if (event.key >= 'a' && event.key <= 'z') {
      current.value = event.key.toUpperCase();
    } else {
      current.value = event.key;
    }
  } else {
    // Loại bỏ các ký tự không hợp lệ
    event.preventDefault();
  }
  // so 8 la nut xoa
  if (event.keyCode == 8 && index > 1) {
    current.previousElementSibling.focus();
  }
  if (index < 6 && mykey.indexOf("" + event.key + "") != -1) {
    var next = current.nextElementSibling;
    next.focus();
  }
  var _finalKey = "";
  for (let { value } of otp_inputs) {
    _finalKey += value;
  }
}


function handle_paste_input(event) {
  event.preventDefault(); // Ngăn chặn hành vi dán mặc định
  const clipboardData = event.clipboardData || window.clipboardData;
  const pastedText = clipboardData.getData("text").trim();
  if (pastedText.length == 6) {
    setTimeout(() => {
      otp_inputs.forEach((input, index) => {
        input.value = pastedText[index];
      });
    }, 100)
  } else {
    notify("!", 'Mã OTP phải bao gồm 6 kí tự!')
  }
}

async function handle_otp() {
  var _finalKey = "";
  for (let { value } of otp_inputs) {
    _finalKey += value;
  }
  const url = new URL(currentUrl);
  const searchParams = new URLSearchParams(url.search);
  const mssvValue = searchParams.get('mssv');
  try {
    let postData = JSON.stringify({
      otp: _finalKey,
      mssv: mssvValue,
    });
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postData
    };
    const response = await fetch('/api/resetpassword', requestOptions);
    if (response.ok) {
      window.location.href = "/login/updateyourpasswords";
    } else if (response.status == 403) {
      notify('x', 'Sai OTP hoặc OTP đã hết hạn!');
      button_next.innerHTML = "Xác nhận";
      button_next.disabled = false;
    }
  } catch (error) {
    console.log(error);
    notify('x', 'Có lỗi xảy ra!');
  }
}


const button_next = document.querySelector('#page-button');
button_next.onclick = () => {
  let check = true
  for (const el of otp_inputs) {
    if (el.value === '' || el.value === null || el.value === undefined) {
      notify("!", 'Mã OTP phải bao gồm 6 kí tự!')
      check = false
      break;
    }

  }
  if (check) {
    button_next.innerHTML = "Đang chờ...";
    button_next.disabled = true;
    //

    handle_otp()
  }
}

const otp_again = document.querySelector('.otp_again');
const otp_times = document.querySelector('.times')
otp_again.onclick = () => {
  notify("n", 'Đã Gửi Lại OTP!')
  startOtpCountdown(60);

};
const otpTimes = document.querySelector('.times');
const otpAgain = document.querySelector('.otp_again');
function startOtpCountdown(seconds) {
  otpTimes.style.display = 'block';
  otpAgain.style.display = 'none';
  otpTimes.textContent = "Vui lòng chờ " + seconds + " giây";

  const interval = setInterval(() => {
    seconds--;
    otpTimes.textContent = "Vui lòng chờ " + seconds + " giây";
    if (seconds < 0) {
      clearInterval(interval);
      otpTimes.style.display = 'none';
      otpAgain.style.display = 'block';
    }
  }, 1000);
}
startOtpCountdown(60);
