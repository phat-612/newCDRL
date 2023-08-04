$(document).on("dragover", ".modal_wrap_img_item", handleDragOver);
$(document).on("dragleave", ".modal_wrap_img_item", handleDragLeave);
$(document).on("drop", ".modal_wrap_img_item", handleDrop);
$(document).on("click", ".up-img-btn", handleUploadButtonClick);
$(document).on("change", ".upload-input", handleUploadInputChange);

function handleDragOver(event) {
  event.preventDefault();
  $(this).addClass("dragover");
}

function handleDragLeave(event) {
  event.preventDefault();
  $(this).removeClass("dragover");
}

function handleDrop(event) {
  event.preventDefault();
  $(this).removeClass("dragover");
  const file = event.originalEvent.dataTransfer.files[0];
  displayImage.call(this, file);
}

function handleUploadButtonClick() {
  $(this).siblings(".upload-input").click();
}

function handleUploadInputChange(event) {
  const file = event.target.files[0];
  displayImage.call($(this).parent().parent(), file);
}

function displayImage(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    $(this).find(".up-img").attr("src", event.target.result);
  }.bind($(this));
  reader.readAsDataURL(file);
}
