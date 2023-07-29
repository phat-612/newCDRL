$(document).ready(function () {
  $(".up-btn").click(function () {
    $(".modal").show();
  });

  $(".close-dialog").click(function () {
    $(".modal").hide();
  });

  $(".add-btn").click(function () {
    if ($(".modal_img .no-img")) {
      $(".modal_img .no-img").hide();
    }
    if ($(".modal_img").children().length < 5) {
      $(".modal_img").append(`
      <div class="modal_wrap_img">
  
        <div class="modal_wrap_img_item">
          <p>Drag and drop an image here, or click to upload.</p>
  
          <input type="file" class="upload-input" style="display: none;">
          <img class="up-img">
          <button class="up-img-btn">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        
      
        <textarea class="up-img-description" name="description" cols="30" rows="5" placeholder="Mô Tả"></textarea>
        <button class="drop_img"><i class="fa-solid fa-trash"></i></button> 
      </div>
      `);
    }
    const element_scroll = document.querySelector('.modal_img');
    element_scroll.scrollTop = element_scroll.scrollHeight;

  });
});

$(document).on('click', '.drop_img ', function () {
  $(this).parent().remove();
});

$(document).on('dragover', '.modal_wrap_img_item', handleDragOver);
$(document).on('dragleave', '.modal_wrap_img_item', handleDragLeave);
$(document).on('drop', '.modal_wrap_img_item', handleDrop);
$(document).on('click', '.up-img-btn', handleUploadButtonClick);
$(document).on('change', '.upload-input', handleUploadInputChange);

function handleDragOver(event) {
  event.preventDefault();
  $(this).addClass('dragover');
}

function handleDragLeave(event) {
  event.preventDefault();
  $(this).removeClass('dragover');
}

function handleDrop(event) {
  event.preventDefault();
  $(this).removeClass('dragover');
  const file = event.originalEvent.dataTransfer.files[0];
  displayImage.call(this, file);
}

function handleUploadButtonClick() {
  $(this).siblings('.upload-input').click();
}

function handleUploadInputChange(event) {
  const file = event.target.files[0];
  displayImage.call($(this).parent().parent(), file);
}

function displayImage(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    $(this).find('.up-img').attr('src', event.target.result);
  }.bind($(this));
  reader.readAsDataURL(file);
  $(this).find('.up-img-btn i').hide();
}

$(document).mouseup(function (e) {
  var container = $(".modal");

  // if the target of the click isn't the container nor a descendant of the container
  if (container.is(e.target) && container.has(e.target).length === 0) {
    container.hide();
  }
});
// tính điểm ------------------------------------------------------------------------------------------------------------------------------------------------------------

function getSelectValue(selectId) {
  return parseInt(document.getElementById(selectId).value);
}

function getScoreValue(scoreId) {
  const text = document.getElementById(scoreId).innerText;
  return parseInt((text.match(/\d+/) || [])[0]);
}

function sumArrayWithReduce(arr) {
  return arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

const checkbox_list = {
  tier_1: ['morning1', 'morning2'],
  tier_2: ['morning3', 'morning4', 'morning5', 'morning6'],
  tier_3: ['morning7', 'morning8'],
  tier_4: ['morning9', 'morning10'],
  tier_5: ['morning11', 'morning12'],
  tier_6: ['morning13', 'morning14'],
};

const select_list = {
  tier_1: 'mySelect3',
  tier_2: null,
  tier_3: 'mySelect5',
  tier_4: 'mySelect6',
  tier_5: 'mySelect7',
  tier_6: 'mySelect16',
};


const index_tier_1 = () => {
  return sumArrayWithReduce([
    getSelectValue('mySelect1'),
    getSelectValue('mySelect2'),
    getSelectValue('mySelect3'),
    getSelectValue('mySelect4'),
    getScoreValue('score_05')
  ])
};

const index_tier_2 = () => {
  return sumArrayWithReduce([
    getSelectValue('mySelect5'),
    getSelectValue('mySelect6')
  ])
};

const index_tier_3 = () => {
  return sumArrayWithReduce([
    getSelectValue('mySelect7'),
    getSelectValue('mySelect8'),
    getSelectValue('mySelect9')
  ])
};

const index_tier_4 = () => {
  return sumArrayWithReduce([
    getSelectValue('mySelect10'),
    getSelectValue('mySelect11'),
    getSelectValue('mySelect12')
  ])
};

const index_tier_5 = () => {
  return sumArrayWithReduce([
    getSelectValue('mySelect13'),
    getSelectValue('mySelect14'),
    getSelectValue('mySelect15'),
    getSelectValue('mySelect16'),
  ])
};


function total_tier() {
  document.getElementById('total_muc_1').innerText = index_tier_1() + ' điểm';
  document.getElementById('total_muc_2').innerText = index_tier_2() + ' điểm';
  document.getElementById('total_muc_3').innerText = index_tier_3() + ' điểm';
  document.getElementById('total_muc_4').innerText = index_tier_4() + ' điểm';
  document.getElementById('total_muc_5').innerText = index_tier_5() + ' điểm';
  document.getElementById('total_all').innerText = index_tier_1() + index_tier_2() + index_tier_3() + index_tier_4() + index_tier_5() + ' điểm';
}


function handleCheckboxChange(event) {

  const checkbox = event.target;
  if (checkbox.checked) {
    for (const [tier, checkboxTier] of Object.entries(checkbox_list)) {
      if (checkboxTier.includes(checkbox.id)) {
        if (tier == 'tier_2') {
          document.getElementById('score_05').innerText = checkbox.value + ' điểm';
        }
        if (select_list[tier]) {
          const selectElement = document.getElementById(select_list[tier]);
          selectElement.value = parseInt(checkbox.value);
        }

        checkboxTier.forEach(checkbox_i => {
          if (checkbox.id != checkbox_i) {
            document.getElementById(checkbox_i).checked = false;
          }

        });
      }
    }
  } else {
    for (const [tier, checkboxTier] of Object.entries(checkbox_list)) {
      if (checkboxTier.includes(checkbox.id)) {
        if (select_list[tier]) {
          const selectElement = document.getElementById(select_list[tier]);
          selectElement.value = parseInt(0);
        };
        if (tier == 'tier_2') {
          document.getElementById('score_05').innerText = '0 điểm';
        }
      }
    }
  }
  total_tier();
}

const checkboxes = document.querySelectorAll('.checkbox-wrapper-4 input[type="checkbox"]');
checkboxes.forEach(checkbox_i => {
  checkbox_i.addEventListener('change', handleCheckboxChange);
});


function handleSelectChange(event) {
  const selectbox = event.target;

  for (const [tier, selectboxTier] of Object.entries(select_list)) {
    if (selectboxTier == selectbox.id) {
      checkbox_list[tier].forEach(checkbox_i => {
        if (selectbox.value != document.getElementById(checkbox_i).value) {
          document.getElementById(checkbox_i).checked = false;
        } else {
          document.getElementById(checkbox_i).checked = true;
        }
      })
    }
  }
  total_tier();
}

const selectboxes = document.querySelectorAll('.selectbox select');

selectboxes.forEach(selectbox => {
  selectbox.addEventListener('change', handleSelectChange);
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------