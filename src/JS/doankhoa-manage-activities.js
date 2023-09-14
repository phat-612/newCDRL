function generateUUID() {
  // Hàm tạo chuỗi UUID
  // Tham khảo: https://stackoverflow.com/a/2117523/13347726
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let atv_id = generateUUID(); // fake id to know a new id
let curr_edit = undefined;

$(".more_list").click(function () {
  // edit dialog often
  curr_edit = $(this).parent().parent();
  atv_id = curr_edit.find(".inp-cbx").val();

  

  $(".modal.edit").show();
});

$(".modal.edit").click(function () {
  $(".modal.edit").hide();
});

$(".modal_wrap.edit").click(function (e) {
  e.stopPropagation();
});

$("#add__activity").click(function () {
  // add dialog often
  curr_edit = undefined;
  atv_id = generateUUID();

  $(".modal.add").show();
});

$(".modal.add").click(function () {
  $(".modal.add").hide();
});

$(".modal_wrap.add").click(function (e) {
  e.stopPropagation();
});

$(".close_modal").click(function () {
  $(".modal.edit").hide();
});

// show and hide copy link box
$(document).on("mouseenter", ".atv_box", async function () {
  $(this).next().show();
});

$(document).on("mouseenter", ".copy_box", async function () {
  $(this).show();
});

$(document).on("mouseleave", ".atv_box", async function () {
  $(this).next().hide();
});

$(document).on("mouseleave", ".copy_box", async function () {
  $(this).hide();
});
// ----------------------------------------------------------------

$(document).on("change", "#select-level1", async function () {
  if ($(this).val() === "lop") {
    $("#select_lop1").show();
  } else {
    $("#select_lop1").hide();
  }
});

$(document).on("change", "#select-level2", async function () {
  if ($(this).val() === "lop") {
    $("#select_lop2").show();
  } else {
    $("#select_lop2").hide();
  }
});

$(document).on("change", ".--bomon select", async function () {
  const selectedBranch = $(".--bomon select option:selected").text().trim();
  //  const selectedBranch = "Công Nghệ Thông Tin";
  let selectedBranchId;
  let selectedClassName;
  let classList = [];
  for (let i = 0; i < branch_list.length; i++) {
    if (branch_list[i].name === selectedBranch) {
      selectedBranchId = branch_list[i]._id;
      break;
    }
  }
  for (let i = 0; i < class_list.length; i++) {
    if (class_list[i].branch === selectedBranchId) {
      selectedClassName = class_list[i]._id;
      classList.push(selectedClassName);
    }
  }

  const selectElement = $(".--class select"); // Lấy thẻ select bằng jQuery
  // Xóa các phần tử hiện có trong select
  selectElement.empty();
  // Tạo các phần tử option từ mảng branch_list và thêm vào select
  $.each(classList, function (index, branch) {
    const option = $("<option></option>");
    option.val(branch);
    option.text(branch);
    selectElement.append(option);
  });
  // console.log(selectedBranchId);
  // console.log(selectedBranch);
  // console.log(classList);
});

//save button
$(".save_btn").click(async function () {
  const atv_name = $(this)
    .parent()
    .parent()
    .parent()
    .find("#activities_title")
    .val();
  const atv_content = $(this)
    .parent()
    .parent()
    .parent()
    .find("#activities_content")
    .val();

  if (atv_name && atv_content) {
    // check if user enter info or not
    // disable curr button
    $(this).prop("disabled", true);

    notify("!", "Đang cập nhật dữ liệu!");

    // get curr level and clss if level is class
    const level = $(this)
      .parent()
      .parent()
      .parent()
      .find(".select_level :selected");
    const cls_id = $(this)
      .parent()
      .parent()
      .parent()
      .find(".select_class :selected");

    // request
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        atv_id: atv_id,
        name: atv_name,
        content: atv_content,
        level: level.val(),
        cls_id: cls_id.val(),
      }),
    };

    const response = await fetch("/api/addOrEditActivities", requestOptions);
    if (response.ok) {
      if (curr_edit) {
        // set current edit line name to new name
        curr_edit.find(".a_name").text(atv_name);
      } else {
        // check for add to school, department or class
        switch (level.val()) {
          case "lop":
            let cls_length = $("#cls_tb tbody tr").length / 2;
            $("#cls_tb tbody").append(`
              <tr class="atv_box">
                <td>
                  <div class="checkbox-wrapper-4">
                    <input type="checkbox" id="row__2__${cls_length}" class="inp-cbx" value="${atv_id}" />
                    <label for="row__2__${cls_length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                    </label>
                </td>
                <td>${cls_length + 1}</td>
                <td class="a_name">${atv_name}</td>
                <td class="c_name">${cls_id.val()}</td>
                <td class="school_year">${year_cur.split("_")[0]} ${year_cur.split("_")[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/${atv_id}">Chi tiết</a></td>
                <td><a class="more_list" href="#">Chỉnh sửa</a></td>
              </tr>
              <tr class="copy_box">
                <td colspan="2"> COPY </td>
                <td><a href="#">Link đăng kí hoạt động</a></td>
                <td colspan="3"><a href="#">Link điểm danh hoạt động</a></td>
              </tr>
            `);
            break;
          case "khoa":
            let dep_length = $("#dep_tb tbody tr").length / 2;
            $("#dep_tb tbody").append(`
              <tr class="atv_box">
                <td>
                  <div class="checkbox-wrapper-4">
                    <input type="checkbox" id="row__1__${dep_length}" class="inp-cbx" value="${atv_id}" />
                    <label for="row__1__${dep_length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                    </label>
                </td>
                <td>${dep_length + 1}</td>
                <td class="a_name">${atv_name}</td>
                <td class="school_year">${year_cur.split("_")[0]} ${year_cur.split("_")[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/${atv_id}">Chi tiết</a></td>
                <td><a class="more_list" href="#">Chỉnh sửa</a></td>
              </tr>
              <tr class="copy_box">
                <td colspan="2"> COPY </td>
                <td><a href="#">Link đăng kí hoạt động</a></td>
                <td colspan="3"><a href="#">Link điểm danh hoạt động</a></td>
              </tr>
            `);
            break;
          case "truong":
            let school_length = $("#school_tb tbody tr").length / 2;
            $("#school_tb tbody").append(`
              <tr class="atv_box">
                <td>
                  <div class="checkbox-wrapper-4">
                    <input type="checkbox" id="row__0__${school_length}" class="inp-cbx" value="${atv_id}" />
                    <label for="row__0__${school_length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                    </label>
                </td>
                <td>${school_length + 1}</td>
                <td class="a_name">${atv_name}</td>
                <td class="school_year">${year_cur.split("_")[0]} ${year_cur.split("_")[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/${atv_id}">Chi tiết</a></td>
                <td><a class="more_list" href="#">Chỉnh sửa</a></td>
              </tr>
              <tr class="copy_box">
                <td colspan="2"> COPY </td>
                <td><a href="#">Link đăng kí hoạt động</a></td>
                <td colspan="3"><a href="#">Link điểm danh hoạt động</a></td>
              </tr>
            `);
            break;
        }
      }
      // able curr button
      $(this).prop("disabled", false);
      // disappear curr dialog
      $(".modal.add").hide();
      $(".modal.edit").hide();
      notify("n", "Đã hoàn tất cập nhật hoạt động");
    } else if (response.status == 500) {
      // able curr button
      $(this).prop("disabled", false);
      // disappear curr dialog
      $(".modal.add").hide();
      $(".modal.edit").hide();
      // Error occurred during upload
      notify("x", "Có lỗi xảy ra!");
    }
  } else {
    notify("!", "Hãy nhập đầy đủ thông tin!");
  }
});

