const windowWidth = window.innerWidth;
if (windowWidth <= 600) {
  const a = document.querySelectorAll('.tr-title td')
  for(const item of a){
    item.setAttribute('colspan', '5');
  }
}




// identify file
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
//////////////////////
$(document).ready(function () {
  $(".post-btn").click(function () {
    const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
    if (modal_wrap_img.length < 5) {
      $(".add-btn").css("display", "block");

    };
    $(".modal").show();
  });

  $(".close-dialog").click(function () {
    const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
    for (const item of modal_wrap_img) {
      if (item.querySelector('img').src === "") {
        item.remove();
        $(".no-img span").text($(".modal_img").children().length);
      }
    }
    $(".modal").hide();
  });
  $(".done-btn2").click(function () {
    const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
    for (const item of modal_wrap_img) {
      if (item.querySelector('img').src === "") {
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
        this.style.display = 'none';
      }
    }
    const element_scroll = document.querySelector(".modal_img");
    element_scroll.scrollTop = element_scroll.scrollHeight;
  });
});

$(document).on("click", ".drop_img ", function () {
  $(this).parent().remove();
  $(".no-img span").text($(".modal_img").children().length);
  document.querySelector('.add-btn').style.display = 'block';
});

$(document).on("dragover", ".modal_wrap_img_item", handleDragOver);
$(document).on("dragleave", ".modal_wrap_img_item", handleDragLeave);
$(document).on("drop", ".modal_wrap_img_item", handleDrop);
$(document).on("click", ".up-img-btn", handleUploadButtonClick);
$(document).on("change", ".upload-input", handleUploadInputChange);

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
    displayImage.call($(this), file);
    $('.upload-input').prop('files', event.originalEvent.dataTransfer.files);
  }
}

function handleUploadButtonClick() {
  $(this).siblings(".upload-input").click();
}

