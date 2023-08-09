// var otp_inputs = document.querySelectorAll(".otp__digit")
var mykey = "0123456789qwertyuiopasdfghjklzxcvbnm".split("")
otp_inputs.forEach((_)=>{
  _.addEventListener("keyup", handle_next_input),
  _.addEventListener("paste", handle_paste_input);
})
const blockedKeys = ["Control", "Shift", "Alt", "Meta", // Phím chức năng
"ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", // Phím mũi tên
"Home", "End", "PageUp", "PageDown", // Phím điều hướng trang
"Escape", "Tab", "CapsLock", // Các phím khác
"Insert", "Delete", "Backspace", "Enter","ContextMenu","`" ];
function handle_next_input(event){
  let current = event.target
  let index = parseInt(current.classList[1].split("__")[2])
  if (blockedKeys.includes(event.key)) {
    console.log('err')
  }else{

    current.value = event.key
  }
  
  if(event.keyCode == 8 && index > 1){
    current.previousElementSibling.focus()
  }
  if(index < 6 && mykey.indexOf(""+event.key+"") != -1){
    var next = current.nextElementSibling;
    next.focus()
  }
  var _finalKey = ""
  for(let {value} of otp_inputs){
      _finalKey += value
  }
  // if(_finalKey.length == 6){
  //   document.querySelector("#_otp").classList.replace("_notok", "_ok")
  //   document.querySelector("#_otp").innerText = _finalKey
  // }else{
  //   document.querySelector("#_otp").classList.replace("_ok", "_notok")
  //   document.querySelector("#_otp").innerText = _finalKey
  // }
}

function handle_paste_input(event) {
  event.preventDefault(); // Ngăn chặn hành vi dán mặc định

  const clipboardData = event.clipboardData || window.clipboardData;
  const pastedText = clipboardData.getData("text");
  // console.log(pastedText.length)
  if(pastedText.length == 6){
    // console.log('ok 6')
    setTimeout(() =>{
      otp_inputs.forEach((input, index) => {
        input.value = pastedText[index];
        // console.log(pastedText[index])
      });
    },100)
  }
}