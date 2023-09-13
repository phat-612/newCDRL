atv_id = 'hl_nl_ht_bm' // fake id to know a new id

$(".more_list").click(function () { // edit dialog often
  atv_id = 

  $(".modal.edit").show();
});

$(".modal.edit").click(function () {
  $(".modal.edit").hide();
});

$(".modal_wrap.edit").click(function (e) {
  e.stopPropagation();
});

$("#add__activity").click(function () { // add dialog often
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

$(".save_btn").click(async function () {
  $(".modal").hide();
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