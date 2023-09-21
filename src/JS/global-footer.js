const lastSegment = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
const item = document.querySelectorAll(".footer a");

function dropItem() {
  for (const child of item) {
    child.querySelector("i").classList.remove("active");
  }
}

// if (lastSegment == "logout") {
//   item[0].querySelector("i").classList.add("active");
// } else if (lastSegment == "nhapdiemdanhgia") {
//   item[1].querySelector("i").classList.add("active");
// } else if (lastSegment == "profile") {
//   item[3].querySelector("i").classList.add("active");
// }

var isMenuOpen = false;


$(".a_menu").click(function () {
  if (isMenuOpen) {
    $(".foot_modal .modal_wrap").removeClass("slideInUp");
    $(".foot_modal .modal_wrap").addClass("slideInDown");
    setTimeout(function () {
      $(".foot_modal").removeClass("modal_show");
    }, 500);
    $(this).html('<i class="fa-solid fa-bars"></i>');
    
    isMenuOpen = false;
  } else {
    $(".foot_modal").addClass("modal_show");
    $(".foot_modal .modal_wrap").removeClass("slideInDown");
    $(".foot_modal .modal_wrap").addClass("slideInUp");
    $(this).html('<i class="fa-solid fa-angles-down"></i>');
    isMenuOpen = true;
  }
});


$(".foot_modal").click(function () {
  $(".foot_modal .modal_wrap").addClass("slideInDown");
  setTimeout(() => {
    $(".foot_modal").removeClass("modal_show");
    $(".foot_modal .modal_wrap").removeClass("slideInUp");
  }, 1000);
});

$(".foot_modal .modal_wrap").click(function (e) {
  e.stopPropagation();
});

$(".close_menu").click(function () {
  $(".foot_modal .modal_wrap").addClass("slideInDown");
  setTimeout(() => {
    $(".foot_modal").removeClass("modal_show");
    $(".foot_modal .modal_wrap").removeClass("slideInUp");
  }, 1000);
  $(".a_menu").html('<i class="fa-solid fa-bars"></i>');
});

const cur_links = window.location.href;
const limkitem = document.querySelectorAll(".foot_modal a");

for (const item of limkitem) {
  if (cur_links === item.href) {
    item.style.color = "red";
  }
}
$(".footer_item_more").click(function () {
  $(this).find("i").toggleClass("fa-chevron-down fa-chevron-up");
  $(this).find(".lop_item").toggle();
});
