// gia tri mac dinh
const displayName_d = $('.display_name').val();
const avt_d = $('.up-img').attr('src');
if (!(avt_d == "")) {
  $('.modal_wrap_img_item').find(".up-img-btn i").hide();
}
// -------------

$(document).on("dragover", ".modal_wrap_img_item", handleDragOver);
$(document).on("dragleave", ".modal_wrap_img_item", handleDragLeave);
$(document).on("drop", ".modal_wrap_img_item", handleDrop);
$(document).on("click", ".up-img-btn", handleUploadButtonClick);
$(document).on("change", ".upload-input", handleUploadInputChange);
$(document).on("click", ".profile_btn_logoutall", handleLogOutAllButtonClick);
$(document).on("click", ".profile_btn_cancel", handleCancelButtonClick);
$(document).on("click", ".profile_btn_save", handleSaveButtonClick);

// -----------------------------------------------------------------------------
function validateFile(file) {
  let allowedFormats = ['jpg', 'jpeg', 'png']; // Allowed file formats
  let maxSize = 5485760; // MBit in bytes
  // Check file format
  const fileName = file.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
  if (!allowedFormats.includes(fileExtension)) {
    // Invalid file format
    notify('x', 'Sai định dạng file!');
    return false;
  }
  if (file.size > maxSize) {
    notify('!', 'Up ảnh dưới 5mb!');
    return false;
  }
  // File is valid
  return true;
}

function handleDragOver(event) {
  event.preventDefault();
  $(this).addClass("dragover");
}

function handleDragLeave(event) {
  event.preventDefault();
  $(this).removeClass("dragover");
}

function handleDrop(event) {
  if (validateFile(event.originalEvent.dataTransfer.files[0])) {
    event.preventDefault();
    $(this).removeClass("dragover");
    const file = event.originalEvent.dataTransfer.files[0];
    displayImage.call(this, file);
  }
}

function handleUploadButtonClick() {
  $(this).siblings(".upload-input").click();
}

function handleUploadInputChange(event) {
  if (validateFile(event.target.files[0])) {
    const file = event.target.files[0];
    displayImage.call($(this).parent().parent(), file);
  }
}

function displayImage(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    $(this).find(".up-img").attr("src", event.target.result);
  }.bind($(this));
  reader.readAsDataURL(file);
  $(this).find(".up-img-btn i").hide();
}

function handleCancelButtonClick(event) {
  const displayName = $('.display_name').val();
  const avt = $('.up-img').attr('src');
  if (displayName != displayName_d || avt != avt_d) {
    if (confirm('Thay đổi của bạn sẽ không được lưu, tiếp tục?')) {
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
}

async function handleLogOutAllButtonClick(event) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    };
    const response = await fetch('/api/logoutAlldevice', requestOptions);
    if (response.ok) {
      notify('n', 'Đăng xuất khỏi tất cả thiết bị thành công!');
    } else if (response.status == 500) {
      // Error occurred during upload
      notify('x', 'Có lỗi xảy ra!');
    }
  } catch (error) {
    console.log(error);
    notify('x', 'Có lỗi xảy ra!');
  }
}

async function handleSaveButtonClick(event) {
  try {
    const displayName = $('.display_name').val();
    const avt = $('.up-img').attr('src');

    let postData = JSON.stringify({
      displayName: displayName,
      avt: avt
    });
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postData
    };
    const response = await fetch('/api/updateInfo', requestOptions);
    if (response.ok) {
      notify('n', 'Đổi thông tin thành công!');
      setTimeout(() => { window.location.reload(); },
        2000)
    } else if (response.status == 500) {
      // Error occurred during upload
      notify('x', 'Có lỗi xảy ra!');
    }

  } catch (error) {
    console.log(error);
    notify('x', 'Có lỗi xảy ra!');
  }
}