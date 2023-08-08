let listCb = $(".inp-cbx");
for (let i = 0; i < listCb.length; i++) {
  listCb[i].addEventListener("change", (event) => {
    if (event.target.checked) {
      let countChecked = 0;
      for (let i = 0; i < listCb.length; i++) {
        if (listCb[i].checked) {
          countChecked += 1;
        }
      }
      if (countChecked == listCb.length - 1) {
        $("#row0")[0].checked = true;
      }
    } else {
      $("#row0")[0].checked = false;
    }
  });
}
// chon tat ca
$("#row0")[0].addEventListener("change", (event) => {
  if (event.target.checked) {
    for (let i = 0; i < listCb.length; i++) {
      listCb[i].checked = true;
    }
  } else {
    for (let i = 0; i < listCb.length; i++) {
      listCb[i].checked = false;
    }
  }
});
