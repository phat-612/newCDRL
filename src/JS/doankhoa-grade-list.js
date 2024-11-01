let curr_tb_year =
    'HK' +
    $('.selectbox--hocky select option:selected').text().trim() +
    '_' +
    $('.nien_khoa select option:selected').text().trim();

$(document).on('change', '.--bomon select', async function () {
    const selectedBranch = $('.--bomon select option:selected').text().trim();

    let selectedBranchId;
    let selectedClassName;
    let classList = [];
    for (let i = 0; i < branch_list.length; i++) {
        if (branch_list[i].name === selectedBranch) {
            selectedBranchId = branch_list[i]._id;
            break;
        }
    }
    for (let i = 0; i < class_list.length; i++) {
        if (class_list[i].branch === selectedBranchId) {
            selectedClassName = class_list[i]._id;
            classList.push(selectedClassName);
        }
    }

    const selectElement = $('.--class select'); // Lấy thẻ select bằng jQuery
    // Xóa các phần tử hiện có trong select
    selectElement.empty();
    // Tạo các phần tử option từ mảng branch_list và thêm vào select
    $.each(classList, function (index, branch) {
        const option = $('<option></option>');
        option.val(branch);
        option.text(branch);
        selectElement.append(option);
    });
});

$(document).on('click', '.export_btn', async function () {
    // disabled button until it done start down load
    $('.export_btn').prop('disabled', true);
    $('.export_btn').text('Downloading...');
    notify('!', 'Đợi chút đang xuất bảng điểm!');
    const cls = $('.--class option:selected').text().trim();
    try {
        const requestOptions = {
            method: 'GET',
        };
        const response = await fetch(`/api/exportClassScore?year=${curr_tb_year}&cls=${cls}`, requestOptions);
        if (response.ok) {
            // reset export button to clickable
            $('.export_btn').prop('disabled', false);
            $('.export_btn').text('Xuất báo cáo');
            notify('n', 'Đã xuất bảng điểm thành công');
            // Tạo URL tạm thời cho dữ liệu Blob
            const blobUrl = URL.createObjectURL(await response.blob());

            // Tạo một thẻ <a> ẩn để tải xuống và nhấn vào nó
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = 'Bang_diem_ca_lop.xlsx'; // Đặt tên cho tệp tải xuống
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Giải phóng URL tạm thời sau khi tải xuống hoàn thành
            URL.revokeObjectURL(blobUrl);
        } else if (response.status == 500) {
            // Error occurred during upload
            notify('x', 'Có lỗi xảy ra!');
        }
    } catch (error) {
        console.log(error);
        notify('x', 'Có lỗi xảy ra!');
    }
});

$(document).on('click', '.export_one_btn', async function () {
    // disabled button until it done start down load
    let mssv_list = [];
    $('table tbody .inp-cbx').each(function () {
        if (this.checked) {
            mssv_list.push(this.value);
        }
    });
    if (mssv_list.length == 0) {
        return notify('x', 'Chưa chọn học sinh!');
    } else {
        $('.export_one_btn').prop('disabled', true);
        $('.export_one_btn').text('Downloading...');
        notify('!', 'Đợi chút đang xuất bảng điểm!');
        const cls = $('.--class option:selected').text().trim();
        try {
            const requestOptions = {
                method: 'GET',
            };
            const response = await fetch(
                `/api/exportStudentsScore?year=${curr_tb_year}&cls=${cls}&stdlist=${JSON.stringify(mssv_list)}`,
                requestOptions,
            );
            if (response.ok) {
                // reset export button to clickable
                $('.export_one_btn').prop('disabled', false);
                $('.export_one_btn').text('Xuất báo cáo cá nhân');
                notify('n', 'Đã xuất bảng điểm thành công');
                // Tạo URL tạm thời cho dữ liệu Blob
                let blobUrl;
                response
                    .blob()
                    .then((blob) => {
                        blobUrl = URL.createObjectURL(blob);
                        // Tiếp tục xử lý
                        const downloadLink = document.createElement('a');
                        downloadLink.href = blobUrl;
                        downloadLink.style.display = 'none';
                        downloadLink.target = '_blank';
                        document.body.appendChild(downloadLink);

                        downloadLink.click();
                        downloadLink.remove();

                        URL.revokeObjectURL(blobUrl);
                    })
                    .catch((error) => {
                        console.error('Lỗi trong quá trình tải dữ liệu:', error);
                    });

                // Giải phóng URL tạm thời sau khi tải xuống hoàn thành
            } else if (response.status == 402) {
                $('.export_one_btn').prop('disabled', false);
                $('.export_one_btn').text('Xuất báo cáo cá nhân');
                // Error occurred during upload
                notify('x', 'Chưa chọn học sinh hoặc dữ liệu không hợp lệ!');
            } else if (response.status == 500) {
                $('.export_one_btn').prop('disabled', false);
                $('.export_one_btn').text('Xuất báo cáo cá nhân');
                // Error occurred during upload
                notify('x', 'Có lỗi xảy ra!');
            }
        } catch (error) {
            $('.export_one_btn').prop('disabled', false);
            $('.export_one_btn').text('Xuất báo cáo cá nhân');
            console.log(error);
            notify('x', 'Có lỗi xảy ra!');
        }
    }
});

