let old_name;
let curr_edit;
let new_name;

$(document).on('click', '#edit__subject', async function () {
    // this way get all in group(id/name/class)
    // check current line for future use
    curr_edit = $(this).parent().parent();
    // get old name (here to change old name every time new edit row)
    old_name = curr_edit.find('.b_name').text();
    // change text area value ò edit to old name whenever it open edit window

    $('.edit .bname_input').val(old_name);
    // show window
    $('.modal.edit').show();
});

$('.modal.edit').click(function () {
    // this way get only the first one
    $('.modal.edit').hide();
});

$('.modal_wrap.edit').click(function (e) {
    e.stopPropagation();
});

$('#add__subject').click(function () {
    // clear old name whenever it not edit
    old_name = '';
    // set curent edit to start
    curr_edit = undefined;

    $('.modal.add').show();
});

$('#delete__subject').click(async function () {
    // disable curr button

    $(this).prop('disabled', true);
    quest('Bạn có chắc chắn muốn xoá tất cả bộ môn được đánh dấu. Dữ liệu bị xoá sẽ KHÔNG THỂ ĐƯỢC KHÔI PHỤC!').then(
        async (result) => {
            if (result) {
                notify('!', 'Đang xóa dữ liệu!');

                let rm_bs = [];

                $('table tbody .inp-cbx').each(function () {
                    if (this.checked) {
                        rm_bs.push(this.value);
                    }
                });

                if (rm_bs.length > 0) {
                    // request
                    const requestOptions = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            rm_bs: rm_bs,
                        }),
                    };

                    const response = await fetch('/api/deleteBranchs', requestOptions);
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

                        notify('n', 'Đã xóa các bộ môn đc đánh dấu');
                    } else if (response.status == 500) {
                        // able curr button
                        $(this).prop('disabled', false);
                        // Error occurred during upload
                        notify('x', 'Có lỗi xảy ra!');
                    }
                } else {
                    notify('!', 'Không có bộ môn được đánh dấu');
                }
            }
        },
    );
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

//save button
const sendata = async () => {
    $('.save_btn').click();
};

$('.save_btn').click(async function () {
    console.log('hahah');
    if ($(this).parent().parent().parent().find('.subject--input').val()) {
        // check if user enter info or not
        // disable curr button
        $(this).prop('disabled', true);

        notify('!', 'Đang cập nhật dữ liệu!');

        // find input
        $('.modal').each(function () {
            if ($(this).is(':visible')) {
                // get new name
                new_name = $(this).find('.bname_input').val();
            }
        });

        // request
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                old_name: old_name,
                name: new_name,
            }),
        };

        const response = await fetch('/api/addOrEditBranchs', requestOptions);
        // console.log(response);
        if (response.ok) {
            if (curr_edit) {
                // set current edit line name to new name
                curr_edit.find('.b_name').text(new_name);
            } else {
                // let length = $('table tbody tr').length;
                $(`
                    <tr>
                        <td>
                        <div class="checkbox-wrapper-4">
                            <input type="checkbox" id="row--${0}" class="inp-cbx" value="${new_name}" />
                            <label for="row--${0}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                            </label>
                        </div>
                        </td>
                        <td class="nums">${1}</td>
                        <td class="b_name">${new_name}</td>
                        <td class="dep_name">${dep_name}</td>
                        <td>
                        <a id="edit__subject" href="#">Sửa</a>
                        </td>
                    </tr>
                `).insertBefore('table tbody tr:first');
            }

            $('table tbody').children('tr').each(function () {
                // change all child id to "row--" + index
                $(this).find('.checkbox-wrapper-4 input').attr('id', `row--${$(this).index()}`);
                // change all label for to "row--" + index  (for checkbox)
                $(this).find('.checkbox-wrapper-4 label').attr('for', `row--${$(this).index()}`);
                // change all class "nums" to index 
                $(this).children('.nums').text($(this).index() + 1);
            });
            // able curr button
            $(this).prop('disabled', false);
            // disappear curr dialog
            $('.modal.add').hide();
            $('.modal.edit').hide();
            notify('n', 'Đã hoàn tất cập nhật bộ môn');
        } else if (response.status == 500) {
            // able curr button
            $(this).prop('disabled', false);
            // disappear curr dialog
            $('.modal.add').hide();
            $('.modal.edit').hide();
            // Error occurred during upload
            notify('x', 'Có lỗi xảy ra!');
        }
    } else {
        $(this).prop('disabled', false);
        notify('!', 'Hãy nhập đầy đủ thông tin!');
    }
});
const input1 = Array.prototype.slice.call(document.querySelectorAll('.modal.add input:not([type="checkbox"]'));
const input2 = Array.prototype.slice.call(document.querySelectorAll('.modal.edit input:not([type="checkbox"]'));

nextInput(input1, sendata);
nextInput(input2, sendata);
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

let sortOrder = 'asc';
$(document).on('click', '.sort_name', async function () {
    let rows = $('table tbody tr').get();
    rows.sort((a, b) => {
        let keyA = $(a).find('.b_name').text().toUpperCase();
        let keyB = $(b).find('.b_name').text().toUpperCase();
        if (sortOrder === 'asc') {
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
        } else {
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
        }
        return 0;
    });
    $.each(rows, function (_, row) {
        $('table tbody').append(row);
    });

    // Update row numbers
    $('table tbody').children('tr').each(function (index) {
        $(this).find('.nums').text(index + 1);
    });

    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    
    if (sortOrder === 'asc') {
        $(this).html('Tên Bộ Môn <i class="fa-solid fa-arrow-down-z-a"></i>');
    } else {
        $(this).html('Tên Bộ Môn <i class="fa-solid fa-arrow-up-a-z"></i>');
    }
});

$(document).on('click', '.sort_num', async function () {
    let rows = $('table tbody tr').get();
    rows.sort((a, b) => {
        let keyA = parseInt($(a).find('.nums').text());
        let keyB = parseInt($(b).find('.nums').text());
        if (sortOrder === 'asc') {
            return keyA - keyB;
        } else {
            return keyB - keyA;
        }
    });
    $.each(rows, function (index, row) {
        $('table tbody').append(row);
    });
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';


    if (sortOrder === 'asc') {
        $(this).html('STT <i class="fa-solid fa-arrow-down-9-1"></i>');
    } else {
        $(this).html('STT <i class="fa-solid fa-arrow-up-9-1"></i>');
    }
});
