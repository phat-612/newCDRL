$(".inp-cbx").change(async function () {
  const regex = /\/([^/]+)\/([^/]+)$/;
  let level;
  let _id;

  const matches = currentUrl.match(regex);
  if (matches) {
    const [_, group1, group2] = matches;
    level = group1;
    _id = group2;
  } else {
    console.log("No match found.");
  }

  console.log(level, _id);

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      _id: _id,
      level: level,
      status: $(this).val()
    }),
  };

  const response = await fetch("/api/updateActivitiesStatus", requestOptions);
  if (response.ok) {

    // change value and text of current check box to "Đang diển ra" or "Đã kết thúc"
    if ($(this).val() == '1') {
      $('.close_now').text('Đã kết thúc');
      $(this).val() = '0';
    } else if ($(this).val() == '0') {
      $('.close_now').text('Đang diễn ra');
      $(this).val() = '1';
    }
  } else if (response.status == 500) {
    // Error occurred during upload
    notify("x", "Có lỗi xảy ra!");
  }
});
