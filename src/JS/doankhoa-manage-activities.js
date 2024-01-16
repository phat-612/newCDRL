function generateUUID() {
    // Hàm tạo chuỗi UUID
    // Tham khảo: https://stackoverflow.com/a/2117523/13347726
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

let atv_id = generateUUID(); // fake id to know a new id
let curr_edit = undefined;

$(document).on('click', '.more_list', async function () {
    // edit dialog often
    curr_edit = $(this).parent().parent();
    atv_id = curr_edit.find('.inp-cbx').val();

    // set default for activities' name input
    $('.modal.edit #activities_title').val(curr_edit.find('.a_name').text().trim());

    $('.modal.edit').show();
});

// set default for input of edit modal
$(document).on('click', '#school_edit', async function () {
    const curr_index = parseInt(curr_edit.find('.index').text()) - 1;
    const start_date = new Date(school_st[curr_index]);
    // Format the date in 'YYYY-MM-DD' format
    const formattedDate = `${start_date.getFullYear()}-${(start_date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${start_date.getDate().toString().padStart(2, '0')}`;
    // Format the time in 'HH:MM' format
    const formattedTime = `${start_date.getHours().toString().padStart(2, '0')}:${start_date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    // set default for activities' content input
    $('.modal.edit #activities_content').val(school_content[curr_index]);
    // --------------------------------------------------------------------------------
    // set default for activities' start date input
    $('#edit-act-date').val(formattedDate);
    // -------------------------------------------------------------------------------------
    // set default for activities' start hour input
    $('#edit-act-time').val(formattedTime);
    // set default for activities'
    $('.modal.edit #select-level2 option[value="truong"]').prop('selected', true);
    // do not have class choice
    $('.modal.edit #select_lop2').hide();
});

$(document).on('click', '#dep_edit', async function () {
    const curr_index = parseInt(curr_edit.find('.index').text()) - 1;
    const start_date = new Date(dep_st[curr_index]);
    // Format the date in 'YYYY-MM-DD' format
    const formattedDate = `${start_date.getFullYear()}-${(start_date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${start_date.getDate().toString().padStart(2, '0')}`;
    // Format the time in 'HH:MM' format
    const formattedTime = `${start_date.getHours().toString().padStart(2, '0')}:${start_date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    // set default for activities' content input
    $('.modal.edit #activities_content').val(dep_content[curr_index]);
    // --------------------------------------------------------------------------------
    // set default for activities' start date input
    $('#edit-act-date').val(formattedDate);
    // set default for activities' start hour input
    $('#edit-act-time').val(formattedTime);
    // -------------------------------------------------------------------------------------
    // set default for activities'
    $('.modal.edit #select-level2 option[value="khoa"]').prop('selected', true);
    // do not have class choice
    $('.modal.edit #select_lop2').hide();
});

$(document).on('click', '#cls_edit', async function () {
    const curr_index = parseInt(curr_edit.find('.index').text()) - 1;
    const start_date = new Date(cls_st[curr_index]);
    // Format the date in 'YYYY-MM-DD' format
    const formattedDate = `${start_date.getFullYear()}-${(start_date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${start_date.getDate().toString().padStart(2, '0')}`;
    // Format the time in 'HH:MM' format
    const formattedTime = `${start_date.getHours().toString().padStart(2, '0')}:${start_date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    // set default for activities' content input
    $('.modal.edit #activities_content').val(cls_content[curr_index]);
    // --------------------------------------------------------------------------------
    // set default for activities' start date input
    $('#edit-act-date').val(formattedDate);
    // set default for activities' start hour input
    $('#edit-act-time').val(formattedTime);
    // -------------------------------------------------------------------------------------
    // set default for activities'
    $('.modal.edit #select-level2 option[value="lop"]').prop('selected', true);
    // do not have class choice
    $('.modal.edit #select_lop2').show();
    $(`.modal.edit #select-class2 option[value="${curr_edit.find('.c_name').text()}"]`).prop('selected', true);
});
// --------------------------------------------------------------------------------------------------------

$('.modal.edit').click(function () {
    $('.modal.edit').hide();
});

$('.modal_wrap.edit').click(function (e) {
    e.stopPropagation();
});

$('#add__activity').click(function () {
    // add dialog often
    curr_edit = undefined;
    atv_id = generateUUID();

    $('.modal.add').show();
});

$('.modal.add').click(function () {
    $('.modal.add').hide();
});

$('.modal_wrap.add').click(function (e) {
    e.stopPropagation();
});

$('.close_modal').click(function () {
    $('.modal.edit').hide();
});

// show and hide copy link box
$(document).on('mouseenter', '.atv_box', async function () {
    $(this).next().show();
    $(this).next().css('transition', 'all 2s');
});

$(document).on('mouseenter', '.copy_box', async function () {
    $(this).show();
    $(this).css('transition', 'all 2s');
});

$(document).on('mouseleave', '.atv_box', async function () {
    $(this).next().hide();
});

$(document).on('mouseleave', '.copy_box', async function () {
    $(this).hide();
});

$(document).on('click', '.copy_btn', async function () {
    notify('n', 'Đã copy link đãng kí và điểm danh hoạt động.');
    navigator.clipboard.writeText($(this).parent().parent().find('.copy_link').prop('href'));
});
// ----------------------------------------------------------------

$(document).on('change', '#select-level1', async function () {
    if ($(this).val() === 'lop') {
        $('#select_lop1').show();
    } else {
        $('#select_lop1').hide();
    }
});

$(document).on('change', '#select-level2', async function () {
    if ($(this).val() === 'lop') {
        $('#select_lop2').show();
    } else {
        $('#select_lop2').hide();
    }
});

$(document).on('change', '.--bomon select', async function () {
    const selectedBranch = $('.--bomon select option:selected').text().trim();
    //  const selectedBranch = "Công Nghệ Thông Tin";
    let selectedBranchId;
    let selectedClassName;
    let classList = [];
    for (let i = 0; i < branch_list.length; i++) {
        if (branch_list[i].name === selectedBranch) {
            selectedBranchId = branch_list[i]._id;
            break;
        }
    }
    for (let i = 0; i < class_list.length; i++) {
        if (class_list[i].branch === selectedBranchId) {
            selectedClassName = class_list[i]._id;
            classList.push(selectedClassName);
        }
    }

    const selectElement = $('.--class select'); // Lấy thẻ select bằng jQuery
    // Xóa các phần tử hiện có trong select
    selectElement.empty();
    // Tạo các phần tử option từ mảng branch_list và thêm vào select
    $.each(classList, function (index, branch) {
        const option = $('<option></option>');
        option.val(branch);
        option.text(branch);
        selectElement.append(option);
    });
});

//save button
$('.save_btn').click(async function () {
    const atv_name = $(this).parent().parent().parent().find('#activities_title').val();
    const atv_content = $(this).parent().parent().parent().find('#activities_content').val();

    // get start hour and start date of activities
    const start_hour = $(this).parent().parent().parent().find('.act-time').val();

    const start_date = $(this).parent().parent().parent().find('.act-date').val();

    if (atv_name && atv_content && start_hour && start_date) {
        // check if user enter info or not
        // disable curr button
        $(this).prop('disabled', true);

        notify('!', 'Đang cập nhật dữ liệu!');

        // get curr level and clss if level is class
        const level = $(this).parent().parent().parent().find('.select_level :selected');

        const cls_id = $(this).parent().parent().parent().find('.select_class :selected');

        // request
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                atv_id: atv_id,
                name: atv_name,
                content: atv_content,
                level: level.val(),
                cls_id: cls_id.val(),
                start_hour: start_hour,
                start_date: start_date,
            }),
        };

        const response = await fetch('/api/addOrEditActivities', requestOptions);
        if (response.ok) {
            if (curr_edit) {
                const curr_index = parseInt(curr_edit.find('.index').text()) - 1;
                const curr_tb = curr_edit.parent().parent();
                // remove current activities content in
                switch (level.val()) {
                    case 'lop':
                        cls_content.splice(curr_index, 1);
                        cls_st.splice(curr_index, 1);
                        break;
                    case 'khoa':
                        dep_content.splice(curr_index, 1);
                        dep_st.splice(curr_index, 1);
                        break;
                    case 'truong':
                        school_content.splice(curr_index, 1);
                        school_st.splice(curr_index, 1);
                        break;
                }
                // remove current edit if it is edit and it;s copy tr
                curr_edit.next().remove();
                curr_edit.remove();
                // reedit all rows' index;
                let index = 0;
                curr_tb.find('.index').each(function () {
                    index += 1;
                    $(this).text(index);
                });
            }
            // check for add to school, department or class
            switch (level.val()) {
                case 'lop':
                    // add new length
                    let cls_length = $('#cls_tb tbody tr').length / 2;
                    $('#cls_tb tbody').append(`
            <tr class="atv_box">
              <td>
                <div class="checkbox-wrapper-4">
                  <input type="checkbox" id="row__2__${cls_length}" class="inp-cbx" value="${atv_id}" />
                  <label for="row__2__${cls_length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                  </label>
              </td>
              <td class="index">${cls_length + 1}</td>
              <td class="a_name">${atv_name}</td>
              <td class="c_name">${cls_id.val()}</td>
              <td class="school_year">${year_cur.split('_')[0]} ${year_cur.split('_')[1]}</td>
              <td><a href="/doankhoa/quanlihoatdong/${cls_id.val()}/${atv_id}" target="blank">Chi tiết</a></td>
              <td><a class="more_list" id="cls_edit" href="#">Sửa</a></td>
            </tr>
            <tr class="copy_box">
              <td colspan="2"> COPY </td>
              <td colspan="6"><a class="copy_link" href="/dangkyhoatdong?id=${atv_id}&class=${cls_id.val()}&level=lop">Link đăng kí và điểm danh hoạt động</a></td>
            </tr>
          `);

                    // add content and start time to cls list
                    cls_content.push(atv_content);
                    cls_st.push(new Date([start_date, start_hour]));

                    break;
                case 'khoa':
                    let dep_length = $('#dep_tb tbody tr').length / 2;
                    $('#dep_tb tbody').append(`
            <tr class="atv_box">
              <td>
                <div class="checkbox-wrapper-4">
                  <input type="checkbox" id="row__1__${dep_length}" class="inp-cbx" value="${atv_id}" />
                  <label for="row__1__${dep_length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                  </label>
              </td>
              <td class="index">${dep_length + 1}</td>
              <td class="a_name">${atv_name}</td>
              <td class="school_year">${year_cur.split('_')[0]} ${year_cur.split('_')[1]}</td>
              <td><a href="/doankhoa/quanlihoatdong/Khoa/${atv_id}" target="blank">Chi tiết</a></td>
              <td><a class="more_list" id="dep_edit" href="#">Sửa</a></td>
            </tr>
            <tr class="copy_box">
              <td colspan="2"> <a class="copy_btn">COPY</a> </td>
              <td colspan="6"><a class="copy_link" href="/dangkyhoatdong?id=${atv_id}&level=khoa">Link đăng kí và điểm danh hoạt động</a></td>
            </tr>
          `);
                    // add content and start time to dep list
                    dep_content.push(atv_content);
                    dep_st.push(new Date([start_date, start_hour]));

                    break;
                case 'truong':
                    let school_length = $('#school_tb tbody tr').length / 2;
                    $('#school_tb tbody').append(`
            <tr class="atv_box">
              <td>
                <div class="checkbox-wrapper-4">
                  <input type="checkbox" id="row__0__${school_length}" class="inp-cbx" value="${atv_id}" />
                  <label for="row__0__${school_length}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                  </label>
              </td>
              <td class="index">${school_length + 1}</td>
              <td class="a_name">${atv_name}</td>
              <td class="school_year">${year_cur.split('_')[0]} ${year_cur.split('_')[1]}</td>
              <td><a href="/doankhoa/quanlihoatdong/Truong/${atv_id}" target="blank">Chi tiết</a></td>
              <td><a class="more_list" id="school_edit" href="#">Sửa</a></td>
            </tr>
            <tr class="copy_box">
              <td colspan="2"> <a class="copy_btn">COPY</a> </td>
              <td colspan="6"><a class="copy_link" href="/dangkyhoatdong?id=${atv_id}&level=truong">Link đăng kí và điểm danh hoạt động</a></td>
            </tr>
          `);

                    // add content and start time to cls list
                    school_content.push(atv_content);
                    school_st.push(new Date([start_date, start_hour]));

                    break;
            }

            // disappear curr dialog
            $('.modal.add').hide();
            $('.modal.edit').hide();
            notify('n', 'Đã hoàn tất cập nhật hoạt động');
        } else if (response.status == 500) {
            // disappear curr dialog
            $('.modal.add').hide();
            $('.modal.edit').hide();
            // Error occurred during upload
            notify('x', 'Có lỗi xảy ra!');
        }
        // able curr button
        $(this).prop('disabled', false);
    } else {
        notify('!', 'Hãy nhập đầy đủ thông tin!');
    }
});

// year choise button:
$('#year_choice').click(async function () {
    // show loading animation
    $('#school-loader').css('display', 'flex');
    $('#school-loader').show();
    $('#dep-loader').css('display', 'flex');
    $('#dep-loader').show();
    $('#cls-loader').css('display', 'flex');
    $('#cls-loader').show();
    $('#school_tb').hide();
    $('#dep_tb').hide();
    $('#cls_tb').hide();

    // disable this btn
    $(this).prop('disabled', true);

    // get year
    const choise_semester = $('#select_hk').find('select :selected');
    // get semester
    const choise_year = $('#select_sm').find('select :selected');

    // send request to load new activities fix year input
    // request
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            year: choise_year.val(),
            semester: choise_semester.val(),
        }),
    };

    const response = await fetch('/api/loadYearActivities', requestOptions);
    if (response.ok) {
        // clear all appeareance activities
        $('.atv_box').remove();
        response.json().then(function (result) {
            //append activities to school's table ************************************************************
            const school_atv = result.school_atv;
            const dep_atv = result.dep_atv;
            const cls_atv = result.cls_atv;
            for (let i = 0; i < school_atv.length; i++) {
                $('#school_tb tbody').append(`
                <tr class="atv_box">
                  <td>
                    <div class="checkbox-wrapper-4">
                      <input type="checkbox" id="row__0__${i}" class="inp-cbx" value="${school_atv[i]._id}" />
                      <label for="row__0__${i}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                      </label>
                  </td>
                  <td class="index">${i + 1}</td>
                  <td class="a_name">${school_atv[i].name}</td>
                  <td class="school_year">${school_atv[i].year.split('_')[0]} ${school_atv[i].year.split('_')[1]}</td>
                  <td><a href="/doankhoa/quanlihoatdong/Truong/${school_atv[i]._id}">Chi tiết</a></td>
                  <td><a class="more_list" href="#">Sửa</a></td>
                </tr>
                <tr class="copy_box">
                  <td colspan="2"> <a class="copy_btn">COPY</a> </td>
                  <td colspan="6"><a class="copy_link" href="/dangkyhoatdong?id=${
                      school_atv[i]._id
                  }&level=truong">Link đăng kí và điểm danh hoạt động</a></td>
                </tr>
              `);
            }
            //append activities to department's table ************************************************************
            for (let i = 0; i < dep_atv.length; i++) {
                $('#dep_tb tbody').append(`
              <tr class="atv_box">
                <td>
                  <div class="checkbox-wrapper-4">
                    <input type="checkbox" id="row__1__${i}" class="inp-cbx" value="${dep_atv[i]._id}" />
                    <label for="row__1__${i}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                    </label>
                </td>
                <td class="index">${i + 1}</td>
                <td class="a_name">${dep_atv[i].name}</td>
                <td class="school_year">${dep_atv[i].year.split('_')[0]} ${dep_atv[i].year.split('_')[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/Khoa/${dep_atv[i]._id}">Chi tiết</a></td>
                <td><a class="more_list" id="dep_edit" href="#">Sửa</a></td>
              </tr>
              <tr class="copy_box">
                <td colspan="2"> <a class="copy_btn">COPY</a> </td>
                <td colspan="6"><a class="copy_link" href="/dangkyhoatdong?id=${
                    dep_atv[i]._id
                }&level=khoa">Link đăng kí và điểm danh hoạt động</a></td>
              </tr>
            `);
            }
            //append activities to class' table ************************************************************
            for (let i = 0; i < cls_atv.length; i++) {
                $('#cls_tb tbody').append(`
              <tr class="atv_box">
                <td>
                  <div class="checkbox-wrapper-4">
                    <input type="checkbox" id="row__2__${i}" class="inp-cbx" value="${cls_atv[i]._id}" />
                    <label for="row__2__${i}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                    </label>
                </td>
                <td class="index">${i + 1}</td>
                <td class="a_name">${cls_atv[i].name}</td>
                <td class="c_name">${cls_atv[i].cls}</td>
                <td class="school_year">${cls_atv[i].year.split('_')[0]} ${cls_atv[i].year.split('_')[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/${cls_atv[i].cls}/${cls_atv[i]._id}">Chi tiết</a></td>
                <td><a class="more_list" id="cls_edit" href="#">Sửa</a></td>
              </tr>
              <tr class="copy_box">
                <td colspan="2"> <a class="copy_btn">COPY</a> </td>
                <td colspan="6"><a class="copy_link" href="/dangkyhoatdong?id=${cls_atv[i]._id}&class=${
                    cls_atv[i].cls
                }&level=lop">Link đăng kí và điểm danh hoạt động</a></td>
              </tr>
            `);
            }
        });

        // able curr button
        $(this).prop('disabled', false);
        // hide loading animation
        $('.loader-parent').hide();
        $('#school_tb').show();
        $('#dep_tb').show();
        $('#cls_tb').show();
    } else if (response.status == 500) {
        // able curr button
        $(this).prop('disabled', false);

        // hide loading animation
        $('.loader-parent').hide();
        $('#school_tb').show();
        $('#dep_tb').show();
        $('#cls_tb').show();

        // Error occurred during upload
        notify('x', 'Có lỗi xảy ra!');
    }
});

