const lastSegment = window.location.href.substr(
  window.location.href.lastIndexOf("/") + 1
);
const item = document.querySelectorAll(".footer a");

function dropItem() {
  for (const child of item) {
    child.querySelector("i").classList.remove("active");
  }
}

if (lastSegment == "logout") {
  item[0].querySelector("i").classList.add("active");
} else if (lastSegment == "nhapdiemdanhgia") {
  item[1].querySelector("i").classList.add("active");
} else if (lastSegment == "profile") {
  item[3].querySelector("i").classList.add("active");
}

$(".a_menu").click(function () {
    $(".modal").addClass("modal_show");
    $(".modal_wrap").removeClass("slideInDown");
    $(".modal_wrap").addClass("slideInUp");
    
});

$(".modal").click(function () {
  $(".modal_wrap").addClass("slideInDown"); 
  setTimeout(() => {
    $(".modal").removeClass("modal_show");
    $(".modal_wrap").removeClass("slideInUp");
  }, 1000);
});

$(".modal_wrap").click(function (e) {
  e.stopPropagation();
});

$(".close_menu").click(function () {
  $(".modal_wrap").addClass("slideInDown");
  setTimeout(() => {
    $(".modal").removeClass("modal_show");
    $(".modal_wrap").removeClass("slideInUp");
  }, 1000); 
})
// const cur_link = window.location.href
// const menu_item = $(".menu a")
for (const item of menu_item) {
  if (cur_link === item.href) {
    item.style.color = 'red'
  }
}
$(".footer_item_more").click(function () {
    $(this).find("i").toggleClass('fa-chevron-down fa-chevron-up');
    $(this).find(".lop_item").toggle();
  });
