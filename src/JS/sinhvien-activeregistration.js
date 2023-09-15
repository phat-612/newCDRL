function validateFile(file) {
    let allowedFormats = ["jpg", "jpeg", "png"]; // Allowed file formats
    let maxSize = 5485760; // MBit in bytes
    // Check file format
    const fileName = file.name;
    const fileExtension = fileName
        .substring(fileName.lastIndexOf(".") + 1)
        .toLowerCase();
    if (!allowedFormats.includes(fileExtension)) {
        // Invalid file format
        notify("x", "Sai định dạng file!");
        return false;
    }
    if (file.size > maxSize) {
        notify("!", "Up ảnh dưới 5mb!");
        return false;
    }
    // File is valid
    return true;
}
//////////////////////
$(document).ready(function () {
    $(".post-btn").click(function () {
        const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
        if (modal_wrap_img.length < 5) {
            $(".add-btn").css("display", "block");
        }
        $(".modal").show();
    });

    $(".close-dialog").click(function () {
        const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
        for (const item of modal_wrap_img) {
            if (item.querySelector("img").src === "") {
                item.remove();
                $(".no-img span").text($(".modal_img").children().length);
            }
        }
        $(".modal").hide();
    });
    $(".done-btn2").click(function () {
        const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
        for (const item of modal_wrap_img) {
            if (item.querySelector("img").src === "") {
                item.remove();
                $(".no-img span").text($(".modal_img").children().length);
            }
        }
        $(".modal").hide();
    });

    $(".add-btn").click(function () {
        if ($(".modal_img").children().length < 5) {
            $(".modal_img").append(`
        <div class="modal_wrap_img">
    
          <div class="modal_wrap_img_item">
            <p>Kéo thả hình ảnh vào đây hoặc nhấn vào để tải lên.</p>
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

            $(".no-img span").text($(".modal_img").children().length);

            if ($(".modal_img").children().length == 5) {
                this.style.display = "none";
            }
        }
        const element_scroll = document.querySelector(".modal_img");
        element_scroll.scrollTop = element_scroll.scrollHeight;
    });
});

$(document).on("click", ".drop_img ", function () {
    $(this).parent().remove();
    $(".no-img span").text($(".modal_img").children().length);
    document.querySelector(".add-btn").style.display = "block";
});

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
    let files = event.originalEvent.dataTransfer.files;

    if (validateFile(files[0])) {

        event.preventDefault();
        $(this).removeClass("dragover");
        const file = files[0];
        displayImage.call($(this), file);

        $(this).find(".upload-input").prop('files', files);
    }
}

function handleUploadButtonClick() {
    $(this).siblings(".upload-input").click();
}

function handleUploadInputChange(event) {
    if (validateFile(event.target.files[0])) {
        const file = event.target.files[0];
        displayImage.call($(this).parent().parent(), file);
        // let selectedFiles = this.files;
    }
}

function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        $(this).find(".up-img").attr("src", event.target.result);
    }.bind($(this));
    reader.readAsDataURL(file);
    $(this).find(".up-img-btn i").hide();
}

$(document).mouseup(function (e) {
    var container = $(".modal");

    // if the target of the click isn't the container nor a descendant of the container
    if (container.is(e.target) && container.has(e.target).length === 0) {
        const modal_wrap_img = document.querySelectorAll(".modal_wrap_img");
        for (const item of modal_wrap_img) {
            if (item.querySelector("img").src === "") {
                item.remove();
                $(".no-img span").text($(".modal_img").children().length);
            }
        }
        container.hide();
    }
});