// subjects choise button:
$('#subject_choice').click(async function () {
    // show loading animation for class table
    $('#cls-loader').css('display', 'flex');
    $('#cls-loader').show();
    $('#cls_tb').hide();
    // disable this btn
    $(this).prop('disabled', true);
    // get semester
    const choise_cls = $('#select_cls').find('select :selected');

    // send request to load new activities fix year input
    // request
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cls: choise_cls.val(),
        }),
    };

    const response = await fetch('/api/loadClassActivities', requestOptions);
    if (response.ok) {
        // clear all appeariance activities in class activities table
        $('#cls_tb .atv_box').remove();
        //append activities to class' table ************************************************************
        response.json().then(function (result) {
            for (let i = 0; i < result.length; i++) {
                $('#cls_tb tbody').append(`
              <tr class="atv_box">
                <td>
                  <div class="checkbox-wrapper-4">
                    <input type="checkbox" id="row__2__${i}" class="inp-cbx" value="${result[i]._id}" />
                    <label for="row__2__${i}" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
                    </label>
                </td>
                <td class="index">${i + 1}</td>
                <td class="a_name">${result[i].name}</td>
                <td class="c_name">${result[i].cls}</td>
                <td class="school_year">${result[i].year.split('_')[0]} ${result[i].year.split('_')[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/${result[i].cls}/${result[i]._id}">Chi tiết</a></td>
                <td><a class="more_list" id="cls_edit" href="#">Sửa</a></td>
              </tr>
              <tr class="copy_box">
                <td colspan="2"> <a class="copy_btn">COPY</a> </td>
                <td colspan="6"><a class="copy_link" href="#">Link đăng kí và điểm danh hoạt động</a></td>
              </tr>
            `);
            }
        });

        // hide loading animation
        $('#cls-loader').hide();
        $('#cls_tb').show();

        // able curr button
        $(this).prop('disabled', false);
    } else if (response.status == 500) {
        // hide loading animation
        $('#cls-loader').hide();
        $('#cls_tb').show();
        // able curr button
        $(this).prop('disabled', false);
        // Error occurred during upload
        notify('x', 'Có lỗi xảy ra!');
    }
});

