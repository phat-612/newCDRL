$(document).on("click", "#edit__class", async function () {
  // set name input as selected teacher's name
  $('.modal.edit .name--input').val($(this).parent().parent().find('.t_name').text());
  // set acount input as selected teacher's account
  $('.modal.edit .account--input').val($(this).parent().parent().find('.inp-cbx').val());
  // set combo box of edit one to curr branch 
  const curr_branch = $(this).parent().parent().find('.b_name').text();
  $('.modal.edit #select-level option').each(function() {
    if ($(this).text() == curr_branch) { // check for option that equal to curr branch
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
  $(".modal.add").show();
});

// hide add modal:
$(".modal.add").click(function () {
  $(".modal.add").hide();
});

$(".modal.add").click(function () {
  $(".modal.add").hide();
});

// hide add modal
$(".modal_wrap.add").click(function (e) {
  e.stopPropagation();
});

$(".exist_btn").click(function () {
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
  $('table tbody .inp-cbx').each(function () {
    if (!this.checked) check = false; return;
  })

  if (check) {
    $('.all-cbx').prop('checked', true);
  } else {
    $('.all-cbx').prop('checked', false);
  }
});