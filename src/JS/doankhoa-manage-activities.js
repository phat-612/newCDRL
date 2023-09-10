const activities_name = document.querySelector("#activities_title");
const activities_content = document.querySelector(".activities_content");
const select_level = document.querySelector(".select_level");
const select_class = document.querySelector(".select_class");
const add_activities_btn = document.querySelector("#add_activities_btn");
const load_activities_btn = document.querySelector(".load_btn")

select_level.addEventListener("change", function() {
    if (select_level.value === "khoa") {
        select_class.style.display = "none";
    } else {
        select_class.style.display = "block";
    }
});
load_activities_btn.onclick =async function (e) {
    console.log("click");
        try {
            const requestOptions = {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                body: ""
                },
            };
            const response = await fetch('/api/load_Activities_list', requestOptions);
            if(response.ok){
                notify('n', 'thêm hoạt động thành công !!!!');
            }
            else{
                notify('x', 'thêm hoạt động không thành công !!!!');
            }
        } catch (error) {
            console.log(error);
        }
    }

add_activities_btn.onclick =async function (e) {
        try {
            let postData = JSON.stringify({
                activities_name: activities_name.value,
                activities_content: activities_content.value,
                class: select_class.value,
                cap:select_level.value
            });
            const requestOptions = {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: postData
            };
            const response = await fetch('/api/add_activities', requestOptions);
            if(response.ok){
                notify('n', 'thêm hoạt động thành công !!!!');
            }
            else{
                notify('x', 'thêm hoạt động không thành công !!!!');
            }
        } catch (error) {
            console.log(error);
        }
    }