$(".exist_btn").click(async function () {
  $(".modal").hide();
});

// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
// class:
$(document).on("change", "#cls_tb .all-cbx", async function () {
  if ($("#cls_tb .all-cbx")[0].checked) {
    $("#cls_tb tbody .inp-cbx").prop("checked", true);
  } else {
    $("#cls_tb tbody .inp-cbx").prop("checked", false);
  }
});

// if all checkboxs was check all-cbx will tick
$(document).on("change", "#cls_tb .inp-cbx", async function () {
  let check = true;
  $("#cls_tb tbody .inp-cbx").each(function () {
    if (!this.checked) check = false;
    return;
  });

  if (check) {
    $("#cls_tb .all-cbx").prop("checked", true);
  } else {
    $("#cls_tb .all-cbx").prop("checked", false);
  }
});

// department
$(document).on("change", "#dep_tb .all-cbx", async function () {
  if ($("#dep_tb .all-cbx")[0].checked) {
    $("#dep_tb tbody .inp-cbx").prop("checked", true);
  } else {
    $("#dep_tb tbody .inp-cbx").prop("checked", false);
  }
});

// if all checkboxs was check all-cbx will tick
$(document).on("change", "#dep_tb .inp-cbx", async function () {
  let check = true;
  $("#dep_tb tbody .inp-cbx").each(function () {
    if (!this.checked) check = false;
    return;
  });

  if (check) {
    $("#dep_tb .all-cbx").prop("checked", true);
  } else {
    $("#dep_tb .all-cbx").prop("checked", false);
  }
});

// school
$(document).on("change", "#school_tb .all-cbx", async function () {
  if ($("#school_tb .all-cbx")[0].checked) {
    $("#school_tb tbody .inp-cbx").prop("checked", true);
  } else {
    $("#school_tb tbody .inp-cbx").prop("checked", false);
  }
});

// if all checkboxs was check all-cbx will tick
$(document).on("change", "#school_tb .inp-cbx", async function () {
  let check = true;
  $("#school_tb tbody .inp-cbx").each(function () {
    if (!this.checked) check = false;
    return;
  });

  if (check) {
    $("#school_tb .all-cbx").prop("checked", true);
  } else {
    $("#school_tb .all-cbx").prop("checked", false);
  }
});