// delete button
// delete check checkbox
$('#delete__activity').click(async function () {
    // disable curr button
    
    $(this).prop('disabled', true);

    // notify("!", "Đang xóa dữ liệu!");

    let school_rmatv = [];
    let dep_rmatv = [];
    let cls_rmatv = [];

    // add all checked line in school activities to school activities remove list
    $('#school_tb tbody .inp-cbx').each(function () {
        if (this.checked) {
            school_rmatv.push(this.value);
        }
    });

    // add all checked line in department activities to department activities remove list
    $('#dep_tb tbody .inp-cbx').each(function () {
        if (this.checked) {
            dep_rmatv.push(this.value);
        }
    });

    // add all checked line in class activities to class activities remove list
    $('#cls_tb tbody .inp-cbx').each(function () {
        if (this.checked) {
            cls_rmatv.push(this.value);
        }
        cls_rmatv;
    });

    if (school_rmatv.length > 0 || dep_rmatv.length > 0 || cls_rmatv.length > 0) {
        quest(
            'Bạn có chắc chắn muốn xoá tất cả hoạt động được đánh dấu. Dữ liệu bị xoá sẽ KHÔNG THỂ ĐƯỢC KHÔI PHỤC!',
        ).then(async (result) => {
            if (result) {
                // request
                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        school_rmatv: school_rmatv,
                        dep_rmatv: dep_rmatv,
                        cls_rmatv: cls_rmatv,
                    }),
                };

                const response = await fetch('/api/deleteActivities', requestOptions);
                if (response.ok) {
                    // remove all checked line
                    $('table tbody .inp-cbx').each(function () {
                        if (this.checked) {
                            // remove currline
                            $(this).parent().parent().parent().remove();
                        }
                    });

                    // rewrite all numbers of lines after remove of schoole activities, department activities, class activities
                    // school:
                    let index = 1;
                    $('#school_tb tbody .index').each(function () {
                        $(this).text(index);
                        index += 1;
                    });

                    // department:
                    index = 1;
                    $('#dep_tb tbody .index').each(function () {
                        $(this).text(index);
                        index += 1;
                    });

                    // class:
                    index = 1;
                    $('#cls_tb tbody .index').each(function () {
                        $(this).text(index);
                        index += 1;
                    });

                    // able curr button
                    $(this).prop('disabled', false);

                    notify('n', 'Đã xóa các cố vấn được đánh dấu');
                } else if (response.status == 500) {
                    // able curr button
                    $(this).prop('disabled', false);
                    // Error occurred during upload
                    notify('x', 'Có lỗi xảy ra!');
                }
            } else {
                // able curr button
                $(this).prop('disabled', false);
                console.log('không xoá bất cứ dữ liệu nào');
            }
        });
    } else {
        notify('!', 'Không có cố vấn được đánh dấu');
        $(this).prop('disabled', false);
    }
});

