let curr_edit;
let old_id;
let new_id;
for (let i = 0; i < teachers.length; i++) {
    teachers[i].branch = branchs[i]; // Thay thế 'BM' bằng giá trị branch mong muốn
}
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
                    console.log($(this).parent().parent().parent().find('#select-level :selected').text());

                    let newTeacher = {
                        branch: $(this).parent().parent().parent().find('#select-level :selected').text().trim(),
                        class: [],
                        first_name: new_name,
                        last_name: '',
                        _id: new_id,
                    };
                    teachers.unshift(newTeacher);
                    totalPages = Math.ceil(parseInt(teachers.length) / 5);

                    $('.numb.active').click();
                    $(this).parent().parent().parent().find('.name--input').val('');
                    $(this).parent().parent().parent().find('#select-level option:first').prop('selected', true);
                    $(this).parent().parent().parent().find('.account--input').val('');
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
    quest('Bạn có chắc chắn muốn xoá tất cả cố vấn được đánh dấu. Dữ liệu bị xoá sẽ KHÔNG THỂ ĐƯỢC KHÔI PHỤC!').then(
        async (result) => {
            if (result) {
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
                        $('.numb.active').click();
                        teachers = teachers.filter((teacher) => !rm_ts.includes(teacher._id));
                        console.log(teachers);
                        totalPages = Math.ceil(parseInt(teachers.length) / 5);
                        $('.numb.active').click();
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
            }
        },
    );
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
let sortOrder = 'desc';
$(document).on('click', '.sort_name', async function () {
    let rows = $('table tbody tr').get();
    rows.sort((a, b) => {
        let keyA = $(a).find('.t_name').text().toUpperCase();
        let keyB = $(b).find('.t_name').text().toUpperCase();
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
    $('table tbody')
        .children('tr')
        .each(function (index) {
            $(this)
                .find('.nums')
                .text(index + 1);
        });
    console.log(sortOrder);

    if (sortOrder === 'asc') {
        $(this).html('Họ và tên <i class="fal fa-sort-alpha-up"></i>');
    } else {
        $(this).html('Họ và tên  <i class="fal fa-sort-alpha-down"></i>');
    }
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    console.log(sortOrder);
});

$(document).on('click', '.sort_num', async function () {
    console.log('olllll');

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

    if (sortOrder === 'asc') {
        $(this).html('STT <i class="fal fa-sort-numeric-down"></i>');
    } else {
        $(this).html('STT <i class="fal fa-sort-numeric-up"></i>');
    }
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
});
// Lấy ô input và bảng
const input = document.querySelector('.search_wrap input'); // Thay "searchInput" bằng ID của ô input
const table = document.querySelector('#TeacherTable'); // Thay "myTable" bằng ID của bảng

// Thêm sự kiện xử lý cho ô input
input.addEventListener('keyup', function () {
    // Lấy giá trị nhập vào từ ô input
    const searchValue = input.value.toLowerCase();

    // Lặp qua từng hàng trong bảng
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row) => {
        // Kiểm tra xem giá trị trong ô input có tồn tại trong hàng hiện tại hay không
        const nameCell = row.querySelector('.t_name');
        const branchCell = row.querySelector('.b_name');
        if (
            nameCell.textContent.toLowerCase().includes(searchValue)
            // ||
            // branchCell.textContent.toLowerCase().includes(searchValue)
        ) {
            // Hiển thị hàng nếu tìm thấy
            row.style.display = '';
        } else {
            // Ẩn hàng nếu không tìm thấy
            row.style.display = 'none';
        }
    });
});
// selecting required element
const element = document.querySelector('.pagination ul');
let totalPages = Math.ceil(parseInt(dataLength) / 5);
console.log(totalPages);

let page = 1;

element.innerHTML = createPagination(totalPages, page);

