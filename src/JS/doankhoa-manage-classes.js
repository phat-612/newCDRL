let curr_edit;
let old_id;

$(document).on('click', '#edit__class', async function () {
    // check current line for future use
    curr_edit = $(this).parent().parent();
    // get old name (here to change old name every time new edit row)
    old_id = curr_edit.find('.inp-cbx').val();

    // set default edit info
    // class name
    $('.edit .subject--input').val(old_id);

    // branch
    $('.bo_mon #select-level option').each(function () {
        if ($(this).val() == curr_edit.find('.b_name').prop('id')) {
            // check for option that equal to curr branch
            $(this).prop('selected', 'selected'); // sellect this option
        }
    });
    // teacher
    $('.co_van #select-level option').each(function () {
        if ($(this).val() == curr_edit.find('.t_name').prop('id')) {
            // check for option that equal to curr branch
            $(this).prop('selected', 'selected'); // sellect this option
        }
    });

    $('.modal.edit').show();
});

$('.modal.edit').click(function () {
    $('.modal.edit').hide();
});

$('.modal_wrap.edit').click(function (e) {
    e.stopPropagation();
});

$('#add__class').click(function () {
    // clear old name whenever it not edit
    old_name = '';
    // set curent edit to start
    curr_edit = undefined;

    $('.modal.add').show();
});

$('.modal.add').click(function () {
    $('.modal.add').hide();
});

$('.modal_wrap.add').click(function (e) {
    e.stopPropagation();
});

// hide when click exist button
$('.exist_btn').click(function () {
    $('.modal.add').hide();
    $('.modal.edit').hide();
});

// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
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

//save button
$('.save_btn').click(async function () {
    // check if user is fill all input or not
    const new_id = $(this).parent().parent().parent().parent().find('.subject--input').val();
    if (new_id) {
        // new name, branch, teacher
        const curr_branchs = $(this).parent().parent().parent().parent().find('.select_branch :selected');
        const curr_teacher = $(this).parent().parent().parent().parent().find('.select_teacher :selected');

        // disable curr button
        $(this).prop('disabled', true);

        // find input
        let found = false; // check variable
        $('.add').each(function () {
            if ($(this).is(':visible')) {
                // when add new class only
                // check does input id exist or not
                $('.normal-cbx').each(async function () {
                    // check have same id with existed ids
                    if ($(this).val() == new_id) {
                        found = true;
                    }
                });
            }
        });

        if (found) {
            notify('!', 'Tên lớp đã tồn tại!');
            // able curr button
            $(this).prop('disabled', false);
        } else {
            notify('!', 'Đang cập nhật dữ liệu!');

            // request
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_id: new_id,
                    old_id: old_id,
                    branch: curr_branchs.val(),
                    cvht: curr_teacher.val(),
                }),
            };

            const response = await fetch('/api/addOrEditClasses', requestOptions);
            if (response.ok) {
                if (curr_edit) {
                    // set current edit line to new version
                    curr_edit.find('.inp-cbx').val(new_id);
                    curr_edit.find('.t_name').text(curr_teacher.text());
                    curr_edit.find('.t_name').attr('id', curr_teacher.val());
                    curr_edit.find('.b_name').text(curr_branchs.text());
                } else {
                    let length = $('table tbody tr').length;
                    $('table tbody').append(`
          <tr>
            <td>
              <div class="checkbox-wrapper-4">
                <input type="checkbox" id="row__${length}" class="inp-cbx normal-cbx" value="${new_id}" />
                <label for="row__${length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                </label>
              </div>
            </td>
            <td class="nums" style="width: 3%;">${length + 1}</td>
            <td class="cls_name">${new_id}</td>
            <td class="b_name" style="width: 20%;">${curr_branchs.text()}</td>
            <td class="d_name" style="width: 10%;">${dep_name}</td>
            <td class="t_name" id="${curr_teacher.val()}">${curr_teacher.text()}</td>
            <td>
              <a id="edit__class" href="#">Sửa</a>
            </td>
          </tr>
          `);
                }
                // able curr button
                $(this).prop('disabled', false);
                // disappear curr dialog
                $('.modal.add').hide();
                $('.modal.edit').hide();
                notify('n', 'Đã hoàn tất cập nhật lớp học.');
            } else if (response.status == 500) {
                // Error occurred during upload
                notify('x', 'Có lỗi xảy ra!');
                // able curr button
                $(this).prop('disabled', false);
                // disappear curr dialog
                $('.modal.add').hide();
                $('.modal.edit').hide();
            }
        }
    } else {
        notify('!', 'Hãy nhập đầy đủ thông tin!');
    }
});

