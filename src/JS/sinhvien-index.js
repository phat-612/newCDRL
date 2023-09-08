

$("#mySelect2").change(async function () {
  notify('!','Đang tải dữ liệu...');
  const selectedYear = $("#mySelect2").val();
  const response = await fetch(`/api/getuserscore?schoolYear=${selectedYear}`);
  const data = await response.json();
  data.forEach((item) => {
    console.log(item.year);
    const totalResultElement = $(`.total-result[data-year="${item.year}_total"]`);
    document.querySelector(`td a#${item.year}`).href = `/hocsinh/xembangdiem?schoolYear=${item.year}_${selectedYear}`;
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
  notify('n','Thành công!');

});