function createPagination(totalPages, page) {
    console.log(totalPages);
    if (totalPages > 1) {
        $('.pagination').attr('style', 'display: block; ');
    } else {
        $('.pagination').attr('style', 'display: none; ');
    }
    let liTag = '';
    let active;
    let beforePage = page - 1;

    let afterPage = page + 1;
    if (page > 1) {
        //show the next button if the page value is greater than 1
        liTag += `<li class="btn prev" onclick="createPagination(totalPages, ${
            page - 1
        })"><span><i class="fas fa-angle-left"></i> Prev</span></li>`;
    }

    if (page > 2 && page !== totalPages) {
        //if page value is less than 2 then add 1 after the previous button
        liTag += `<li class="first numb" onclick="createPagination(totalPages, 1)"><span>1</span></li>`;
        if (page > 3 && page !== totalPages) {
            //if page value is greater than 3 then add this (...) after the first li or page
            liTag += `<li class="dots"><span>...</span></li>`;
        }
    }

    // how many pages or li show before the current li
    if (page == totalPages) {
        beforePage = beforePage - 2;
    } else if (page == totalPages - 1) {
        beforePage = beforePage - 1;
    }
    // how many pages or li show after the current li
    if (page == 1) {
        afterPage = afterPage + 2;
    } else if (page == 2) {
        afterPage = afterPage + 1;
    }

    for (var plength = beforePage + 1; plength <= afterPage - 1; plength++) {
        if (plength > totalPages) {
            //if plength is greater than totalPage length then continue
            continue;
        }
        if (plength == 0) {
            //if plength is 0 than add +1 in plength value
            plength = plength + 1;
        }
        if (page == plength) {
            //if page is equal to plength than assign active string in the active variable
            active = 'active';
        } else {
            //else leave empty to the active variable
            active = '';
        }
        liTag += `<li class="numb ${active}" data-page="${plength}"><span>${plength}</span></li>`;
    }

    if (page < totalPages - 1) {
        console.log('dô');

        //if page value is less than totalPage value by -1 then show the last li or page
        if (page < totalPages - 2) {
            console.log('dô');

            //if page value is less than totalPage value by -2 then add this (...) before the last li or page
            liTag += `<li class="dots"><span>...</span></li>`;
        }
        // liTag += `<li class="last numb" onclick="createPagination(totalPages, ${totalPages})"><span>${totalPages}</span></li>`;
    }

    if (page < totalPages) {
        //show the next button if the page value is less than totalPage(20)
        liTag += `<li class="btn next" onclick="createPagination(totalPages, ${
            page + 1
        })"><span>Next <i class="fas fa-angle-right"></i></span></li>`;
    }
    element.innerHTML = liTag; //add li tag inside ul tag
    function renderTeacherTable(currentPage) {
        const teachersOnPage = teachers.slice((currentPage - 1) * 5, currentPage * 5);
        console.log(teachersOnPage);

        const tableBody = document.querySelector('#TeacherTable tbody');
        tableBody.innerHTML = ''; // Xóa nội dung cũ của bảng
        let dataTableRender = '';
        console.log(branchs);

        for (let i = 0; i < teachersOnPage.length; i++) {
            const teacher = teachersOnPage[i];
            // Tạo hàng mới cho bảng
            const row = `<tr>
                <td>
                    <div class="checkbox-wrapper-4">
                        <input type="checkbox" id="row--${i}" class="inp-cbx normal-cbx" value="${teacher._id}">
                        <label for="row--${i}" class="cbx"><span><svg height="10px" width="12px"></svg></span></label>
                    </div>
                </td>
                <td class="nums">${i + 1}</td>
                <td class="t_name">${teacher.last_name + ' ' + teacher.first_name}</td>
                <td class="b_name">${teacher.branch}</td>
                <td>
                    
                        ${teacher.class.map((c) => `<li>${c}</li>`).join('')}
                    
                </td>
                <td>
                    <a id="edit__class">Sửa</a>
                </td>
            </tr>`;
            dataTableRender += row;
        }
        tableBody.innerHTML = dataTableRender;
    }
    renderTeacherTable(page);

    return liTag; //reurn the li tag
}
console.log(teachers);

// Thêm sự kiện click vào các nút phân trang
element.addEventListener('click', function (event) {
    if (event.target.classList.contains('numb')) {
        const page = parseInt(event.target.dataset.page);
        currentPage = page;
        element.innerHTML = createPagination(totalPages, currentPage);
    }
});
