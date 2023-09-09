let curr_tb_year =
  "HK" +
  $(".hoc_ky select option:selected").text() +
  "_" +
  $(".nien_khoa select option:selected").text();
$(document).on("click", ".export_btn", async function () {
  // disabled button until it done start down load
  $(".export_btn").prop("disabled", true);
  $(".export_btn").text("Downloading...");
  notify("!", "Đợi chút đang xuất bảng điểm!");
  try {
    const requestOptions = {
      method: "GET",
    };
    const response = await fetch(
      `/api/exportClassScore?year=${curr_tb_year}`,
      requestOptions
    );
    if (response.ok) {
      // reset export button to clickable
      $(".export_btn").prop("disabled", false);
      $(".export_btn").text("Xuất báo cáo");
      notify("n", "Đã xuất bảng điểm thành công");
      // Tạo URL tạm thời cho dữ liệu Blob
      const blobUrl = URL.createObjectURL(await response.blob());

      // Tạo một thẻ <a> ẩn để tải xuống và nhấn vào nó
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "Bang_diem_ca_lop.xlsx"; // Đặt tên cho tệp tải xuống
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Giải phóng URL tạm thời sau khi tải xuống hoàn thành
      URL.revokeObjectURL(blobUrl);
    } else if (response.status == 500) {
      // Error occurred during upload
      notify("x", "Có lỗi xảy ra!");
    }
  } catch (error) {
    console.log(error);
    notify("x", "Có lỗi xảy ra!");
  }
});

$(document).on("click", ".auto_mark_btn", async function () {
  // disabled button until it done start down load
  $(".auto_mark_btn").prop("disabled", true);
  $(".auto_mark_btn").text("Loading...");
  try {
    // get all student was check
    let mssv_list = [];
    $("table tbody .inp-cbx").each(function () {
      let cdiem = $(this)
        .parent()
        .parent()
        .parent()
        .find(".set_score_btn")
        .text()
        .trim();
        let score = $(this)
        .parent()
        .parent()
        .parent()
        .find(".zero_score")
        .text()
        .trim();
      if (cdiem == 'Chấm điểm' && score != "-" && score != "" && this.checked) {
        console.log('gaga')
        // $(this).parent().parent().parent().find(".first_score").text(score);
        mssv_list.push(this.value);
      }
      // else {
      //   mssv_list = []
      //   return false;
      // }
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year: curr_tb_year,
        std_list: mssv_list,
      }),
    };
    if (mssv_list.length > 0) {
      const response = await fetch("/api/autoMark", requestOptions);
      if (response.ok) {
        $('.auto_mark_btn').prop('disabled', false);
        $('.auto_mark_btn').text('Duyệt bảng điểm đã chọn');
        
        $('table tbody .inp-cbx').each(function(){
          let check = $(this).parent().parent().parent().find('.set_score_btn').text().trim()
          let name_marker = $('.avatar_wrap').find('p').text().trim()
          if (check == 'Chấm điểm' && this.checked) {
          let score = $(this).parent().parent().parent().find('.zero_score').text().trim()
          
            // xoá vàng khè
            $(this).parent().parent().parent().find('.zero_score').removeClass('new_update')
            $(this).parent().parent().parent().find('.first_score').addClass('new_update')
            
          $(this).parent().parent().parent().find('.first_score').text(score)
          $(this).parent().parent().parent().find('.marker_name').text(name_marker)
            
          }
        })

        notify('n', 'Đã hoàn tất chấm điểm tự động những sinh viên được đánh dấu!')
      }
       else if (response.status == 500) {
        // Error occurred during upload
        notify("x", "Có lỗi xảy ra!");
      }
    } else {
      $(".auto_mark_btn").prop("disabled", false);
      $(".auto_mark_btn").text("Duyệt bảng điểm đã chọn");
      notify("!", "Không có sinh viên được đánh dấu hoặc không đủ điều kiện để chấm điểm.");
    }
  } catch (error) {
    notify("x", "Có lỗi xảy ra!");
  }
 });

