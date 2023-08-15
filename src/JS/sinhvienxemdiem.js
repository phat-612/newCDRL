const score1=document.querySelectorAll(".score_1");
const score2=document.querySelectorAll(".score_2");
const score3=document.querySelectorAll(".score_3");
const score4=document.querySelectorAll(".score_4");
const score5=document.querySelectorAll(".score_5");



function setscore(secondScores){
    score2.forEach((score2, index) => {
        score2.textContent = secondScores[index];
    });
}