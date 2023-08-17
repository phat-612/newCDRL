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

// hide pop up when click set_day button
$(document).on("click", ".setd_btn", ()=> {
  // check to cahnge text before checkbox
  const curr_date = new Date();
  const start_date = new Date($('.start_time').val());
  const end_date = new Date($('.end_time').val());

  if (start_date <= end_date) {
    if (start_date <= curr_date && curr_date <= end_date) {
      $('.inp-cbx').prop('checked', true);
      $('.close_now').text('Đang diễn ra');
    } else if (start_date > curr_date) {
      $('.inp-cbx').prop('checked', false);
      $('.close_now').text('Sắp diễn ra');
    } else if (curr_date > end_date) {
      $('.inp-cbx').prop('checked', false);
      $('.close_now').text('Đã kết thúc');
    }
  
    $(".modal").hide();
  } else {
    notify('!', 'Ngày bắt đầu đước diễn ra trước ngày kết thúc!')
  }
})

$(document).on("click", ".save-btn", SaveButtonClick);
async function SaveButtonClick(event) {
  event.preventDefault();
  try {
    const HK = $('#mySelect1').val();
    const school_year = $('#mySelect2').val();
    const start_day = new Date($('.start_time').val());
    const end_day = $('.end_time').val();

    if (end_day) {
      end_day = new Date(end_day);
    }

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

