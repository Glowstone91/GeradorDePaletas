let combinacoes=[];




function adicionarCor(){


let box=document.createElement("div");


box.className="corBox";



box.innerHTML=`

<input type="color" value="#ffffff">


<input type="text" value="#ffffff" maxlength="7">


<button onclick="removerCor(this)">
X
</button>

`;



document
.getElementById("inputs")
.appendChild(box);



sincronizarCores();


}







function removerCor(botao){


botao.parentElement.remove();


}







function sincronizarCores(){



document
.querySelectorAll(".corBox")
.forEach(box=>{



let color=
box.querySelector("input[type=color]");



let hex=
box.querySelector("input[type=text]");




color.oninput=function(){


hex.value=color.value;


}




hex.oninput=function(){



if(/^#[0-9A-F]{6}$/i.test(hex.value)){


color.value=hex.value;


}


}



});



}



sincronizarCores();








function criarGrade(cor,classe){



let div=document.createElement("div");


div.className="cam "+classe;





let r=parseInt(cor.substr(1,2),16);

let g=parseInt(cor.substr(3,2),16);

let b=parseInt(cor.substr(5,2),16);




let op=[1,.75,.5,.25,0];





for(let y=0;y<5;y++){



for(let x=0;x<5;x++){



let q=document.createElement("div");


q.className="q";



q.style.backgroundColor=

`rgba(${r},${g},${b},${op[x]})`;



div.appendChild(q);


}



}



return div;



}








function gerar(){



let cores=[];



document
.querySelectorAll(".corBox input[type=color]")
.forEach(c=>{


cores.push(c.value);


});




let area=document.getElementById("paletas");


area.innerHTML="";


combinacoes=[];





for(let i=0;i<cores.length;i++){



for(let j=i+1;j<cores.length;j++){



let bloco=document.createElement("div");


bloco.className="bloco";



bloco.appendChild(
criarGrade(cores[i],"cam1")
);



bloco.appendChild(
criarGrade(cores[j],"cam2")
);



area.appendChild(bloco);



combinacoes.push([
cores[i],
cores[j]
]);



}


}





criarImagem();



}










function desenharGrade(ctx, cor, offsetY, rot) {
  let r = parseInt(cor.substr(1, 2), 16);
  let g = parseInt(cor.substr(3, 2), 16);
  let b = parseInt(cor.substr(5, 2), 16);

  let op = [1, .75, .5, .25, 0];

  ctx.save();

  if (rot) {
    // Rotaciona 90° em torno do centro do bloco (125, offsetY + 125)
    ctx.translate(125, offsetY + 125);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-125, -offsetY - 125);

    // Aplica multiply igual ao CSS
    ctx.globalCompositeOperation = "multiply";
  }

  for (let linha = 0; linha < 5; linha++) {
    for (let coluna = 0; coluna < 5; coluna++) {
      ctx.fillStyle = `rgba(${r},${g},${b},${op[coluna]})`;
      ctx.fillRect(coluna * 50, linha * 50 + offsetY, 50, 50);
    }
  }

  ctx.restore();
}










function criarImagem() {
  let canvas = document.getElementById("canvasPaleta");
  let ctx = canvas.getContext("2d");

  canvas.width = 250;
  canvas.height = 250 * combinacoes.length;

  // ✅ Preenche o fundo de branco antes de desenhar
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = 0;

  combinacoes.forEach(c => {
    desenharGrade(ctx, c[0], y, false);
    desenharGrade(ctx, c[1], y, true);
    y += 250;
  });
}









function baixar(){



let canvas=

document.getElementById("canvasPaleta");



let link=document.createElement("a");



link.download="paleta.png";



link.href=

canvas.toDataURL("image/png");



link.click();



}