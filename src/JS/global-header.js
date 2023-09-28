const currentUrl = window.location.href;
const currentURLbase = window.location.protocol + "//" + window.location.host;
const currentURLsub = currentUrl.replace(currentURLbase, "");
function connectWebSocket() {
  const wss = new WebSocket(
    `${currentURLbase.replace("https", "wss").replace("http", "ws")}/howtosavealife?`
  );
  wss.onopen = function () {
    wss.send("ok ko e?");
  };
  wss.onmessage = (event) => {
    if (event.data === "reload") {
      window.location.reload();
    }
  };

  wss.onclose = function (event) {
    if (!currentURLsub.startsWith(currentURLsub)) {
      console.log("Reconnect");
      // Khi bị mất kết nối, ta sẽ gọi hàm reconnect sau khoảng thời gian xác định
      setTimeout(connectWebSocket, 15000);
    }
  };
}
connectWebSocket();

// theme
const theme_btn = document.querySelector(".theme_check");
const themes = localStorage.getItem("theme");
const rootStyle = document.documentElement.style;

function setLight() {
  // localStorage.setItem("theme", "light");
  rootStyle.setProperty("--html-color", "#e7ecf0");
  rootStyle.setProperty("--header-text", "#667580");
  rootStyle.setProperty("--black-color", "#000");
  rootStyle.setProperty("--white-color", "#fff");
  rootStyle.setProperty("--table-header", "rgb(206, 206, 206)");
  rootStyle.setProperty("--tb-white", "rgb(241, 241, 241)");
  rootStyle.setProperty("--tr-hover", "rgb(247 234 255)");
  rootStyle.setProperty("--button-color", "#d3d3d3");
  rootStyle.setProperty("--mauvang-ne", "rgb(251, 251, 138)");
  rootStyle.setProperty("--primColor", "#dcdcdc");
  rootStyle.setProperty("--secoColor", "#555555");
  rootStyle.setProperty("--secoColor", "#555555");
  rootStyle.setProperty("--modal-color", "rgb(233 233 233 / 60%)");
  rootStyle.setProperty("--input-hover", "#d9d9d982");
  rootStyle.setProperty("--btn-delete", "#f0f0f0");
  rootStyle.setProperty("--no-img", "#d4d1d1");
  rootStyle.setProperty("--modal_img_btn", "#aeaeae");
  // rootStyle.setProperty("--checkbox-active", "rgb(143, 213, 229)");
  // rootStyle.setProperty("--tr-hover", "rgb(247 234 255)");
  // rootStyle.setProperty("--table-header", "rgb(206, 206, 206)");
  // rootStyle.setProperty("--td-a", "rgb(117, 117, 255)");
  // rootStyle.setProperty("--td-ahover", "rgb(79 79 235)");
  // rootStyle.setProperty("--header-boxshadow", "#70707042");
  // rootStyle.setProperty("--button-color", "#d3d3d3");
  // rootStyle.setProperty("--checkbox-boxshadow", "rgba(0, 16, 75, 0.05)");
  // rootStyle.setProperty("--checkbox-border", "#9b9ea7");
  // rootStyle.setProperty("--checkbox-border-hover", "#c2c2c2");
  // rootStyle.setProperty("--tb-white", "rgb(241, 241, 241");
  // rootStyle.setProperty("--login-a", "rgb(98, 98, 232)");
  // rootStyle.setProperty("--login-boxshadow", "rgba(0, 0, 0, 0.6)");
  // rootStyle.setProperty(" --lonin-input-focus", "#bdb8b8");
  // rootStyle.setProperty("--mauvang-ne", "rgb(251, 251, 138)");
  // rootStyle.setProperty("--modal-color", "rgba(233, 233, 233, .6)");
  // rootStyle.setProperty("--input-hover", "#d9d9d982");
  // rootStyle.setProperty("--input-placeholder", "#767676");
  // rootStyle.setProperty(" --table-border", "#aeaeae");
  // rootStyle.setProperty(" --select-bg", "#ffffff00");
  // rootStyle.setProperty("--red-color", "red");
  // rootStyle.setProperty("--otp-input", "#ededea");
}

function setDark() {
  // home
  // mau doi ne

  rootStyle.setProperty("--html-color", "#232627");
  rootStyle.setProperty("--header-text", "#9fa0a0");
  rootStyle.setProperty("--black-color", "#fff");
  rootStyle.setProperty("--white-color", "#181a1b");
  rootStyle.setProperty("--table-header", "#34383a");
  rootStyle.setProperty("--tb-white", "#202324");
  rootStyle.setProperty("--tr-hover", "#1e2022");
  rootStyle.setProperty("--button-color", "#313537");
  rootStyle.setProperty("--mauvang-ne", "#777804");
  rootStyle.setProperty("--primColor", "#2c2f31");
  rootStyle.setProperty("--secoColor", "#70685c");
  rootStyle.setProperty("--modal-color", "rgb(12 12 12 / 60%)");
  rootStyle.setProperty("--input-hover", "#4d484882");
  rootStyle.setProperty("--btn-delete", "#50575b");
  rootStyle.setProperty("--no-img", "#313537");
  rootStyle.setProperty("--modal_img_btn", "#464c4f");

  // rootStyle.setProperty("--checkbox-active", "rgb(143, 213, 229)");
  // rootStyle.setProperty("--tr-hover", "rgb(247 234 255)");
  // rootStyle.setProperty("--table-header", "rgb(206, 206, 206)");
  // rootStyle.setProperty("--td-a", "rgb(117, 117, 255)");
  // rootStyle.setProperty("--td-ahover", "rgb(79 79 235)");
  // rootStyle.setProperty("--header-boxshadow", "#70707042");
  // rootStyle.setProperty("--button-color", "#d3d3d3");
  // rootStyle.setProperty("--checkbox-boxshadow", "rgba(0, 16, 75, 0.05)");
  // rootStyle.setProperty("--checkbox-border", "#9b9ea7");
  // rootStyle.setProperty("--checkbox-border-hover", "#c2c2c2");
  // rootStyle.setProperty("--tb-white", "rgb(241, 241, 241");
  // rootStyle.setProperty("--login-a", "rgb(98, 98, 232)");
  // rootStyle.setProperty("--login-boxshadow", "rgba(0, 0, 0, 0.6)");
  // rootStyle.setProperty(" --lonin-input-focus", "#bdb8b8");
  // rootStyle.setProperty("--mauvang-ne", "rgb(251, 251, 138)");
  // rootStyle.setProperty("--modal-color", "rgba(233, 233, 233, .6)");
  // rootStyle.setProperty("--input-hover", "#d9d9d982");
  // rootStyle.setProperty("--input-placeholder", "#767676");
  // rootStyle.setProperty(" --table-border", "#aeaeae");
  // rootStyle.setProperty(" --select-bg", "#ffffff00");
  // rootStyle.setProperty("--red-color", "red");
  // rootStyle.setProperty("--otp-input", "#ededea");
}
if (themes) {
  if (themes === "dark") {
    theme_btn.checked = true;
    setDark();
  } else {
    theme_btn.checked = false;
    setLight();
  }
} else {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    localStorage.setItem("theme", "dark");
    theme_btn.checked = true;
    setDark();
  } else {
    localStorage.setItem("theme", "light");
    theme_btn.checked = false;
    setLight();
  }
}

theme_btn.addEventListener("change", () => {
  if (theme_btn.checked) {
    localStorage.setItem("theme", "dark");
    setDark();
  } else {
    localStorage.setItem("theme", "light");
    setLight();
  }
});
