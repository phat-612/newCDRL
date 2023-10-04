function validateFile(file) {
  let allowedFormats = ["jpg", "jpeg", "png"]; // Allowed file formats
  let maxSize = 5485760; // MBit in bytes
  // Check file format
  const fileName = file.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
  if (!allowedFormats.includes(fileExtension)) {
    // Invalid file format
    notify("x", "Sai định dạng file!");
    return false;
  }
  if (file.size > maxSize) {
    notify("!", "Up ảnh dưới 5mb!");
    return false;
  }
  // File is valid
  return true;
}
//////////////////////
$(document).ready(function () {
  $(".post-btn").click(function () {
    const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
    if (modal_wrap_img.length < 5) {
      $(".add-btn").css("display", "block");
    }
    $(".modal").show();
  });

  $(".close-dialog").click(function () {
    const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
    for (const item of modal_wrap_img) {
      if (item.querySelector("img").src === "") {
        item.remove();
        $(".no-img span").text($(".modal_img").children().length);
      }
    }
    $(".modal").hide();
  });
  $(".done-btn2").click(function () {
    const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
    for (const item of modal_wrap_img) {
      if (item.querySelector("img").src === "") {
        item.remove();
        $(".no-img span").text($(".modal_img").children().length);
      }
    }
    $(".modal").hide();
  });

  $(".add-btn").click(function () {
    if ($(".modal_img").children().length < 5) {
      $(".modal_img").append(`
        <div class="modal_wrap_img">
    
          <div class="modal_wrap_img_item">
            <p>Kéo thả hình ảnh vào đây hoặc nhấn vào để tải lên.</p>
            <input type="file" class="upload-input" style="display: none;">
            <img class="up-img">
            <button class="up-img-btn">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          
        
          <textarea class="up-img-description" name="description" cols="30" rows="5" placeholder="Mô Tả"></textarea>
          <button class="drop_img"><i class="fa-solid fa-trash"></i></button> 
        </div>
        `);

      $(".no-img span").text($(".modal_img").children().length);

      if ($(".modal_img").children().length == 5) {
        this.style.display = "none";
      }
    }
    const element_scroll = document.querySelector(".modal_img");
    element_scroll.scrollTop = element_scroll.scrollHeight;
  });
});

$(document).on("click", ".drop_img ", function () {
  $(this).parent().remove();
  $(".no-img span").text($(".modal_img").children().length);
  document.querySelector(".add-btn").style.display = "block";
});

$(document).on("dragover", ".modal_wrap_img_item", handleDragOver);
$(document).on("dragleave", ".modal_wrap_img_item", handleDragLeave);
$(document).on("drop", ".modal_wrap_img_item", handleDrop);
$(document).on("click", ".post-btn", handleUploadButtonClick);
$(document).on("change", ".upload-input", handleUploadInputChange);
$(document).on("click", ".activeregistration_btn", handleCheckinButtonClick);
$(document).on("click", ".save-btn", handleCheckinwithImgButtonClick);
async function handleCheckinwithImgButtonClick(event) {
  console.log("Checkin");
  uploadImage();
}

