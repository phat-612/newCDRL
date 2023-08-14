$(document).ready(function () {
    $("#page-button-1").on("click", async function () {
        const selectedYear = $("#mySelect2").val();
        const response = await fetch(`/api/getuserscore?schoolYear=${selectedYear}`);
        const data = await response.json();

        data.forEach((item) => {
            const totalResultElement = $(`.total-result[data-year="${item.year}"]`);
            totalResultElement.text(`${item.total}`);
        });

        localStorage.setItem("schoolYear", selectedYear);
    });
});

$("#HK1_").on("click", async function (event) {
    const selectedYear = $("#mySelect2").val();
    // event.preventDefault()
    localStorage.setItem("schoolYear", `HK1_${selectedYear}`);
});
$("#HK2_").on("click", async function (event) {
    const selectedYear = $("#mySelect2").val();
    // event.preventDefault()
    localStorage.setItem("schoolYear", `HK2_${selectedYear}`);
});