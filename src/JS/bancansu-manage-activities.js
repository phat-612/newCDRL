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
                  <td class="index">${i + 1}</td>
                  <td class="a_name">${school_atv[i].name}</td>
                  <td class="school_year">${school_atv[i].year.split('_')[0]} ${school_atv[i].year.split('_')[1]}</td>
                  <td><a href="/doankhoa/quanlihoatdong/Truong/${school_atv[i]._id}">Chi tiết</a></td>
                </tr>
                <tr class="copy_box">
                  <td> <a class="copy_btn">COPY</a> </td>
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
                <td class="index">${i + 1}</td>
                <td class="a_name">${dep_atv[i].name}</td>
                <td class="school_year">${dep_atv[i].year.split('_')[0]} ${dep_atv[i].year.split('_')[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/Khoa/${dep_atv[i]._id}">Chi tiết</a></td>
              </tr>
              <tr class="copy_box">
                <td> <a class="copy_btn">COPY</a> </td>
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
                <td class="index">${i + 1}</td>
                <td class="a_name">${cls_atv[i].name}</td>
                <td class="c_name">${cls_atv[i].cls}</td>
                <td class="school_year">${cls_atv[i].year.split('_')[0]} ${cls_atv[i].year.split('_')[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/${cls_atv[i].cls}/${cls_atv[i]._id}">Chi tiết</a></td>
              </tr>
              <tr class="copy_box">
                <td> <a class="copy_btn">COPY</a> </td>
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
                <td class="index">${i + 1}</td>
                <td class="a_name">${result[i].name}</td>
                <td class="c_name">${result[i].cls}</td>
                <td class="school_year">${result[i].year.split('_')[0]} ${result[i].year.split('_')[1]}</td>
                <td><a href="/doankhoa/quanlihoatdong/${result[i].cls}/${result[i]._id}">Chi tiết</a></td>
              </tr>
              <tr class="copy_box">
                <td> COPY </td>
                <td colspan="6"><a href="#">Link đăng kí và điểm danh hoạt động</a></td>
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