async function handleCheckinButtonClick(event) {
  let id = $(this).attr("id");
  let level = $("p:contains('Cấp độ:')").find("span").text().trim();
  try {
    let postData = JSON.stringify({
      id: id,
      level: level,
    });
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: postData,
    };
    const response = await fetch("/api/CheckinActivities", requestOptions);
    if (response.ok) {
      const jsonData = await response.json();
      const nameuser = $(".activity_body_studentname").find("h1").text().trim();

      let spanElement = $("p:contains('Trạng thái:')").find("span");
      //   spanElement.removeClass("attendance");
      //   spanElement.addClass("activity_body_alert");
      spanElement.text("Chưa điểm danh");
      $(".activeregistration_btn").remove();
      const newHTML = `
    <button class="button-35 up-btn post-btn">
      Tải ảnh
    </button>
    <button class="button-35 up-btn save-btn" id="${id}">
      Điểm Danh
    </button>`;

      const newUser = `<tr class="atv_box">
<td>
  <div class="checkbox-wrapper-4">
    <input type="checkbox" id="row__0__0" class="inp-cbx" value="18101911" />
    <label for="row__0__0" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
    </label>
  </div>
</td>
<td>
  ${jsonData.id}
</td>
<td class="a_name">
${nameuser}
</td>
<td class="class_student">
  ${jsonData.cls}
</td>
</tr>`;

      const tableemty = `<table class="table" id="school_tb">
<thead>
  <tr>
    <th style="width: 1%">
      <div class="checkbox-wrapper-4">
        <input type="checkbox" id="row__0" class="inp-cbx all-cbx" />
        <label for="row__0" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
        </label>
      </div>
    </th>
    <th style="width: 2%">MSSV</th>
    <th style="width: 40%">Họ Và Tên</th>
    <th style="width: 10%">Lớp</th>
  </tr>
</thead>
<tbody>
</tbody>
</table>`;
      $(".activity_body").append(newHTML);
      if ($("#school_tb").length <= 0) {
        $("p:contains('Không có học sinh nào!')").remove();
        $(".dsdangky").append(tableemty);
      }
      $("#school_tb tbody").append(newUser);

      notify("n", "Ghi danh thành công!");
    } else if (response.status == 403) {
      // Error occurred during upload
      notify("!", "Không có quyền");
    } else if (response.status == 404) {
      notify("!", "Hoạt động đã kết thúc");
    }
  } catch (error) {
    console.log(error);
    notify("x", "Có lỗi xảy ra!");
  }
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
  let files = event.originalEvent.dataTransfer.files;

  if (validateFile(files[0])) {
    event.preventDefault();
    $(this).removeClass("dragover");
    const file = files[0];
    displayImage.call($(this), file);

    $(this).find(".upload-input").prop("files", files);
  }
}

function handleUploadButtonClick() {
  $(this).siblings(".upload-input").click();
}

function handleUploadInputChange(event) {
  if (validateFile(event.target.files[0])) {
    const file = event.target.files[0];
    displayImage.call($(this).parent().parent(), file);
    // let selectedFiles = this.files;
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
function generateUUID() {
  // Hàm tạo chuỗi UUID
  // Tham khảo: https://stackoverflow.com/a/2117523/13347726
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
async function uploadImage() {
  try {
    // get files and descripts
    let files = [];
    let descripts = [];
    $(".modal_wrap_img").each(function () {
      let curr_file = $(this).find(".upload-input")[0].files[0];
      if (curr_file) {
        files.push(curr_file);
        descripts.push($(this).find(".up-img-description").val());
      }
    });

    let formData = new FormData();
    if (files.length == 0) {
      notify("x", "Hãy tải ảnh chứng minh bạn đã tham gia!");
    } else {
      for (let i = 0; i < files.length; i++) {
        let extension = files[i].name.substring(files[i].name.lastIndexOf("."));
        let newName = `${i} ` + generateUUID() + extension;
        let renamedFile = new File([files[i]], newName, { type: files[i].type });
        formData.append("files[]", renamedFile);
        formData.append("descripts[]", descripts[i]);
      }

      const response = await fetch("/api/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        mark(await response.json());
      } else if (response.status == 400) {
        // Error occurred during upload
        notify("x", "Sai định dạng file!.");
        console.error("Error uploading files.");
      }
    }
  } catch (error) {
    // Error occurred during the request
    console.error("Error uploading files.", error);
  }
}

async function mark(img_ids) {
  try {
    let id = $(".save-btn").attr("id");
    let level = $("p:contains('Cấp độ:')").find("span").text().trim();
    let postData = JSON.stringify({
      id: id,
      level: level,
      img_ids: img_ids,
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: postData,
    };

    const response = await fetch("/api/muster", requestOptions);
    if (response.ok) {
      notify("n", "Đã điểm danh thành công!");
      let spanElement = $("p:contains('Trạng thái:')").find("span");
      spanElement.removeClass("attendance");
      spanElement.addClass("activity_body_alert");
      spanElement.text("Đã điểm danh");
      $(".post-btn").remove();
      $(".save-btn").remove();
      $(".activity_body_studentname h1").text("Cảm ơn bạn đã tham gia hoạt động!");
    } else if (response.status == 500) {
      // Error occurred during upload
      notify("x", "Có lỗi xảy ra!");
    }
  } catch (error) {
    console.log(error);
    notify("x", "Có lỗi xảy ra!");
  }
}

$(document).mouseup(function (e) {
  var container = $(".modal");

  // if the target of the click isn't the container nor a descendant of the container
  if (container.is(e.target) && container.has(e.target).length === 0) {
    const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
    for (const item of modal_wrap_img) {
      if (item.querySelector("img").src === "") {
        item.remove();
        $(".no-img span").text($(".modal_img").children().length);
      }
    }
    container.hide();
  }
});
