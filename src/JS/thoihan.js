$('.inp-cbx').change(function () {
  if (this.checked) {
    $('.close_now').text('Đang diễn ra');
  } else {
    $('.close_now').text('Đã kết thúc');
  }
});

$(".more_auto").click(function () {
  $(".modal").show();
});

$(document).on("click", ".modal", ()=>{
  $(".modal").hide();
})

$(document).on("click", ".modal_wrap", (e)=>{
  e.stopPropagation();
})


$(document).on("click", ".save-btn", SaveButtonClick);
async function SaveButtonClick(event) {
  event.preventDefault();
  try {
    const HK = $('#mySelect1').val();
    const school_year = $('#mySelect2').val();
    const mark = $('.inp-cbx').checked
    let start_day = new Date();
    let end_day = new Date("October 18, 2003");;
    
    // set start day to yesterday if user do not set it
    if ( $('.inp-cbx').checked) {
      start_day.setDate(date.getDate() - 1);
    }

    // 

    let data = JSON.stringify({
      sch_y: `HK${HK}_${school_year}`,
      start_day: start_day,
      end_day: end_day
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    };
    const response = await fetch('/api/changeDeadLine', requestOptions);
    if (response.ok) {
      notify('n', 'cập nhật thành công!');
      setTimeout(() => { window.location.reload(); },
        2000)
    } else if (response.status == 500) {
      // Error occurred during upload
      notify('x', 'Có lỗi xảy ra!');
    }

  } catch (error) {
    console.log(error);
    notify('x', 'Có lỗi xảy ra!');
  }
}

