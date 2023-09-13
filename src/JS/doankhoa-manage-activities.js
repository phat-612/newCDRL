$(document).on("change", "#select-level1", async function () {
  if ($(this).val() === "lop") {
    $("#select_lop1").show();
  } else {
    $("#select_lop1").hide();
  }
});

$(document).on("change", "#select-level2", async function () {
  console.log("aaa");
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
      console.log("hahahaa");
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
  console.log(selectedBranchId);
  console.log(selectedBranch);
  console.log(classList);
});

$(".save_btn").click(async function () {
  $(".modal").hide();
});

$(".exist_btn").click(async function () {
  $(".modal").hide();
});
