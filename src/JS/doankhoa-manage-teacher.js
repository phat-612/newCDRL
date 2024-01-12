let curr_edit;
let old_id;
let new_id;

$(document).on('click', '#edit__class', async function () {
    // check current line for future use
    curr_edit = $(this).parent().parent();
    // get old name (here to change old name every time new edit row)
    old_id = curr_edit.find('.inp-cbx').val();
    // set name input as selected teacher's name
    $('.modal.edit .name--input').val(curr_edit.find('.t_name').text());
    // set acount input as selected teacher's account
    $('.modal.edit .account--input').val(old_id);
    // set combo box of edit one to curr branch
    const curr_branch = curr_edit.find('.b_name').text();
    $('.modal.edit #select-level option').each(function () {
        if ($(this).text().trim() == curr_branch) {
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
    curr_edit = undefined; //
    old_id = undefined;
    $('.modal.add').show();
});

// hide add modal:
$('.modal.add').click(function () {
    $('.modal.add').hide();
});

$('.modal.add').click(function () {
    $('.modal.add').hide();
});

// hide add modal
$('.modal_wrap.add').click(function (e) {
    e.stopPropagation();
});

$('.exist_btn').click(function () {
    $('.modal.add').hide();
    $('.modal.edit').hide();
});

//save button
$('.save_btn').click(async function () {
    // check if user is fill all input or not
    const new_name = $(this).parent().parent().parent().find('.name--input').val();
    const acc = $(this).parent().parent().parent().find('.account--input').val();
    if (new_name && acc) {
        // new name, branch
        const curr_branchs = $(this).parent().parent().parent().find('#select-level :selected');

        // disable curr button
        $(this).prop('disabled', true);

        // find input
        let found = false; // check variable
        $('.add').each(function () {
            // when add new teacher only
            if ($(this).is(':visible')) {
                // get new id
                new_id = $(this).find('.account--input').val();

                // check does input id exist or not
                $('.normal-cbx').each(async function () {
                    // check have same id with existed ids
                    if ($(this).val() == acc) {
                        found = true;
                    }
                });
            }
        });

        if (found) {
            notify('!', 'Tên đăng nhập đã tồn tại!');
            // able curr button
            $(this).prop('disabled', false);
        } else {
            // find input
            $('.modal').each(function () {
                if ($(this).is(':visible')) {
                    // get new name
                    new_id = $(this).find('.account--input').val();
                }
            });

            notify('!', 'Đang cập nhật dữ liệu!');

            // request
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_id: old_id,
                    new_id: new_id,
                    new_name: new_name,
                    branch: curr_branchs.val(),
                }),
            };

            const response = await fetch('/api/addOrEditTeachers', requestOptions);
            if (response.ok) {
                if (curr_edit) {
                    // set current edit line to new version
                    curr_edit.find('.inp-cbx').val(new_id);
                    curr_edit.find('.t_name').text(new_name);
                    curr_edit.find('.b_name').text(curr_branchs.text());
                } else {
                    let length = $('table tbody tr').length;
                    $('table tbody').append(`
            <tr>
            <td>
              <div class="checkbox-wrapper-4">
                <input type="checkbox" id="row--${length}" class="inp-cbx" value="${new_id}" />
                <label for="row--${length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                </label>
              </div>
            </td>
            <td class="nums">${length + 1}</td>
            <td class="t_name">${new_name}</td>
            <td class="b_name">${curr_branchs.text()}</td>
            <td></td>
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
                notify('n', 'Đã hoàn tất cập nhật giáo viên.');
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
        $(this).prop('disabled', false);
        notify('!', 'Hãy nhập đầy đủ thông tin!');
    }
});

// delete check checkbox
$('#delete__teacher').click(async function () {
    // disable curr button
    $(this).prop('disabled', true);

    notify('!', 'Đang xóa dữ liệu!');

    let rm_ts = [];

    $('table tbody .inp-cbx').each(function () {
        if (this.checked) {
            rm_ts.push(this.value);
        }
    });

    if (rm_ts.length > 0) {
        // request
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rm_ts: rm_ts,
            }),
        };

        const response = await fetch('/api/deleteTeachers', requestOptions);
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

            notify('n', 'Đã xóa các cố vấn được đánh dấu');
        } else if (response.status == 500) {
            // Error occurred during upload
            notify('x', 'Có lỗi xảy ra!');
            // able curr button
            $(this).prop('disabled', false);
        }
    } else {
        // able curr button
        $(this).prop('disabled', false);
        notify('!', 'Không có cố vấn được đánh dấu');
    }
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