$(document).on('click', '.auto_mark_btn', async function () {
    // disabled button until it done start down load
    $('.auto_mark_btn').prop('disabled', true);
    $('.auto_mark_btn').text('Loading...');
    try {
        // get all student was check
        let mssv_list = [];
        $('table tbody .inp-cbx').each(function () {
            let score = $(this).parent().parent().parent().find('.first_score').text().trim();
            if (score != '-' && score != '' && this.checked) {
                mssv_list.push(this.value);
            }
        });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                year: curr_tb_year,
                std_list: mssv_list,

                cls: $('.--class option:selected').text().trim(),
            }),
        };
        if (mssv_list.length > 0) {
            const response = await fetch('/api/doan_khoa/autoMark', requestOptions);
            if (response.ok) {
                $('.auto_mark_btn').prop('disabled', false);
                $('.auto_mark_btn').text('Duyệt bảng điểm đã chọn');

                $('table tbody .inp-cbx').each(function () {
                    let check = $(this).parent().parent().parent().find('.chamdiem').text().trim();
                    if (check == 'Chấm điểm' && this.checked) {
                        let score = $(this).parent().parent().parent().find('.first_score').text().trim();

                        // xoá vàng khè
                        $(this).parent().parent().parent().find('.first_score').removeClass('new_update');
                        $(this).parent().parent().parent().find('.khoa_score').addClass('new_update');

                        $(this).parent().parent().parent().find('.khoa_score').text(score);
                    }
                });

                notify('n', 'Đã hoàn tất chấm điểm tự động những sinh viên được đánh dấu!');
            } else if (response.status == 500) {
                $('.auto_mark_btn').prop('disabled', false);
                $('.auto_mark_btn').text('Duyệt bảng điểm đã chọn');
                // Error occurred during upload
                notify('x', 'Có lỗi xảy ra!');
            }
        } else {
            $('.auto_mark_btn').prop('disabled', false);
            $('.auto_mark_btn').text('Duyệt bảng điểm đã chọn');
            notify('!', 'Không có sinh viên được đánh dấu hoặc không đủ điều kiện để chấm điểm.');
        }
    } catch (error) {
        notify('x', 'Có lỗi xảy ra!');
    }
});

