
const url = window.location.href
console.log(url)
const lastIndex = url.lastIndexOf('=');
const cls = url.slice(lastIndex + 1);

const studentIdIndex = url.indexOf('studentId=') + 'studentId='.length;
const ampersandIndex = url.indexOf('&', studentIdIndex);
const mssv = url.slice(studentIdIndex, ampersandIndex !== -1 ? ampersandIndex : 'aaa');

console.log(mssv);
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
  document.getElementById("total_muc_1k").innerText = index_tier_1() + " điểm";
  document.getElementById("total_muc_2k").innerText = index_tier_2() + " điểm";
  document.getElementById("total_muc_3k").innerText = index_tier_3() + " điểm";
  document.getElementById("total_muc_4k").innerText = index_tier_4() + " điểm";
  document.getElementById("total_muc_5k").innerText = index_tier_5() + " điểm";
  document.getElementById("total_allk").innerText =
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
    // if (!$(".post-btn").is(":visible")) {
    //   notify(
    //     "!",
    //     "Hãy upload ảnh chứng minh bạn tham gia sự kiện nhé!"
    //   );
    // }
    // $(".post-btn").show();
  }
  // else {
  //   $(".post-btn").hide();
  // }
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



async function mark() {
  try {
    let postData = JSON.stringify({
      school_year: "HK1_2022-2023",
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
      class: cls,
      mssv: mssv,
      fifth: [
        getSelectValue("mySelect13"),
        getSelectValue("mySelect14"),
        getSelectValue("mySelect15"),
        getSelectValue("mySelect16"),
      ],
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


    const response = await fetch('/api/dep_mark', requestOptions);
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
  await mark()
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
