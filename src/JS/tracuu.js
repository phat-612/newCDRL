$(document).ready(function () {
  $("#page-button-1").on("click", async function () {
    const selectedYear = $("#mySelect2").val();
    console.log(selectedYear)
    const response = await fetch(`/api/getuserscore?schoolYear=${selectedYear}`);
    const data = await response.json();
    data.forEach((item) => {
      console.log(item.year);
      const totalResultElement = $(`.total-result[data-year="${item.year}_total"]`);
      document.querySelector(`td a#${item.year}`).href = `/xembangdiem?schoolYear=${item.year}_${selectedYear}`;
      totalResultElement.text(item.total);
    });


    // set nut xem ban diem cho tung muc
    const totalResultElements = document.querySelectorAll(".total-result");
    totalResultElements.forEach(function (element) {
      const nextTd = element.nextElementSibling;
      if (element.textContent.trim() === "Chưa có điểm") {
        nextTd.querySelector("a").style.display = "none";
      }
      else {
        nextTd.querySelector("a").style.display = "block";

      }
    });
  });

});

