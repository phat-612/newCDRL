$(document).on("click", ".export_btn", async function () {
  // disabled button until it done start down load
  $('.export_btn').prop('disabled', true);
  $('.export_btn').text('Downloading...')
  notify('!', 'Đợi chút đang xuất bảng điểm!');
  try {
    const year = "HK" + $(".hoc_ky select option:selected").text() + "_" + $(".nien_khoa select option:selected").text();

    const requestOptions = {
      method: 'GET',
    };
    const response = await fetch(`/api/exportClassScore?year=${year}`, requestOptions);
    if (response.ok) {
      // reset export button to clickable
      $('.export_btn').prop('disabled', false);
      $('.export_btn').text('Xuất báo cáo')
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
    }
    else if (response.status == 500) {
      // Error occurred during upload
      notify('x', 'Có lỗi xảy ra!');
    }
  } catch (error) {
    console.log(error);
    notify('x', 'Có lỗi xảy ra!');
  }
});

$(document).on("click", ".auto_mark_btn", async function () {

});

$(document).on("click", ".load_list_btn", async function () {
  // disabled button until it done start down load
  $('.load_list_btn').prop('disabled', true);
  $('.load_list_btn').text('Loading...')
  notify('!', 'Đợi chút đang tải bảng điểm!');
  try {
    const year = "HK" + $(".hoc_ky select option:selected").text() + "_" + $(".nien_khoa select option:selected").text();

    const requestOptions = {
      method: 'GET',
    };

    const response = await fetch(`/api/loadScoresList?year=${year}`, requestOptions);
    
    if (response.ok) {
      const data = await response.json();
      // empty old table:
      $('table tbody').empty();
      // load new table:
      for (let i = 0; i < data.student_list.length; i++) {
        $('table tbody').append(`
        <tr>
          <td>
            <div class="checkbox-wrapper-4">
              <input type="checkbox" id="row${i+1}" class="inp-cbx" value="${data.student_list[i]._id}" />
              <label for="row${i+1}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
              </label>
            </div>
          </td>
          <td>${i+1}</td>
          <td>${data.student_list[i]._id}</td>
          <td class='std_name_row'>${data.student_list[i].last_name + " " +  data.student_list[i].first_name}</td>
          <td class="new_update">${data.student_scores[i]}</td>
          <td>${data.staff_scores[i]}</td>
          <td>${data.staff_name[i]}</td>
          <td>${data.department_scores[i]}</td>
          <td><a href="#">Chấm điểm</a></td>
        </tr>
        `);

        // add '*' to student have not mark yet
        if(data.student_scores[i] == '-' ||  data.student_scores[i]== 0){
          $('table tbody').children().eq(i).find('.std_name_row').append(`<span class="dau_sao">*</span>`);
        }
      } 

      // reset export button to clickable
      $('.load_list_btn').prop('disabled', false);
      $('.load_list_btn').text('Chọn')
      notify('n', 'Đã hoàn tất tải bảng điểm.');
    }
    else if (response.status == 500) {
      // Error occurred during upload
      notify('x', 'Có lỗi xảy ra!');
    }
  } catch (error) {
    console.log(error);
    notify('x', 'Có lỗi xảy ra!');
  }
});

