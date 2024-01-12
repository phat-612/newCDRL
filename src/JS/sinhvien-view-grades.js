const windowWidth = window.innerWidth;
if (windowWidth <= 600) {
    const a = document.querySelectorAll('.tr-title td');
    for (const item of a) {
        item.setAttribute('colspan', '5');
    }
}
