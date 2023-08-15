$(document).on("click", "#edit__subject", async function () { // this way get all in group(id/name/class)
  $(".modal.edit").show();
});

$(".modal.edit").click(function () { // this way get only the first one
  $(".modal.edit").hide();
});

$(".modal_wrap.edit").click(function (e) {
  e.stopPropagation();
});

$("#add__subject").click(function () {
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

//save button
$(".save_btn").click(function () {
  $(".modal.add").hide();
  $(".modal.edit").hide();
});

// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
$(document).on("change", ".all-cbx", async function () {
  if ($('.all-cbx')[0].checked) {
    $('table tbody .inp-cbx').prop('checked', true);
  } else {
    $('table tbody .inp-cbx').prop('checked', false);
  }
});

// if all checkboxs was check all-cbx will tick
$(document).on("change", ".inp-cbx", async function () {
  let check = true
  $('table tbody .inp-cbx').each(function(){
    if (!this.checked) check = false; return;
  })

  if (check) {
    $('.all-cbx').prop('checked', true);
  } else {
    $('.all-cbx').prop('checked', false);
  }
});
