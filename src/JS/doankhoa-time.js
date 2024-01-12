function update_cbx() {
    // check to cahnge text before checkbox
    const curr_date = new Date().getTime();
    const start_date = new Date($('.start_time').val()).getTime();
    const end_date = new Date($('.end_time').val()).getTime();

    if (start_date <= end_date || !$('.end_time').val()) {
        if (start_date <= curr_date && (curr_date <= end_date || !$('.end_time').val())) {
            $('.inp-cbx').prop('checked', true);
            $('.close_now').text('Đang diễn ra');
        } else if (start_date > curr_date) {
            $('.inp-cbx').prop('checked', false);
            $('.close_now').text('Sắp diễn ra');
        } else if (curr_date > end_date) {
            $('.inp-cbx').prop('checked', false);
            $('.close_now').text('Đã kết thúc');
        }

        $('.modal').hide();
    } else {
        notify('!', 'Ngày bắt đầu đước diễn ra trước ngày kết thúc!');
    }
}

$('.inp-cbx').change(function () {
    // find yesterday
    let now = new Date();
    let day = ('0' + (now.getDate() - 1)).slice(-2);
    let month = ('0' + (now.getMonth() + 1)).slice(-2);
    let yesterday = now.getFullYear() + '-' + month + '-' + day + 'T00:00:00';
    console.log(yesterday);

    if (this.checked) {
        // set start date to yesterday and set end date to foreverday
        $('.start_time').val(yesterday);
        $('.end_time').val('');
        // change cbx to 'Đang diễn ra'
        $('.close_now').text('Đang diễn ra');
    } else {
        // set both start date and end date to yesterday
        $('.start_time').val(yesterday);
        $('.end_time').val(yesterday);
        // change cbx to 'Đã kết thúc'
        $('.close_now').text('Đã kết thúc');
    }
});

$('.more_auto').click(function () {
    $('.modal').show();
});

$(document).on('click', '.modal', () => {
    update_cbx();
});

$(document).on('click', '.modal_wrap', (e) => {
    e.stopPropagation();
});

// hide pop up when click set_day button
$(document).on('click', '.setd_btn', () => {
    update_cbx();
});

$(document).on('click', '.save-btn', SaveButtonClick);
async function SaveButtonClick(event) {
    event.preventDefault();
    try {
        const HK = $('#mySelect1').val();
        const school_year = $('#mySelect2').val();
        const start_day = $('.start_time').val() + ':00.000Z';
        const end_day = $('.end_time').val() + ':00.000Z';

        let data = JSON.stringify({
            sch_y: `HK${HK}_${school_year}`,
            start_day: start_day,
            end_day: end_day,
        });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        };

        const response = await fetch('/api/changeDeadLine', requestOptions);
        if (response.ok) {
            notify('n', 'Cập nhật thành công!');
        } else if (response.status == 500) {
            // Error occurred during upload
            notify('x', 'Có lỗi xảy ra!');
        }
    } catch (error) {
        console.log(error);
        notify('x', 'Có lỗi xảy ra!');
    }
}

// clear end_time input
$(document).on('click', '.time_set_note a', () => {
    $('.end_time').val('');
});