$(document).on('click', '.button-35-a', async function () {
    // show loading animation
    $('.loader-parent').css('display', 'flex');
    $('.loader-parent').show();
    $('.table_container').hide();

    // disabled button until it done start down load
    $('.load_list_btn').prop('disabled', true);
    $('.load_list_btn').text('Loading...');
    notify('!', 'Đợi chút đang tải bảng điểm!');
    try {
        const year =
            'HK' +
            $('.selectbox--hocky select option:selected').text().trim() +
            '_' +
            $('.nien_khoa select option:selected').text().trim();
        const bo_mon = $('.--bomon option:selected').val();
        const lop = $('.--class option:selected').text().trim();

        const requestOptions = {
            method: 'GET',
        };

        const response = await fetch(
            `/api/doan_khoa/loadScoresList?year=${year}&bo_mon=${bo_mon}&class=${lop}`,
            requestOptions,
        );

        if (response.ok) {
            const data = await response.json();
            const year_available = data.year_available.year;

            // empty old table:
            $('table tbody').empty();
            // load new table:
            for (let i = 0; i < data.student_list.length; i++) {
                const curr_year_total = data.student_list[i].total_score[year];

                if (curr_year_total) {
                    let newdep = 'khoa_score',
                        newstf = 'first_score',
                        newstd = 'zero_score';
                    if (curr_year_total.dep || curr_year_total.dep === 0) {
                        newdep = 'new_update khoa_score';
                    } else if (curr_year_total.stf || curr_year_total.stf === 0) {
                        newstf = 'new_update first_score';
                    } else if (curr_year_total.std || curr_year_total.std === 0) {
                        newstd = 'new_update zero_score';
                    } else {
                        newstd = 'zero_score';
                    }
                    const std_score_html =
                        curr_year_total.std || curr_year_total.std === 0
                            ? `<td class="${newstd}">${curr_year_total.std}</td>`
                            : `<td class="${newstd}">-</td>`;
                    const stf_score_html =
                        curr_year_total.stf || curr_year_total.stf === 0
                            ? `<td class="${newstf}">${curr_year_total.stf}</td>`
                            : `<td class="${newstf}">-</td>`;
                    const dep_score_html =
                        curr_year_total.dep || curr_year_total.dep === 0
                            ? `<td class="${newdep}">${curr_year_total.dep}</td>`
                            : `<td class="${newdep}">-</td>`;
                    const maker_html = curr_year_total.marker ? `<td>${curr_year_total.marker}</td>` : `<td>-</td>`;
                    if (curr_year_total.std != '-') {
                        $('table tbody').append(`
          <tr>
            <td>
              <div class="checkbox-wrapper-4">
                <input type="checkbox" id="row${i + 1}" class="inp-cbx" value="${data.student_list[i]._id}" />
                <label for="row${i + 1}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                </label>
              </div>
            </td>
            <td>${i + 1}</td>
            <td>${data.student_list[i]._id}</td>
            <td class='std_name_row'>${data.student_list[i].last_name + ' ' + data.student_list[i].first_name}</td>
            ${std_score_html}
            ${stf_score_html}
            ${maker_html}
            ${dep_score_html}
            <td><a class="chamdiem">Chấm điểm</a></td>
          </tr>
          `);
                    } else {
                        $('table tbody').append(`
          <tr>
            <td>
              <div class="checkbox-wrapper-4">
                <input type="checkbox" id="row${i + 1}" class="inp-cbx" value="${data.student_list[i]._id}" />
                <label for="row${i + 1}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                </label>
              </div>
            </td>
            <td>${i + 1}</td>
            <td>${data.student_list[i]._id}</td>
            <td class='std_name_row'>${data.student_list[i].last_name + ' ' + data.student_list[i].first_name}</td>
            ${std_score_html}
            ${stf_score_html}
            ${maker_html}
            ${dep_score_html}
            <td>-</td>
          </tr>
          `);
                    }

                    // add '*' to student have not mark yet
                    if (curr_year_total.std || curr_year_total.std == 0) {
                        $('table tbody tr').eq(i).find('.std_name_row').append(`<span class="dau_sao">*</span>`);
                    }
                } else {
                    // student do not have any score
                    $('table tbody').append(`
          <tr>
            <td>
              <div class="checkbox-wrapper-4">
                <input type="checkbox" id="row${i + 1}" class="inp-cbx" value="${data.student_list[i]._id}" />
                <label for="row${i + 1}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                </label>
              </div>
            </td>
            <td>${i + 1}</td>
            <td>${data.student_list[i]._id}</td>
            <td class='std_name_row'>${data.student_list[i].last_name + ' ' + data.student_list[i].first_name}</td>
            <td class="zero_score">-</td>
            <td class="first_score">-</td>
            <td>-</td>
            <td class="khoa_score">-</td>
            <td>-</td>
          </tr>
          `);

                    $('table tbody tr').eq(i).find('.std_name_row').append(`<span class="dau_sao">*</span>`);
                }
            }
            $('.chamdiem').click(function () {
                const cur_tb_year =
                    'HK' +
                    $('.selectbox--hocky select option:selected').text().trim() +
                    '_' +
                    $('.nien_khoa select option:selected').text().trim();

                if (year_available >= cur_tb_year) {
                    const studentId = $(this).closest('tr').find('td:nth-child(3)').text();
                    const className = $('.--class option:selected').text().trim();

                    this.href = `/doankhoa/nhapdiemdanhgia?schoolYear=${cur_tb_year}&studentId=${studentId}&class=${className}`;
                } else {
                    notify('!', 'chưa mở chấm điểm vui lòng chọn năm khác.');
                }
            });

            // update current table school year
            curr_tb_year = year;

            // hide loading animation
            $('.loader-parent').hide();
            $('.table_container').show();

            // reset export button to clickable
            $('.load_list_btn').prop('disabled', false);
            $('.load_list_btn').text('Chọn');
            notify('n', 'Đã hoàn tất tải bảng điểm.');
        } else if (response.status == 500) {
            // hide loading animation
            $('.loader-parent').hide();
            $('.table_container').show();

            // reset export button to clickable
            $('.load_list_btn').prop('disabled', false);
            $('.load_list_btn').text('Chọn');
            // Error occurred during upload
            notify('x', 'Có lỗi xảy ra!');
        }
    } catch (error) {
        // hide loading animation
        $('.loader-parent').hide();
        $('.table_container').show();

        // reset export button to clickable
        $('.load_list_btn').prop('disabled', false);
        $('.load_list_btn').text('Chọn');
        console.log(error);
        notify('x', 'Có lỗi xảy ra!');
    }
});

