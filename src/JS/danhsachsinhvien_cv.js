let selectedFile
let cls
// tat ca duoc check thi check cai tat ca
function handleCheckboxChange() {
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
}
// chon lop
async function loadStudents(cls) {
  $('.js_tbody').empty()
  try {
    let postData = JSON.stringify({
      class: cls
    });
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postData
    };
    const response = await fetch('/api/getStudentList', requestOptions);
    if (response.ok) {
      const students = await response.json();
      if (students.length != 0) {
        let htmls = [];
        for (let i = 0; i < students.length; i++) {
          htmls.push(`
          <tr>
            <td>
              <div class="checkbox-wrapper-4">
                <input
                  type="checkbox"
                  id="row${i + 1}"
                  class="inp-cbx"
                  value="${students[i]._id}"
                />
                <label for="row${i + 1}" class="cbx"
                  ><span> <svg height="10px" width="12px"></svg></span>
                </label>
              </div>
            </td>
            <td>${i + 1}</td>
            <td> ${students[i]._id} </td>
            <td>${students[i].last_name + " " + students[i].first_name}</td>
            <td>Lớp viên</td>
            <td></td>
            <td></td>
            <td></td>
            <td><a href="">Chỉnh sửa</a></td>
          </tr>
        `)
        }
        $('.js_tbody').append(htmls.join(''))
      }
      else {
        $('.js_tbody').empty()
      }
      handleCheckboxChange()
    }
  } catch (error) {
    console.log(error);
  }
}
$('.js_lop').on('change', async (event) => {
  cls = event.target.value;
  loadStudents(cls)
})
// model
$(document).ready(() => {
  $("#add-student").click(function () {
    $(".modal.add").show();
  });
  $(".modal.add").click(function () {
    $(".modal.add").hide();
  });
  $(".modal_wrap.add").click(function (e) {
    e.stopPropagation();
  });
  // them tung sinh vien
  $('.js_md_add').on('click',async ()=>{
    if (cls == 0){
      notify('!', 'Vui lòng chọn lớp')
    }
    const inpMssv = $("#md_mssv")
    const inpHo = $("#md_ho")
    const inpTen = $("#md_ten")
    const inpVt = $("#md_vt")
    const inpDv = $("#md_dv")
    const inpCd = $("#md_cd")
    const inpLbhd = $("#md_lbhd")
    console.log(inpMssv.val());
    console.log(inpHo.val());
    console.log(inpTen.val());
    console.log(inpVt.val());
    console.log(inpDv.prop('checked'));
    console.log(inpCd.prop('checked'));
    console.log(inpLbhd.prop('checked'));
    try {
      let postData = JSON.stringify({
        mssv: inpMssv.val(),
        ho: inpHo.val(),
        ten: inpTen.val(),
        vaitro: inpVt.val(),
        dangvien: inpDv.prop('checked'),
        chamdiem: inpCd.prop('checked'),
        lbhd: inpLbhd.prop('checked'),
        cls: cls
      });
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: postData
      };
      const response = await fetch('/api/createAccount', requestOptions);
      if (response.ok) {
        await loadStudents(cls)
        notify('n', 'Thêm sinh viên thành công')
      } else {
        notify('!', 'Thêm sinh viên thất bại')
      }
    } catch (error) {
      console.log(error);
    }
  })
});
// set text up file
$('.inp_file').on('change', (event) => {
  selectedFile = event.target.files[0];
  if (selectedFile) {
    $('.btn_input').text(selectedFile.name);
  }
});
// up file
$(".btn_upload").on("click", async () => {
  if (selectedFile) {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append("cls", $(".js_lop").val());
    try {
      const response = await fetch('/api/createAccount', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        loadStudents(cls)
        notify('n', 'Thêm sinh viên thành công')
        const blobUrl = URL.createObjectURL(await response.blob());
        // Tạo một thẻ <a> ẩn để tải xuống và nhấn vào nó
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = 'Danh_sach_sinh_vien.xlsx'; // Đặt tên cho tệp tải xuống
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        // Giải phóng URL tạm thời sau khi tải xuống hoàn thành
        URL.revokeObjectURL(blobUrl);
        
      } else {
        notify('!', 'Thêm sinh viên thất bại ')
      }
    } catch (error) {
      console.log(error);
    }
  }
})
// delete students
$('#delete-student').on('click', async () => {
  let cbxs = $('.inp-cbx')
  let dataDelete = [];
  for (let i = 1; i < cbxs.length; i++) {
    if (cbxs[i].checked) {
      dataDelete.push(cbxs[i].value);
    }
  }
  try {
    let postData = JSON.stringify({
      dataDelete: dataDelete
    });
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postData
    };
    const response = await fetch('/api/deleteAccount', requestOptions);
    if (response.ok) {
      await loadStudents(cls)
      notify('n', 'Xóa sinh viên thành công')
    } else {
      notify('!', 'Xóa sinh viên thất bại')
    }
  } catch (error) {
    console.log(error);
  }
})
