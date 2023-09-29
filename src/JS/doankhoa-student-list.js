$(document).ready(() => {
  const inpMssv = $("#md_mssv")
  const inpHo = $("#md_ho")
  const inpTen = $("#md_ten")
  const inpVt = $("#md_vt")
  const inpDv = $("#md_dv")
  const inpCd = $("#md_cd")
  const inpLbhd = $("#md_lbhd")
  // console.log(inpMssv.val());
  // console.log(inpHo.val());
  // console.log(inpTen.val());
  // console.log(inpVt.val());
  // console.log(inpDv.prop('checked'));
  // console.log(inpCd.prop('checked'));
  // console.log(inpLbhd.prop('checked'));
  let selectedFile
  let cls
  let dataStudents = {
    0: {},
  }
  // chon lop
  async function getStudentList() {
    // console.log('goi len sv');
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
        dataStudents[cls] = students;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function loadStudents(students) {
    $('.js_tbody').empty()
    if (dataStudents.hasOwnProperty(cls)) {
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
          <td>${students[i].role}</td>
          <td>${students[i].dang_vien ? 'X' : ''}</td>
          <td>${students[i].cham_diem ? 'X' : ''}</td>
          <td>${students[i].lap_hoat_dong ? 'X' : ''}</td>
          <td><a href="#">Chỉnh sửa</a></td>
        </tr>
      `)
        }
        $('.js_tbody').append(htmls.join(''))
        $('tr a').on('click', (event) => {
          editStudent(event);
          $(".modal.add").show();
        })
      }
      else {
        $('.js_tbody').empty()
      }
      handleCheckboxChange()
    } else {
      await getStudentList()
      loadStudents(dataStudents[cls])
    }
  }
  function sortStudentName(std_list) {
    std_list.sort((a, b) => {
      const lastFirstNameWordA = a.first_name.split(' ').pop();
      const lastFirstNameWordB = b.first_name.split(' ').pop();

      const firstNameComparison = lastFirstNameWordA.localeCompare(lastFirstNameWordB, 'vi', { sensitivity: 'base' });
      if (firstNameComparison !== 0) {
        return firstNameComparison;
      }

      return a.last_name.localeCompare(b.last_name, 'vi', { sensitivity: 'base' });
    });
    return std_list;

  }
  function clearModal() {
    inpMssv.val('');
    inpHo.val('');
    inpTen.val('');
    inpVt.val('0');
    inpDv.prop('checked', false);
    inpCd.prop('checked', false);
    inpLbhd.prop('checked', false);
  }
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
  function editStudent(event) {
    event.preventDefault();
    const row = event.target.closest('tr');
    const mssv = row.querySelector('td:nth-child(3)').textContent.trim();
    const studentInfo = dataStudents[cls].filter((item) => item._id == mssv)[0];
    inpMssv.val(studentInfo._id)
    inpHo.val(studentInfo.last_name)
    inpTen.val(studentInfo.first_name)
    inpVt.prop('selectedIndex', studentInfo.cham_diem || studentInfo.lap_hoat_dong ? 1 : 0);
    inpDv.prop('checked', studentInfo.dang_vien);
    inpCd.prop('checked', studentInfo.cham_diem);
    inpLbhd.prop('checked', studentInfo.lap_hoat_dong);
    $('.js_md_add').text('Cập nhật');
  }
  $('.js_lop').on('change', async (event) => {
    cls = event.target.value;
    $("#row0")[0].checked = false;
    loadStudents(dataStudents[cls])
  })
  $("#add-student").click(function () {
    $(".modal.add").show();
  });
  $(".modal.add").click(function () {
    $(".modal.add").hide();
    $('.js_md_add').text('Thêm');
    clearModal();
  });
  $(".modal_wrap.add").click(function (e) {
    e.stopPropagation();
  });
  // huy bo
  $('.js_md_cancel').on('click', async () => {
    $('.js_md_add').text('Thêm');
    $(".modal.add").hide();
    clearModal();
  });

  // them tung sinh vien
  $('.js_md_add').on('click', async () => {
    if (cls == 0) {
      notify('!', 'Vui lòng chọn lớp')
      return
    }
    try {
      let updateStudent = $('.js_md_add').text() == 'Cập nhật';
      let postData = JSON.stringify({
        mssv: inpMssv.val(),
        ho: inpHo.val(),
        ten: inpTen.val(),
        vaitro: inpVt.val(),
        dangvien: inpDv.prop('checked'),
        chamdiem: inpCd.prop('checked'),
        lbhd: inpLbhd.prop('checked'),
        cls,
        updateStudent
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
        if (!updateStudent) {
          dataStudents[cls].push({
            _id: inpMssv.val(),
            last_name: inpHo.val(),
            first_name: inpTen.val(),
            role: inpCd.prop('checked') || inpLbhd.prop('checked') ? 'Ban cán sự' : 'Sinh viên',
            dang_vien: inpDv.prop('checked'),
            cham_diem: inpCd.prop('checked'),
            lap_hoat_dong: inpLbhd.prop('checked'),
          })
          dataStudents[cls] = sortStudentName(dataStudents[cls])
          loadStudents(dataStudents[cls])
          notify('n', 'Thêm sinh viên thành công')
          const blobUrl = URL.createObjectURL(await response.blob());
          // Tạo một thẻ <a> ẩn để tải xuống và nhấn vào nó
          // const downloadLink = document.createElement('a');
          // downloadLink.href = blobUrl;
          // downloadLink.download = `${inpMssv.val()}.xlsx`; // Đặt tên cho tệp tải xuống
          // downloadLink.style.display = 'none';
          // document.body.appendChild(downloadLink);
          // downloadLink.click();
          // Giải phóng URL tạm thời sau khi tải xuống hoàn thành
          URL.revokeObjectURL(blobUrl);
          $('.js_md_add').text('Thêm');
        } else {
          dataStudents[cls] = dataStudents[cls].map((student) => {
            if (student['_id'] == inpMssv.val()) {
              return {
                _id: inpMssv.val(),
                last_name: inpHo.val(),
                first_name: inpTen.val(),
                role: inpCd.prop('checked') || inpLbhd.prop('checked') ? 'Ban cán sự' : 'Sinh viên',
                dang_vien: inpDv.prop('checked'),
                cham_diem: inpCd.prop('checked'),
                lap_hoat_dong: inpLbhd.prop('checked'),
              }
            } else {
              return student
            }
          })
          console.log(dataStudents[cls]);
          loadStudents(dataStudents[cls])
          notify('n', 'Cập nhật sinh viên thành công')
        }
      } else {
        if (updateStudent) {
          notify('!', 'Thêm sinh viên thất bại')
        } else {
          notify('!', 'Cập nhật sinh viên thất bại')
        }
      }
      $(".modal.add").hide();
      clearModal()
    } catch (error) {
      console.log(error);
    }
  })

  $('#md_vt').change(async function () {
    if ($(this).val() == 1) {
      $('#md_cd').prop('checked', true);
      $('#md_lbhd').prop('checked', true);
    } else {
      $('#md_cd').prop('checked', false);
      $('#md_lbhd').prop('checked', false);
    }
  });
  $('#md_cd').change(async function () {
    if ($('#md_cd').prop('checked') || $('#md_lbhd').prop('checked')) {
      $('#md_vt').val('1');
    } else {
      $('#md_vt').val('0');
    }
  });
  $('#md_lbhd').change(async function () {
    if ($('#md_cd').prop('checked') || $('#md_lbhd').prop('checked')) {
      $('#md_vt').val('1');
    } else {
      $('#md_vt').val('0');
    }
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
    if ($('.js_lop').val()!== '0') {cd 
      quest("Câu hỏi").then(async (result) => {
        if(result) {
  
          if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append("cls", $(".js_lop").val());
            formData.append("status", result);
            try {
              const response = await fetch('/api/createAccount', {
                method: 'POST',
                body: formData,
              });
              if (response.ok) {
                await getStudentList()
                loadStudents(dataStudents[cls])
                notify('n', 'Thêm sinh viên thành công')
                const blobUrl = URL.createObjectURL(await response.blob());
                // // Tạo một thẻ <a> ẩn để tải xuống và nhấn vào nó
                // const downloadLink = document.createElement('a');
                // downloadLink.href = blobUrl;
                // downloadLink.download = 'Danh_sach_sinh_vien.xlsx'; // Đặt tên cho tệp tải xuống
                // downloadLink.style.display = 'none';
                // document.body.appendChild(downloadLink);
                // downloadLink.click();
                // // Giải phóng URL tạm thời sau khi tải xuống hoàn thành
                URL.revokeObjectURL(blobUrl);
      
              }
              else if (response.status == 404) {
                notify('!', 'File không có đủ dữ liệu !')
              }
              else if (response.status == 405) {
                notify('!', 'File không đúng mẫu !')
              }
              else {
                notify('!', 'Thêm sinh viên thất bại ')
              }
            } catch (error) {
              console.log(error);
            }
          }
          else {
            notify('!', 'Bạn chưa chọn file để tải lên !')
      
          }
        }
        else {
          if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append("cls", $(".js_lop").val());
            formData.append("status", result);
            try {
              const response = await fetch('/api/createAccount', {
                method: 'POST',
                body: formData,
              });
              if (response.ok) {
                await getStudentList()
                loadStudents(dataStudents[cls])
                notify('n', 'Thêm sinh viên thành công')
                const blobUrl = URL.createObjectURL(await response.blob());
                // // Tạo một thẻ <a> ẩn để tải xuống và nhấn vào nó
                // const downloadLink = document.createElement('a');
                // downloadLink.href = blobUrl;
                // downloadLink.download = 'Danh_sach_sinh_vien.xlsx'; // Đặt tên cho tệp tải xuống
                // downloadLink.style.display = 'none';
                // document.body.appendChild(downloadLink);
                // downloadLink.click();
                // // Giải phóng URL tạm thời sau khi tải xuống hoàn thành
                URL.revokeObjectURL(blobUrl);
      
              } else {
                notify('!', 'Thêm sinh viên thất bại ')
              }
            } catch (error) {
              console.log(error);
            }
          }
          else {
            notify('!', 'Bạn chưa chọn file để tải lên !')
      
          }
        }
          // true nếu nhấn OK, false nếu nhấn Not
  
  
        
      });
    }
    else {
      notify('!', 'Bạn chưa chọn lớp!')

    }
    
  })
  // delete students
  $('#delete-student').on('click', async () => {
    let cbxs = $('.inp-cbx')
    let dataDelete = [];
    for (let i = 1; i < cbxs.length; i++) {
      if (cbxs[i].checked) {
        dataDelete.push(cbxs[i].value.toString());
      }
    }
    if (dataDelete.length > 0) {
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
          dataStudents[cls] = dataStudents[cls].filter(item => !dataDelete.includes(item['_id']))
          loadStudents(dataStudents[cls])
          notify('n', 'Xóa sinh viên thành công')
        } else {
          notify('!', 'Xóa sinh viên thất bại')
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      notify('!', 'Vui lòng chọn sinh viên')
    }
  })
  // get file template new student
  $('.js_get_template').on('click', async () => {
    try {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response = await fetch('/api/getTemplateAddStudent', requestOptions);
      if (response.ok) {
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
        notify('n', 'Đã tải xuống file thêm sinh viên')
      } else {
        notify('!', 'Tải xuống thất bại thất bại')
      }
    } catch (error) {
      console.log(error);
    }
  });
});