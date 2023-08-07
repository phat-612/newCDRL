$(".more_list").click(function () {
    $(".modal").show();
  });

  $(".modal").click(function () {
    $(".modal").hide();
  });
  $(".modal_wrap").click(function (e) {
    e.stopPropagation();
  });