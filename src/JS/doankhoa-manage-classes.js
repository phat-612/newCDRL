let curr_edit;
let old_id;

$(document).on("click", "#edit__class", async function () {
  // check current line for future use
  curr_edit = $(this).parent().parent();
  // get old name (here to change old name every time new edit row)
  old_id = curr_edit.find(".inp-cbx").val();

  // set default edit info
  // class name
  $(".subject--input").val(old_id);

  // branch
  $('.bo_mon #select-level option').each(function () {
    if ($(this).text() == curr_edit.find('.b_name').text()) { // check for option that equal to curr branch
      $(this).prop("selected", 'selected'); // sellect this option 
    }
  });
  // teacher
  $('.co_van #select-level option').each(function () {
    if ($(this).text() == curr_edit.find('.t_name').text()) { // check for option that equal to curr branch
      $(this).prop("selected", 'selected'); // sellect this option 
    }
  });

  $(".modal.edit").show();
});

$(".modal.edit").click(function () {
  $(".modal.edit").hide();
});

$(".modal_wrap.edit").click(function (e) {
  e.stopPropagation();
});

$("#add__class").click(function () {
  // clear old name whenever it not edit
  old_name = '';
  // set curent edit to start
  curr_edit = undefined;

  $(".modal.add").show();
});

$(".modal.add").click(function () {
  $(".modal.add").hide();
});

$(".modal_wrap.add").click(function (e) {
  e.stopPropagation();
});

// hide when click exist button
$(".exist_btn").click(function () {
  $(".modal.add").hide();
  $(".modal.edit").hide();
});

// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
$(document).on("change", ".all-cbx", async function () {
  if ($(".all-cbx")[0].checked) {
    $("table tbody .inp-cbx").prop("checked", true);
  } else {
    $("table tbody .inp-cbx").prop("checked", false);
  }
});

// if all checkboxs was check all-cbx will tick
$(document).on("change", ".inp-cbx", async function () {
  let check = true;
  $("table tbody .inp-cbx").each(function () {
    if (!this.checked) check = false;
    return;
  });

  if (check) {
    $(".all-cbx").prop("checked", true);
  } else {
    $(".all-cbx").prop("checked", false);
  }
});
