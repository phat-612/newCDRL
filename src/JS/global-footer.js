

const lastSegment = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
const item = document.querySelectorAll('.footer a')

function dropItem( ){
    for(const child of item){
        child.querySelector('i').classList.remove('active');
    }
}
if(lastSegment=='logout'){
    item[0].querySelector('i').classList.add('active');
}
else if(lastSegment=='nhapdiemdanhgia'){
    item[1].querySelector('i').classList.add('active');

}
else if(lastSegment=='profile'){
    item[2].querySelector('i').classList.add('active');
}