// delete check checkbox row
$('#delete__class').click(async function () {
    // disable curr button
    $(this).prop('disabled', true);

    notify('!', 'Đang xóa dữ liệu!');

    let rm_cls = [];
    let rm_ts = [];

    $('table tbody .inp-cbx').each(function () {
        if (this.checked) {
            rm_cls.push(this.value);

            rm_ts.push($(this).parent().parent().parent().find('.t_name').attr('id'));
        }
    });

    // request
    if (rm_ts.length > 0) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rm_cls: rm_cls,
                rm_ts: rm_ts,
            }),
        };

        const response = await fetch('/api/deleteClasses', requestOptions);
        if (response.ok) {
            $('table tbody .inp-cbx').each(function () {
                if (this.checked) {
                    // remove currline
                    $(this).parent().parent().parent().remove();
                }
            });

            // rewrite all numbers of lines after remove
            let index = 1;
            $('table tbody .nums').each(function () {
                $(this).text(index);
                index += 1;
            });

            // able curr button
            $(this).prop('disabled', false);

            notify('n', 'Đã xóa các lớp được đánh dấu');
        } else if (response.status == 500) {
            // Error occurred during upload
            notify('x', 'Có lỗi xảy ra!');
            // able curr button
            $(this).prop('disabled', false);
        }
    } else {
        notify('!', 'Không có dữ liệu được đánh dấu');
    }
});

// Scroll to the end of page
$(window).scroll(async function () {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 10) {
        if (curr_load_branch < branchs.length) {
            // show loading animation
            $('.loader-parent').css('display', 'flex');
            $('.loader-parent').show();

            // send request and create
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    curr_load_branch: curr_load_branch,
                    branchs: branchs,
                }),
            };

            const response = await fetch('/api/loadClasses', requestOptions);
            if (response.ok) {
                // hide loading animation
                $('.loader-parent').hide();

                // append new loading classes
                response.json().then(function (result) {
                    let numbers = $('table tbody tr').length; // start at next position
                    for (let i = curr_load_branch; i < result.new_curr_load_branch; i++) {
                        for (let j = 0; j < result.classes[branchs[i]._id].length; j++) {
                            $('#tb-body').append(`
              <tr>
                <td>
                  <div class="checkbox-wrapper-4">
                    <input type="checkbox" id="row__${numbers}" class="inp-cbx normal-cbx" value="${
                                result.classes[branchs[i]._id][j]
                            }" />
                    <label for="row__${numbers}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                    </label>
                  </div>
                </td>
                <td class="nums" style="width: 3%;">${numbers + 1}</td>
                <td class="cls_name">${result.classes[branchs[i]._id][j]}</td>
                <td class="b_name" style="width: 20%;">${branchs[i].name}</td>
                <td class="d_name" style="width: 10%;">${dep_name}</td>
                <td class="t_name" id="${result.class_teachers[numbers]._id}">${
                                result.class_teachers[numbers].last_name +
                                ' ' +
                                result.class_teachers[numbers].first_name
                            }</td>
                <td>
                  <a id="edit__class" href="#">Sửa</a>
                </td>
              </tr>
              `);
                            numbers += 1;
                        }
                    }
                    // change current load branch to new one
                    curr_load_branch = result.new_curr_load_branch;
                });
            } else if (response.status == 500) {
                // Error occurred during upload
                notify('x', 'Có lỗi xảy ra!');
            }
        }
    }
});
