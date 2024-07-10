$('#mySelect2').change(async function () {
    notify('!', 'Đang tải dữ liệu...');
    const selectedYear = $('#mySelect2').val();
    const response = await fetch(`/api/getuserscore?schoolYear=${selectedYear}`);
    if (response.status == 200) {
        setTimeout(() => {
            toast.classList.remove('active');
        }, 500);
    }
    const data = await response.json();
    data.forEach((item) => {
        console.log(item.year);
        const totalResultElement = $(`.total-result[data-year="${item.year}_total"]`);
        document.querySelector(
            `td a#${item.year}`,
        ).href = `/hocsinh/xembangdiem?schoolYear=${item.year}_${selectedYear}`;
        totalResultElement.text(item.total);
    });

    // set nut xem ban diem cho tung muc
    const totalResultElements = document.querySelectorAll('.total-result');
    totalResultElements.forEach(function (element) {
        const nextTd = element.nextElementSibling;
        if (element.textContent.trim() === 'Chưa có điểm') {
            nextTd.querySelector('a').style.display = 'none';
            nextTd.nextElementSibling.querySelector('a').style.display = 'none';
        } else {
            nextTd.querySelector('a').style.display = 'block';
        }
    });
    notify('n', 'Thành công!');
});

// const downloadResult = document.querySelectorAll('tr td:last-child button');
// console.log(downloadResult)
// downloadResult.forEach((btn_down) => {
//     btn_down.onclick =  async function () {
//         // disabled button until it done start down load
//         let curr_tb_year =
//             btn_down.querySelector('a').id + '_' + $('#mySelect2 option:selected').text().trim()
//         console.log(curr_tb_year)
//         btn_down.disabled = true;
//             notify('!', 'Đợi chút đang xuất bảng điểm!');
//             try {
//                 const requestOptions = {
//                     method: 'GET',
//                 };
//                 const response = await fetch(
//                     `/api/exportStudentsScore?year=${curr_tb_year}`,
//                     requestOptions,
//                 );
//                 if (response.ok) {
//                     // reset export button to clickable
//                     btn_down.disabled = false;
//                     notify('n', 'Đã xuất bảng điểm thành công');
//                     // Tạo URL tạm thời cho dữ liệu Blob
//                     let blobUrl;
//                     response
//                         .blob()
//                         .then((blob) => {
//                             blobUrl = URL.createObjectURL(blob);
//                             // Tiếp tục xử lý
//                             const downloadLink = document.createElement('a');
//                             downloadLink.href = blobUrl;
//                             downloadLink.style.display = 'none';
//                             downloadLink.target = '_blank';
//                             document.body.appendChild(downloadLink);

//                             downloadLink.click();
//                             downloadLink.remove();

//                             URL.revokeObjectURL(blobUrl);
//                         })
//                         .catch((error) => {
//                             console.error('Lỗi trong quá trình tải dữ liệu:', error);
//                         });

//                     // Giải phóng URL tạm thời sau khi tải xuống hoàn thành
//                 } else if (response.status == 402) {
//                             btn_down.disabled = false
//                     // Error occurred during upload
//                     notify('x', 'Chưa chọn học sinh hoặc dữ liệu không hợp lệ!');
//                 } else if (response.status == 500) {
//                             btn_down.disabled = false;
//                     // Error occurred during upload
//                     notify('x', 'Có lỗi xảy ra!');
//                 }
//             } catch (error) {
//                 btn_down.disabled = false;
//                 console.log(error);
//                 notify('x', 'Có lỗi xảy ra!');
//             }

//     };

// })
