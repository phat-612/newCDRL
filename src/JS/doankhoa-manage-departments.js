let old_name;
let curr_edit;
let new_name;

$(document).on("click", "#edit__subject", async function () { // this way get all in group(id/name/class)
  // check current line for future use
  curr_edit = $(this).parent().parent();
  // get old name (here to change old name every time new edit row)
  old_name = curr_edit.find('.b_name').text();
  // change text area value ò edit to old name whenever it open edit window

  $('.edit .bname_input').val(old_name);
  // show window
  $(".modal.edit").show();
});

$(".modal.edit").click(function () { // this way get only the first one
  $(".modal.edit").hide();
});

$(".modal_wrap.edit").click(function (e) {
  e.stopPropagation();
});

$("#add__subject").click(function () {
  // clear old name whenever it not edit
  old_name = '';
  // set curent edit to start
  curr_edit = undefined;

  $(".modal.add").show();
});

$("#delete__subject").click(async function () {
  // disable curr button
  $(this).prop('disabled', true);

  notify('!', 'Đang xóa dữ liệu!')

  let rm_bs = []

  $('table tbody .inp-cbx').each(function () {
    if (this.checked) {
      rm_bs.push(this.value);
    }
  })

  if (rm_bs.length > 0) {
    // request
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rm_bs: rm_bs
      })
    };

    const response = await fetch('/api/deleteBranchs', requestOptions);
    if (response.ok) {
      $('table tbody .inp-cbx').each(function () {
        if (this.checked) {
          // remove currline
          $(this).parent().parent().parent().remove();
        }
      })
      // rewrite all numbers of lines after remove 
      let index = 1;
      $('table tbody .nums').each(function () {
        $(this).text(index);
        index += 1;
      });

      // able curr button
      $(this).prop('disabled', false);

      notify('n', 'Đã xóa các bộ môn đc đánh dấu')
    }
    else if (response.status == 500) {
      // able curr button
      $(this).prop('disabled', false);
      // Error occurred during upload
      notify('x', 'Có lỗi xảy ra!');
    }
  } else {
    notify('!', 'Không có bộ môn được đánh dấu');
  }
});

$(".modal.add").click(function () {
  $(".modal.add").hide();
});

$(".modal_wrap.add").click(function (e) {
  e.stopPropagation();
});

// hide when click exist button
$(".exist_btn").click(function () {
  $(".modal.add").hide();
  $(".modal.edit").hide();
});

//save button
$(".save_btn").click(async function () {
  if ($(this).parent().parent().parent().find('.subject--input').val()) { // check if user enter info or not
    // disable curr button
    $(this).prop('disabled', true);

    notify('!', 'Đang cập nhật dữ liệu!')

    // find input
    $('.modal').each(function () {
      if ($(this).is(":visible")) {
        // get new name
        new_name = $(this).find('.bname_input').val();
      }
    });

    // request
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        old_name: old_name,
        name: new_name
      })
    };

    const response = await fetch('/api/addOrEditBranchs', requestOptions);
    if (response.ok) {
      if (curr_edit) {
        // set current edit line name to new name
        curr_edit.find('.b_name').text(new_name);
      } else {
        let length = $('table tbody tr').length;
        $('table tbody').append(`
          <tr>
            <td>
              <div class="checkbox-wrapper-4">
                <input type="checkbox" id="row--${length}" class="inp-cbx" value="${new_name}" />
                <label for="row--${length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                </label>
              </div>
            </td>
            <td class="nums">${length + 1}</td>
            <td class="b_name">${new_name}</td>
            <td class="dep_name">${$('table tbody .dep_name').first().text()}</td>
            <td>
              <a id="edit__subject" href="#">Sửa</a>
            </td>
          </tr>
        `)
      }
      // able curr button
      $(this).prop('disabled', false);
      // disappear curr dialog 
      $(".modal.add").hide();
      $(".modal.edit").hide();
      notify('n', 'Đã hoàn tất cập nhật bộ môn');
    }
    else if (response.status == 500) {
      // able curr button
      $(this).prop('disabled', false);
      // disappear curr dialog 
      $(".modal.add").hide();
      $(".modal.edit").hide();
      // Error occurred during upload
      notify('x', 'Có lỗi xảy ra!');
    }
  } else {
    notify('!', 'Hãy nhập đầy đủ thông tin!');
  }
});

// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
$(document).on("change", ".all-cbx", async function () {
  if ($('.all-cbx')[0].checked) {
    $('table tbody .inp-cbx').prop('checked', true);
  } else {
    $('table tbody .inp-cbx').prop('checked', false);
  }
});

// if all checkboxs was check all-cbx will tick
$(document).on("change", ".inp-cbx", async function () {
  let check = true
  $('table tbody .inp-cbx').each(function () {
    if (!this.checked) check = false; return;
  })

  if (check) {
    $('.all-cbx').prop('checked', true);
  } else {
    $('.all-cbx').prop('checked', false);
  }
});
