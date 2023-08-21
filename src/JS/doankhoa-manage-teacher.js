let curr_edit;
let old_id;
let new_id;

$(document).on("click", "#edit__class", async function () {
  // set name input as selected teacher's name
  $('.modal.edit .name--input').val($(this).parent().parent().find('.t_name').text());
  // set acount input as selected teacher's account
  $('.modal.edit .account--input').val($(this).parent().parent().find('.inp-cbx').val());
  // set combo box of edit one to curr branch 
  const curr_branch = $(this).parent().parent().find('.b_name').text();
  $('.modal.edit #select-level option').each(function () {
    if ($(this).text() == curr_branch) { // check for option that equal to curr branch
      $(this).prop("selected", 'selected'); // sellect this option 
    }
  });

  $(".modal.edit").show();
});

$(".modal.edit").click(function () {
  $(".modal.edit").hide();
});

$(".modal_wrap.edit").click(function (e) {
  e.stopPropagation();
});

$("#add__class").click(function () {
  $(".modal.add").show();
});

// hide add modal:
$(".modal.add").click(function () {
  $(".modal.add").hide();
});

$(".modal.add").click(function () {
  $(".modal.add").hide();
});

// hide add modal
$(".modal_wrap.add").click(function (e) {
  e.stopPropagation();
});

$(".exist_btn").click(function () {
  $(".modal.add").hide();
  $(".modal.edit").hide();
});

//save button
// $(".save_btn").click(async function () {

//   if ($('.modal .name--input').val() && $('.modal .account--input').val()) {
//     // disable curr button
//     $(this).prop('disabled', 'true');

//     // find input
//     $('.modal').each(function () {
//       if ($(this).is(":visible")) {
//         // get new name
//         new_name = $(this).find('.bname_input').val();
//       }
//     })

//     // request
//     const requestOptions = {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         old_name: old_name,
//         name: new_name
//       })
//     };

//     const response = await fetch('/api/addOrEditTeachers', requestOptions);
//     if (response.ok) {
//       if (curr_edit) {
//         // set current edit line name to new name
//         curr_edit.find('.b_name').text(new_name);
//       } else {
//         let length = $('table tbody tr').length;
//         $('table tbody').append(`
//           <tr>
//           <td>
//             <div class="checkbox-wrapper-4">
//               <input type="checkbox" id="row--<%= i %>" class="inp-cbx" value="<%= teachers[i]._id %>" />
//               <label for="row--<%= i %>" class="cbx"><span> <svg height="10px" width="12px"></svg></span>
//               </label>
//             </div>
//           </td>
//           <td><%= i + 1 %></td>
//           <td class="t_name"><%= teachers[i].first_name + " " + teachers[i].last_name %></td>
//           <td class="b_name"><%= branchs[i] %></td>
//           <td>
//             <% for (let j = 0; j < teachers[i].class.length; j++) {%>
//               <%= teachers[i].class[j] %>
//             <% } %>
//           </td>
//           <td>
//             <a id="edit__class" href="#">Sửa</a>
//           </td>
//         </tr>
//         `)
//       }
//       // able curr button
//       $(this).prop('disabled', 'true');
//       // disappear curr dialog 
//       $(".modal.add").hide();
//       $(".modal.edit").hide();
//       notify('n', 'Đã hoàn tất thay đổi bộ môn')
//     }
//     else if (response.status == 500) {
//       // Error occurred during upload
//       notify('x', 'Có lỗi xảy ra!');
//     }
//   } else {
//     notify('!', 'Hãy nhập đầy đủ thông tin!');
//   }
// });

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