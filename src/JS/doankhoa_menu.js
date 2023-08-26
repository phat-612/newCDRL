$(".menu_item_more").click(function(){
  $(this).find(".lop_item").toggle();
});



  $("summary").click(function(){
    $(this).toggleClass("active");
    if ($(this).hasClass("active")) {
      $(this).html('<i class="fas fa-xmark"></i>');
    } else {
      $(this).html('<i class="fa-solid fa-bars"></i>');
    }
  });

  const cur_link =  window.location.href
const menu_item = $(".menu a")
console.log(menu_item)
for(const item of menu_item){
  if(cur_link === item.href){
    item.style.color = 'red'
  }
}