$('.chamdiem').click(function () {
    const cur_tb_year =
        'HK' +
        $('.selectbox--hocky select option:selected').text().trim() +
        '_' +
        $('.nien_khoa select option:selected').text().trim();

    if (year_cur >= cur_tb_year) {
        const studentId = $(this).closest('tr').find('td:nth-child(3)').text().trim();
        const className = $('.--class option:selected').text().trim();

        this.href = `/doankhoa/nhapdiemdanhgia?schoolYear=${cur_tb_year}&studentId=${studentId}&class=${className}`;
    } else {
        notify('!', 'chưa mở chấm điểm vui lòng chọn năm khác.');
    }
});

$(document).on('change', '.all-cbx', async function () {
    if ($('.all-cbx')[0].checked) {
        $('table tbody .inp-cbx').prop('checked', true);
    } else {
        $('table tbody .inp-cbx').prop('checked', false);
    }
});
// if all checkboxs was check all-cbx will tick
$(document).on('change', '.inp-cbx', async function () {
    let check = true;
    $('table tbody .inp-cbx').each(function () {
        if (!this.checked) check = false;
        return;
    });

    if (check) {
        $('.all-cbx').prop('checked', true);
    } else {
        $('.all-cbx').prop('checked', false);
    }
});

let sortOrder = 'desc';
$(document).on('click', '.sort_name', async function () {
    let rows = $('table tbody tr').get();
    rows.sort((a, b) => {
        let keyA = $(a).find('.t_name').text().toUpperCase();
        let keyB = $(b).find('.t_name').text().toUpperCase();
        console.log(keyA, keyB);

        if (sortOrder === 'asc') {
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
        } else {
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
        }
        return 0;
    });
    $.each(rows, function (_, row) {
        $('table tbody').append(row);
    });

    // Update row numbers
    $('table tbody')
        .children('tr')
        .each(function (index) {
            $(this)
                .find('.nums')
                .text(index + 1);
        });
    console.log(sortOrder);

    if (sortOrder === 'asc') {
        $(this).html('Họ Tên <i class="fal fa-sort-alpha-up"></i>');
    } else {
        $(this).html('Họ Tên  <i class="fal fa-sort-alpha-down"></i>');
    }
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    console.log(sortOrder);
});

