function Setting_pageWrapper_drop() {
  for (const key of Setting_pageWrapper) {
    key.style.display = "none";
  }
}

function Setting_item_drop() {
  for (const key of Setting_item) {
    key.style.backgroundColor = "transparent";
  }
}

function page5_composed_drop() {
  // ẩn page5_composed
  for (const key of page5_composed) {
    key.style.display = "none";
  }
}

function page5_a_up_drop() {
  for (const key of page5_a_up) {
    key.style.display = "none";
  }
}
$(document).ready(function () {
  $(".up-btn").click(function () {
    $(".modal").show();
  });

  $(".close-dialog").click(function () {
    $(".modal").hide();
  });
});

$(document).mouseup(function (e) {
  var container = $(".modal");

  // if the target of the click isn't the container nor a descendant of the container
  if (container.is(e.target) && container.has(e.target).length === 0) {
    container.hide();
  }
});
