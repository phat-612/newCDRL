const score1 = document.querySelectorAll(".score_1");
const score2 = document.querySelectorAll(".score_2");
const score3 = document.querySelectorAll(".score_3");
const score4 = document.querySelectorAll(".score_4");
const score5 = document.querySelectorAll(".score_5");

function calculateSum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}


function setscore1(firstScores) {
    score1.forEach((score1, index) => {
        score1.textContent = firstScores[index];
    });
   document.getElementById("total_muc_1").innerText=calculateSum(firstScores);
    
}
function setscore2(secondScores) {
    score2.forEach((score2, index) => {
        score2.textContent = secondScores[index];
    });
   document.getElementById("total_muc_2").innerText=calculateSum(secondScores);
    
}
function setscore3(thirdScores) {
    score3.forEach((score3, index) => {
        score3.textContent = thirdScores[index];
    });
   document.getElementById("total_muc_3").innerText=calculateSum(thirdScores);
    
}
function setscore4(fourthScores) {
    score4.forEach((score4, index) => {
        score4.textContent = fourthScores[index];
    });
   document.getElementById("total_muc_4").innerText=calculateSum(fourthScores);
    
}
function setscore5(fifthScores) {
    score5.forEach((score5, index) => {
        score5.textContent = fifthScores[index];
    });
   document.getElementById("total_muc_5").innerText=calculateSum(fifthScores);  
}

function totalall(all){
    document.getElementById("total_all").innerText=all;
}