$(document).on('click', '.sort_score', async function () {
    let rows = $('table tbody tr').get();
    rows.sort((a, b) => {
        let keyA = $(a).find('.khoa_score').text().toUpperCase();
        let keyB = $(b).find('.khoa_score').text().toUpperCase();
        console.log(keyA, keyB);

        if (sortOrder === 'asc') {
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
        } else {
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
        }
        return 0;
    });
    $.each(rows, function (_, row) {
        $('table tbody').append(row);
    });

    // Update row numbers
    $('table tbody')
        .children('tr')
        .each(function (index) {
            $(this)
                .find('.nums')
                .text(index + 1);
        });
    console.log(sortOrder);

    if (sortOrder === 'asc') {
        $(this).html('Tổng Điểm Chính Thức <i class="fal fa-sort-numeric-up"></i>');
    } else {
        $(this).html('Tổng Điểm Chính Thức <i class="fal fa-sort-numeric-down"></i>');
    }
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    console.log(sortOrder);
});


$(document).on('click', '.sort_zero', async function () {
    let rows = $('table tbody tr').get();
    rows.sort((a, b) => {
        let keyA = $(a).find('.zero_score').text().toUpperCase();
        let keyB = $(b).find('.zero_score').text().toUpperCase();
        console.log(keyA, keyB);

        if (sortOrder === 'asc') {
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
        } else {
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
        }
        return 0;
    });
    $.each(rows, function (_, row) {
        $('table tbody').append(row);
    });

    // Update row numbers
    $('table tbody')
        .children('tr')
        .each(function (index) {
            $(this)
                .find('.nums')
                .text(index + 1);
        });
    console.log(sortOrder);

    if (sortOrder === 'asc') {
        $(this).html('Điểm Tự Chấm <i class="fal fa-sort-numeric-up"></i>');
    } else {
        $(this).html('Điểm Tự Chấm <i class="fal fa-sort-numeric-down"></i>');
    }
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    console.log(sortOrder);
});

$(document).on('click', '.sort_s1', async function () {
    let rows = $('table tbody tr').get();
    rows.sort((a, b) => {
        let keyA = $(a).find('.first_score').text().toUpperCase();
        let keyB = $(b).find('.first_score').text().toUpperCase();
        console.log(keyA, keyB);

        if (sortOrder === 'asc') {
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
        } else {
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
        }
        return 0;
    });
    $.each(rows, function (_, row) {
        $('table tbody').append(row);
    });

    // Update row numbers
    $('table tbody')
        .children('tr')
        .each(function (index) {
            $(this)
                .find('.nums')
                .text(index + 1);
        });
    console.log(sortOrder);

    if (sortOrder === 'asc') {
        $(this).html('Tổng điểm Lần 1 <i class="fal fa-sort-numeric-up"></i>');
    } else {
        $(this).html('Tổng điểm Lần 1 <i class="fal fa-sort-numeric-down"></i>');
    }
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    console.log(sortOrder);
});

$(document).on('click', '.sort_num', async function () {
    console.log('olllll');

    let rows = $('table tbody tr').get();
    rows.sort((a, b) => {
        let keyA = parseInt($(a).find('.nums').text());
        let keyB = parseInt($(b).find('.nums').text());
        if (sortOrder === 'asc') {
            return keyA - keyB;
        } else {
            return keyB - keyA;
        }
    });
    $.each(rows, function (index, row) {
        $('table tbody').append(row);
    });

    if (sortOrder === 'asc') {
        $(this).html('STT <i class="fal fa-sort-numeric-down"></i>');
    } else {
        $(this).html('STT <i class="fal fa-sort-numeric-up"></i>');
    }
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
});