$(document).ready(async function () {
  async function loadScoresList() {
    $(".load_list_btn").prop("disabled", true);
    $(".load_list_btn").text("Loading...");
    notify("!", "Đợi chút đang tải bảng điểm!");
    try {
      const year =
        "HK" +
        $(".hoc_ky select option:selected").text() +
        "_" +
        $(".nien_khoa select option:selected").text();

      const requestOptions = {
        method: "GET",
      };

      const response = await fetch(
        `/api/loadScoresList?year=${year}`,
        requestOptions
      );

      if (response.ok) {
        const data = await response.json();
        const year_available = data.years;
        alert(data.year_available);

        // empty old table:
        $("table tbody").empty();
        // load new table:
        for (let i = 0; i < data.student_list.length; i++) {
          $("table tbody").append(`
        <tr>
          <td>
            <div class="checkbox-wrapper-4">
              <input type="checkbox" id="row${i + 1}" class="inp-cbx" value="${data.student_list[i]._id
            }" />
              <label for="row${i + 1
            }" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
              </label>
            </div>
          </td>
          <td>${i + 1}</td>
          <td>${data.student_list[i]._id}</td>
          <td class='std_name_row'>${data.student_list[i].last_name +
            " " +
            data.student_list[i].first_name
            }</td>
          <td class="new_update">${data.student_scores[i]}</td>
          <td class="first_score">${data.staff_scores[i]}</td>
          <td>${data.staff_name[i]}</td>
          <td>${data.department_scores[i]}</td>
          <td><a class="chamdiem">Chấm điểm</a></td>
        </tr>
        `);

          // add '*' to student have not mark yet
          if (data.student_scores[i] == "-" || data.student_scores[i] == 0) {
            $("table tbody")
              .children()
              .eq(i)
              .find(".std_name_row")
              .append(`<span class="dau_sao">*</span>`);
          }
        }

        // an nut cham diem cho ai chua cham diem 
        $("table tbody tr").each(function () {
          const diemTuCham = $(this).find(".new_update").text();
          const diemLan1 = $(this).find(".first_score").text();
          const diemChinhThuc = $(this).find(".total_score").text();

          if (diemTuCham === "-" || diemLan1 === "-" || diemChinhThuc === "-") {
            $(this).find(".chamdiem").hide();
          }
        });


        $(".chamdiem").click(function () {
          if (year_available == curr_tb_year) {
            const studentId = $(this)
              .closest("tr")
              .find("td:nth-child(3)")
              .text();
              const className = $(".--class option:selected").text().trim();

              console.log(className)

              this.href = `/doankhoa/nhapdiemdanhgia?schoolYear=${cur_tb_year}&studentId=${studentId}&class=${className}`
          } else {
            notify("!", "chưa mở chấm điểm vui lòng chọn năm khác.");
          }
        });

        // update current table school year
        curr_tb_year = year;

        // reset export button to clickable
        $(".load_list_btn").prop("disabled", false);
        $(".load_list_btn").text("Chọn");
        notify("n", "Đã hoàn tất tải bảng điểm.");
      } else if (response.status == 500) {
        // Error occurred during upload
        notify("x", "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.log(error);
      notify("x", "Có lỗi xảy ra!");
    }
  }


  $(".hoc_ky select, .nien_khoa select").change(async function () {
    await loadScoresList();
  });
});
// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
$(document).on("change", ".all-cbx", async function () {
  if ($(".all-cbx")[0].checked) {
    $("table tbody .inp-cbx").prop("checked", true);
  } else {
    $("table tbody .inp-cbx").prop("checked", false);
  }
});
// if all checkboxs was check all-cbx will tick
$(document).on("change", ".inp-cbx", async function () {
  let check = true;
  $("table tbody .inp-cbx").each(function () {
    if (!this.checked) check = false;
    return;
  });

  if (check) {
    $(".all-cbx").prop("checked", true);
  } else {
    $(".all-cbx").prop("checked", false);
  }
});

// cham diem
$(".set_score_btn").click(function () {
  if (year_available >= curr_tb_year) {
    const studentId = $(this).closest("tr").find("td:nth-child(3)").text();
    const className = $(".--class option:selected").text().trim();

    console.log(className)

    this.href = `/doankhoa/nhapdiemdanhgia?schoolYear=${cur_tb_year}&studentId=${studentId}&class=${className}`
  } else {
    notify("!", "chưa mở chấm điểm vui lòng chọn năm khác.");
  }
});
