$(document).ready(function () {
    $("#page-button-1").on("click", async function () {
        const selectedYear = $("#mySelect2").val();
        const response = await fetch(`/api/getuserscore?schoolYear=${selectedYear}`);
        const data = await response.json();
        const linka=document.querySelectorAll('#HK_');
        linka.forEach((aa)=>{
            aa.href=`/xembangdiem?schoolYear=HK1_${selectedYear}`
        })
        data.forEach((item) => {
            const totalResultElement = $(`.total-result[data-year="${item.year}"]`);
            totalResultElement.text(`${item.total}`);
        });

        localStorage.setItem("schoolYear", selectedYear);
    });
});