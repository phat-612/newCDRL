const regex = /\/([^/]+)\/([^/]+)$/;
let level;
let _id;

const matches = currentUrl.match(regex);
if (matches) {
  const [_, group1, group2] = matches;
  level = group1;
  _id = group2;
} else {
  console.log("No match found.");
}

$(".inp-cbx").change(async function () {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      _id: _id,
      level: level,
      status: $(this).val()
    }),
  };

  const response = await fetch("/api/updateActivitiesStatus", requestOptions);
  if (response.ok) {

    // change value and text of current check box to "Đang diển ra" or "Đã kết thúc"
    if ($(this).val() == '1') {
      $('.close_now').text('Đã kết thúc');
      $(this).val('0');
    } else if ($(this).val() == '0') {
      $('.close_now').text('Đang diễn ra');
      $(this).val('1');
    }
  } else if (response.status == 500) {
    // Error occurred during upload
    notify("x", "Có lỗi xảy ra!");
  }
});

// approval student join in current activity
$('#save-change').on('click', async () => {
  let cbxs = $('.approval-cbx');
  let dataApproval = {};
  for (let i = 0; i < cbxs.length; i++) {
    if (cbxs[i].checked) {
      dataApproval[cbxs[i].value.toString()] = true
      // dataUpdate.push(cbxs[i].value.toString());
    } else {
      dataApproval[cbxs[i].value.toString()] = false
    }
  }

  try {
    let postData = JSON.stringify({
      _id: _id,
      level: level,
      dataUpdate: dataApproval,
    });
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postData
    };

    const response = await fetch('/api/approvalActivityStudent', requestOptions);
    if (response.ok) {
      defaultApproval = dataApproval; // set default to new update data
      notify('n', 'Duyệt sinh viên thành công!');
    } else {
      notify('!', 'Duyệt sinh viên thất bại!');
    }
  } catch (error) {
    console.log(error);
  }
})

// delete students
$('#delete-student').on('click', async () => {
  let cbxs = $('.delete--cbx')
  let dataDelete = [];
  let tableDelete = []
  for (let i = 1; i < cbxs.length; i++) {
    if (cbxs[i].checked) {
      dataDelete.push(cbxs[i].value.toString());
      tableDelete.push(cbxs[i]);
    }
  }
  if (dataDelete.length > 0) {
    try {
      let postData = JSON.stringify({
        _id: _id,
        level: level,
        dataDelete: dataDelete
      });
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: postData
      };
      const response = await fetch('/api/deleteActivityStudent', requestOptions);
      if (response.ok) {
        for (let i = 0; i < tableDelete.length; i++) {
          console.log(tableDelete);
          tableDelete[i].remove();
        }
        notify('n', 'Xóa sinh viên thành công!');
      } else {
        notify('!', 'Xóa sinh viên thất bại!');
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    notify('!', 'Vui lòng chọn sinh viên');
  }
})

// reset all student approval to default
$('.reset_btn').on('click', async () => {
  let cbxs = $('.approval-cbx');
  let all_not_false = true;
  for (let i = 0; i < cbxs.length; i++) {
    cbxs.prop('checked', defaultApproval[cbxs[i].value.toString()]);
    if (!defaultApproval[cbxs[i].value.toString()]) {
      all_not_false = false;
    }
  }

  if (all_not_false) {
    $('.all-save-cbx').prop('checked', true);
  }
});

// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
$(document).on("change", ".all-cbx", async function () {
  if ($(".all-cbx")[0].checked) {
    $("table tbody .delete-cbx").prop("checked", true);
  } else {
    $("table tbody .delete-cbx").prop("checked", false);
  }
});
// if all checkboxs was check all-cbx will tick
$(document).on("change", ".delete-cbx", async function () {
  let check = true;
  $("table tbody .delete-cbx").each(function () {
    if (!this.checked) check = false;
    return;
  });

  if (check) {
    $(".all-cbx").prop("checked", true);
  } else {
    $(".all-cbx").prop("checked", false);
  }
});

// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
$(document).on("change", ".all-save-cbx", async function () {
  if ($(".all-save-cbx")[0].checked) {
    $("table tbody .approval-cbx").prop("checked", true);
  } else {
    $("table tbody .approval-cbx").prop("checked", false);
  }
});

// if all checkboxs was check all-cbx will tick
$(document).on("change", ".approval-cbx", async function () {
  let check = true;
  $("table tbody .approval-cbx").each(function () {
    if (!this.checked) check = false;
    return;
  });

  if (check) {
    $(".all-save-cbx").prop("checked", true);
  } else {
    $(".all-save-cbx").prop("checked", false);
  }
});
