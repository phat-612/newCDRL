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
  console.log('tự động chấm điểm')
});

$(document).on("click", ".load_list_btn", async function () {
  console.log('load danh sách')
});