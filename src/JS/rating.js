$(document).ready(function () {
  const $dropArea = $('.modal_wrap_img_item');
  const $uploadInput = $('.upload-input');
  const $uploadButton = $('.up-img-btn');
  const $uploadedImage = $('.up-img');

  $(".up-btn").click(function () {
    $(".modal").show();
  });

  $(".close-dialog").click(function () {
    $(".modal").hide();
  });

  $(".add-btn").click(function () {
    $(".modal").hide();
  });

  // Add event listeners
  $dropArea.on('dragover', handleDragOver);
  $dropArea.on('dragleave', handleDragLeave);
  $dropArea.on('drop', handleDrop);
  $uploadButton.on('click', handleUploadButtonClick);
  $uploadInput.on('change', handleUploadInputChange);

  function handleDragOver(event) {
    event.preventDefault();
    $dropArea.addClass('dragover');
  }

  function handleDragLeave(event) {
    event.preventDefault();
    $dropArea.removeClass('dragover');
  }

  function handleDrop(event) {
    event.preventDefault();
    $dropArea.removeClass('dragover');
    const file = event.originalEvent.dataTransfer.files[0];
    displayImage(file);
  }

  function handleUploadButtonClick() {
    $uploadInput.click();
  }

  function handleUploadInputChange(event) {
    const file = event.target.files[0];
    displayImage(file);
  }

  function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      $uploadedImage.attr('src', event.target.result);
    }
    reader.readAsDataURL(file);
    $('.up-img-btn i').hide();
  }
});

$(document).mouseup(function (e) {
  var container = $(".modal");

  // if the target of the click isn't the container nor a descendant of the container
  if (container.is(e.target) && container.has(e.target).length === 0) {
    container.hide();
  }
});

// check box ----------------------------------------------------------------------------------------------------

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
  tier_2: '',
  tier_3: 'mySelect5',
  tier_4: 'mySelect6',
  tier_5: 'mySelect7',
  tier_6: 'mySelect16',
}





function handleCheckboxChange(event) {
  const checkbox = event.target;
  console.log(checkbox);
  if (checkbox.checked) {
    for (const [tier, checkboxTier] of Object.entries(checkbox_list)) {
      if (checkboxTier.includes(checkbox.id)) {
        const selectElement = document.getElementById(select_list[tier]);
        console.log(selectElement);
        selectElement.value = parseInt(checkbox.value);
        checkboxTier.forEach(checkbox_i => {
          if (checkbox.id != checkbox_i) {
            document.getElementById(checkbox_i).checked = false;
          }
        });
      }
    }


    // Object.values(checkbox_list).forEach(checkboxTier => {
    //   if (checkboxTier.includes(checkbox.id)) {
    //     checkboxTier.forEach(checkbox_i => {
    //       if (checkbox.id != checkbox_i) {
    //         document.getElementById(checkbox_i).checked = false;
    //       }

    //     });
    //   }
    // });
  }
}

const checkboxes = document.querySelectorAll('.checkbox-wrapper-4 input[type="checkbox"]');
checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', handleCheckboxChange);
});

