$("#edit__subject").click(function () {
    $(".modal.edit").show();
  });

  $(".modal.edit").click(function () {
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