function handleUploadInputChange(event) {
  if (validateFile(event.target.files[0])) {
    const file = event.target.files[0];
    displayImage.call($(this).parent().parent(), file);
    let selectedFiles = this.files;
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

$(document).mouseup(function (e) {
  var container = $(".modal");

  // if the target of the click isn't the container nor a descendant of the container
  if (container.is(e.target) && container.has(e.target).length === 0) {
    const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
    for (const item of modal_wrap_img) {
      if (item.querySelector('img').src === "") {
        item.remove();
        $(".no-img span").text($(".modal_img").children().length);
      }
    };
    container.hide();
  }
});
// tính điểm ------------------------------------------------------------------------------------------------------------------------------------------------------------

function getSelectValue(selectId) {
  return parseInt(document.getElementById(selectId).value);
}

function getScoreValue(scoreId) {
  const text = document.getElementById(scoreId).innerText;
  return parseInt((text.match(/\d+/) || [])[0]);
}

function sumArrayWithReduce(arr) {
  return arr.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
}

const checkbox_list = {
  tier_1: ["morning1", "morning2"],
  tier_2: ["morning3", "morning4", "morning5", "morning6"],
  tier_3: ["morning7", "morning8"],
  tier_4: ["morning9", "morning10"],
  tier_5: ["morning11", "morning12"],
  tier_6: ["morning13", "morning14"],
};

const select_list = {
  tier_1: "mySelect3",
  tier_2: null,
  tier_3: "mySelect5",
  tier_4: "mySelect6",
  tier_5: "mySelect7",
  tier_6: "mySelect16",
};

const index_tier_1 = () => {
  return sumArrayWithReduce([
    getSelectValue("mySelect1"),
    getSelectValue("mySelect2"),
    getSelectValue("mySelect3"),
    getSelectValue("mySelect4"),
    getScoreValue("score_05"),
  ]);
};

const index_tier_2 = () => {
  return sumArrayWithReduce([
    getSelectValue("mySelect5"),
    getSelectValue("mySelect6"),
  ]);
};

const index_tier_3 = () => {
  return sumArrayWithReduce([
    getSelectValue("mySelect7"),
    getSelectValue("mySelect8"),
    getSelectValue("mySelect9"),
  ]);
};

const index_tier_4 = () => {
  return sumArrayWithReduce([
    getSelectValue("mySelect10"),
    getSelectValue("mySelect11"),
    getSelectValue("mySelect12"),
  ]);
};

const index_tier_5 = () => {
  return sumArrayWithReduce([
    getSelectValue("mySelect13"),
    getSelectValue("mySelect14"),
    getSelectValue("mySelect15"),
    getSelectValue("mySelect16"),
  ]);
};

function total_tier() {
  document.getElementById("total_muc_1").innerText = index_tier_1() + " điểm";
  document.getElementById("total_muc_2").innerText = index_tier_2() + " điểm";
  document.getElementById("total_muc_3").innerText = index_tier_3() + " điểm";
  document.getElementById("total_muc_4").innerText = index_tier_4() + " điểm";
  document.getElementById("total_muc_5").innerText = index_tier_5() + " điểm";
  document.getElementById("total_all").innerText =
    index_tier_1() +
    index_tier_2() +
    index_tier_3() +
    index_tier_4() +
    index_tier_5() +
    " điểm";
  showUploadImg();
}

const showUploadImg = () => {
  const require_upload_img = [
    index_tier_3(),
    getSelectValue("mySelect11"),
    getSelectValue("mySelect13"),
    getSelectValue("mySelect14"),
    getSelectValue("mySelect16"),
  ];
  if (
    !require_upload_img.every((element) => element === 0 || element === "0")
  ) {
    if (!$(".post-btn").is(":visible")) {
      notify(
        "!",
        "Hãy upload ảnh chứng minh bạn tham gia sự kiện nhé!"
      );
    }
    $(".post-btn").show();
  } else {
    $(".post-btn").hide();
  }
};

function handleCheckboxChange(event) {
  const checkbox = event.target;
  if (checkbox.checked) {
    for (const [tier, checkboxTier] of Object.entries(checkbox_list)) {
      if (checkboxTier.includes(checkbox.id)) {
        if (tier == "tier_2") {
          document.getElementById("score_05").innerText =
            checkbox.value + " điểm";
        }
        if (select_list[tier]) {
          const selectElement = document.getElementById(select_list[tier]);
          selectElement.value = parseInt(checkbox.value);
        }

        checkboxTier.forEach((checkbox_i) => {
          if (checkbox.id != checkbox_i) {
            document.getElementById(checkbox_i).checked = false;
          }
        });
      }
    }
  } else {
    for (const [tier, checkboxTier] of Object.entries(checkbox_list)) {
      if (checkboxTier.includes(checkbox.id)) {
        if (select_list[tier]) {
          const selectElement = document.getElementById(select_list[tier]);
          selectElement.value = 0;
          blockUnTick(selectElement);
        }
        if (tier == "tier_2") {
          document.getElementById("score_05").innerText = "0 điểm";
        }
      }
    }
  }
  total_tier();
}


function blockUnTick(selectbox) {
  for (const [tier, selectboxTier] of Object.entries(select_list)) {
    if (selectboxTier == selectbox.id) {
      checkbox_list[tier].forEach((checkbox_i) => {
        if (selectbox.value != document.getElementById(checkbox_i).value) {
          document.getElementById(checkbox_i).checked = false;
        } else {
          document.getElementById(checkbox_i).checked = true;
        }
      });
    }
  }
}

const checkboxes = document.querySelectorAll(
  '.checkbox-wrapper-4 input[type="checkbox"]'
);
checkboxes.forEach((checkbox_i) => {
  checkbox_i.addEventListener("change", handleCheckboxChange);
});


function handleSelectChange(event) {
  const selectbox = event.target;

  for (const [tier, selectboxTier] of Object.entries(select_list)) {
    if (selectboxTier == selectbox.id) {
      checkbox_list[tier].forEach((checkbox_i) => {
        if (selectbox.value != document.getElementById(checkbox_i).value) {
          document.getElementById(checkbox_i).checked = false;
        } else {
          document.getElementById(checkbox_i).checked = true;
        }
      });
    }
  }
  total_tier();
}

const selectboxes = document.querySelectorAll(".selectbox select");

selectboxes.forEach((selectbox) => {
  selectbox.addEventListener("change", handleSelectChange);
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
function generateUUID() {
  // Hàm tạo chuỗi UUID
  // Tham khảo: https://stackoverflow.com/a/2117523/13347726
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function uploadImage() {
  try {
    // get files and descripts
    let files = []
    let descripts = []
    $('.modal_wrap_img').each(function () {
      let curr_file = $(this).find('.upload-input')[0].files[0];
      if (curr_file) {
        files.push(curr_file);
        descripts.push($(this).find('.up-img-description').val());
      }
    });

    let formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      let extension = files[i].name.substring(files[i].name.lastIndexOf('.'));
      let newName = `${i} ` + generateUUID() + extension;
      let renamedFile = new File([files[i]], newName, { type: files[i].type });
      formData.append('files[]', renamedFile);
      formData.append('descripts[]', descripts[i]);
    }

    const response = await fetch('/api/uploadFile', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      mark(await response.json());
    } else if (response.status == 400) {
      // Error occurred during upload
      notify('x', 'Sai định dạng file!.');
      console.error('Error uploading files.');
    }
  } catch (error) {
    // Error occurred during the request
    console.error('Error uploading files. cho minh ', error);
  }
}

async function mark(img_ids) {
  try {
    let postData = JSON.stringify({
      first: [
        getSelectValue("mySelect1"),
        getSelectValue("mySelect2"),
        getSelectValue("mySelect3"),
        getSelectValue("mySelect4"),
        getScoreValue("score_05")
      ],
      second: [
        getSelectValue("mySelect5"),
        getSelectValue("mySelect6")
      ],
      third: [
        getSelectValue("mySelect7"),
        getSelectValue("mySelect8"),
        getSelectValue("mySelect9"),
      ],
      fourth: [
        getSelectValue("mySelect10"),
        getSelectValue("mySelect11"),
        getSelectValue("mySelect12"),
      ],
      fifth: [
        getSelectValue("mySelect13"),
        getSelectValue("mySelect14"),
        getSelectValue("mySelect15"),
        getSelectValue("mySelect16"),
      ],
      img_ids: img_ids,
      total: index_tier_1() +
        index_tier_2() +
        index_tier_3() +
        index_tier_4() +
        index_tier_5()
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postData
    };


    const response = await fetch('/api/std_mark', requestOptions);
    if (response.ok) {
      notify('n', 'Đã lưu phiếu đánh giá điểm rèn luyện thành công!')
    }
    else if (response.status == 500) {
      // Error occurred during upload
      notify('x', 'Có lỗi xảy ra!');
    }
  } catch (error) {
    console.log(error);
    notify('x', 'Có lỗi xảy ra!');
  }
}

// Save table infomation --------------------------------------------------------------------------------------------------------------------------------------------------
$(document).on("click", ".save-btn", async function () {
  notify('!', 'Đang upload phiếu điểm...');
  uploadImage();
});


// điểm

function select_point0() {
  for (let i = 1; i < 17; i++) {
    const mySelect = document.getElementById(`mySelect${i}`);
    mySelect.value = 0
    if (i >= 3 && i <= 6) {
      const mybox = document.getElementById(`morning${i}`);
      if (mybox.checked) {
        mybox.click();
      }
    }
  }

}

function remarksellect() {
  const selectboxes = document.querySelectorAll(".selectbox select");
  selectboxes.forEach((selectbox) => {
    let event = {
      target: selectbox
    };
    handleSelectChange(event);
  });
}


function removeNow() {
  $('.menu .button').removeClass('now');
}
$(document).on("click", ".button_medium", function () {
  console.log($(this));
  if ($(this).hasClass('now')) {
    select_point0();
    removeNow();
    remarksellect();

  }
  else {
    removeNow();

    $(this).addClass('now');
    select_point0();
    for (let i = 1; i < 13; i++) {
      const mySelect = document.getElementById(`mySelect${i}`);
      const values = Array.from(mySelect.options).map(option => parseInt(option.value));
      const maxValue = Math.max(...values);
      mySelect.value = maxValue.toString();
    }
    const mySelect11 = document.getElementById(`mySelect11`);
    mySelect11.value = 0;
    const mySelect8 = document.getElementById(`mySelect8`);
    mySelect8.value = 0;
    const mySelect7 = document.getElementById(`mySelect7`);
    mySelect7.value = 5;
    const check4 = document.getElementById('morning4');
    if (!check4.checked) {
      check4.click();
    }
    remarksellect();
  }
});

$(document).on("click", ".button_plus", function () {
  if ($(this).hasClass('now')) {
    select_point0();
    removeNow();
    remarksellect();

  } else {
    removeNow();
    $(this).addClass('now');

    select_point0();
    for (let i = 1; i < 14; i++) {
      const mySelect = document.getElementById(`mySelect${i}`);
      const values = Array.from(mySelect.options).map(option => parseInt(option.value));
      const maxValue = Math.max(...values);

      mySelect.value = maxValue.toString();
    }

    const mySelect11 = document.getElementById(`mySelect11`);
    mySelect11.value = 0;
    const mySelect7 = document.getElementById(`mySelect7`);
    mySelect7.value = 5;
    const check5 = document.getElementById('morning5');
    if (!check5.checked) {
      check5.click();
    }
  }
  remarksellect();

});

$(document).on("click", ".button_premium", function () {
  if ($(this).hasClass('now')) {
    select_point0();
    removeNow();
    remarksellect();

  }
  else {
    removeNow();
    $(this).addClass('now');
    select_point0();
    for (let i = 1; i < 15; i++) {
      const mySelect = document.getElementById(`mySelect${i}`);
      const values = Array.from(mySelect.options).map(option => parseInt(option.value));
      const maxValue = Math.max(...values);

      mySelect.value = maxValue.toString();
    }

    const check6 = document.getElementById('morning6');

    if (!check6.checked) {
      check6.click();
    }
    const check11 = document.getElementById('morning11');
    if (!check11.checked) {
      check11.checked = true;
    }
  }

  remarksellect();

});

