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
    console.log(1);
  });

  $(".modal.add").click(function () {
    $(".modal.add").hide();
    console.log(2);
  });
  $(".modal_wrap.add").click(function (e) {
    e.stopPropagation();
    console.log(3);
  });
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
        notify('n', 'Thêm sinh viên')
      } else {
        notify('!', 'Thất bại')
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