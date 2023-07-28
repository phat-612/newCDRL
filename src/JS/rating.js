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

$(".up-btn").click(function () {
  $(".modal").show();
});