$('.exist_btn').click(async function () {
    $('.modal').hide();
});

// all checkbox set (if all-cbx tick all checkboxs will tick otherwise untick all)
// class:
$(document).on('change', '#cls_tb .all-cbx', async function () {
    if ($('#cls_tb .all-cbx')[0].checked) {
        $('#cls_tb tbody .inp-cbx').prop('checked', true);
    } else {
        $('#cls_tb tbody .inp-cbx').prop('checked', false);
    }
});

// if all checkboxs was check all-cbx will tick
$(document).on('change', '#cls_tb .inp-cbx', async function () {
    let check = true;
    $('#cls_tb tbody .inp-cbx').each(function () {
        if (!this.checked) check = false;
        return;
    });

    if (check) {
        $('#cls_tb .all-cbx').prop('checked', true);
    } else {
        $('#cls_tb .all-cbx').prop('checked', false);
    }
});

// department
$(document).on('change', '#dep_tb .all-cbx', async function () {
    if ($('#dep_tb .all-cbx')[0].checked) {
        $('#dep_tb tbody .inp-cbx').prop('checked', true);
    } else {
        $('#dep_tb tbody .inp-cbx').prop('checked', false);
    }
});

// if all checkboxs was check all-cbx will tick
$(document).on('change', '#dep_tb .inp-cbx', async function () {
    let check = true;
    $('#dep_tb tbody .inp-cbx').each(function () {
        if (!this.checked) check = false;
        return;
    });

    if (check) {
        $('#dep_tb .all-cbx').prop('checked', true);
    } else {
        $('#dep_tb .all-cbx').prop('checked', false);
    }
});

// school
$(document).on('change', '#school_tb .all-cbx', async function () {
    if ($('#school_tb .all-cbx')[0].checked) {
        $('#school_tb tbody .inp-cbx').prop('checked', true);
    } else {
        $('#school_tb tbody .inp-cbx').prop('checked', false);
    }
});

// if all checkboxs was check all-cbx will tick
$(document).on('change', '#school_tb .inp-cbx', async function () {
    let check = true;
    $('#school_tb tbody .inp-cbx').each(function () {
        if (!this.checked) check = false;
        return;
    });

    if (check) {
        $('#school_tb .all-cbx').prop('checked', true);
    } else {
        $('#school_tb .all-cbx').prop('checked', false);
    }
});
