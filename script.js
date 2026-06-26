let combinacoes = [];

function adicionarCor() {
  let box = document.createElement("div");
  box.className = "corBox";
  box.innerHTML = `
    <input type="color" value="#ffffff">
    <input type="text" value="#ffffff" maxlength="7">
    <button onclick="removerCor(this)">X</button>
  `;
  document.getElementById("inputs").appendChild(box);
  sincronizarCores();
}

function removerCor(botao) {
  botao.parentElement.remove();
}

function sincronizarCores() {
  document.querySelectorAll(".corBox").forEach(box => {
    let color = box.querySelector("input[type=color]");
    let hex = box.querySelector("input[type=text]");

    // garante que sempre começa com #
    if (!hex.value.startsWith("#")) {
      hex.value = "#" + hex.value.replace("#", "");
    }

    color.oninput = function () {
      hex.value = color.value.toUpperCase();
    }

    hex.oninput = function () {

      let valor = hex.value;

      // remove todos os # e coloca apenas um no começo
      valor = "#" + valor.replace(/#/g, "");

      // limita para # + 6 caracteres
      valor = valor.substring(0, 7);

      hex.value = valor.toUpperCase();

      // atualiza o seletor de cor se for HEX válido
      if (/^#[0-9A-F]{6}$/i.test(valor)) {
        color.value = valor;
      }
    }

    // impede colar errado (ex: ##FF0000)
    hex.onpaste = function (e) {
      e.preventDefault();

      let texto = e.clipboardData.getData("text");

      texto = texto.replace(/#/g, "");

      hex.value = "#" + texto.substring(0, 6).toUpperCase();

      if (/^#[0-9A-F]{6}$/i.test(hex.value)) {
        color.value = hex.value;
      }
    }
  });
}

sincronizarCores();

function criarGrade(cor, classe) {
  let div = document.createElement("div");
  div.className = "cam " + classe;
  let r = parseInt(cor.substr(1, 2), 16);
  let g = parseInt(cor.substr(3, 2), 16);
  let b = parseInt(cor.substr(5, 2), 16);
  let op = [1, .75, .5, .25, 0];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      let q = document.createElement("div");
      q.className = "q";
      q.style.backgroundColor = `rgba(${r},${g},${b},${op[x]})`;
      div.appendChild(q);
    }
  }
  return div;
}

function gerar() {
  let cores = [];
  document.querySelectorAll(".corBox input[type=color]").forEach(c => {
    cores.push(c.value);
  });
  let area = document.getElementById("paletas");
  area.innerHTML = "";
  combinacoes = [];
  for (let i = 0; i < cores.length; i++) {
    for (let j = i + 1; j < cores.length; j++) {
      let bloco = document.createElement("div");
      bloco.className = "bloco";
      bloco.appendChild(criarGrade(cores[i], "cam1"));
      bloco.appendChild(criarGrade(cores[j], "cam2"));
      area.appendChild(bloco);
      combinacoes.push([cores[i], cores[j]]);
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
    ctx.translate(125, offsetY + 125);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-125, -offsetY - 125);
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

  let cores = [];
  document.querySelectorAll(".corBox input[type=color]").forEach(c => {
    cores.push(c.value);
  });

  let tam = 50;
  let passos = 4;
  let op = [1, .75, .5, .25];

  let combos = [];
  for (let i = 0; i < cores.length; i++)
    for (let j = i + 1; j < cores.length; j++)
      combos.push([cores[i], cores[j]]);

  let linhasExtras = cores.length;

  canvas.width = passos * tam;
  canvas.height = (combos.length * passos + linhasExtras) * tam;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let offsetY = 0;

  combos.forEach(([c1, c2]) => {
    let r1 = parseInt(c1.substr(1, 2), 16), g1 = parseInt(c1.substr(3, 2), 16), b1 = parseInt(c1.substr(5, 2), 16);
    let r2 = parseInt(c2.substr(1, 2), 16), g2 = parseInt(c2.substr(3, 2), 16), b2 = parseInt(c2.substr(5, 2), 16);
    for (let linha = 0; linha < 4; linha++) {
      for (let coluna = 0; coluna < 4; coluna++) {
        let ox = coluna * tam;
        let oy = offsetY + linha * tam;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = `rgba(${r1},${g1},${b1},${op[coluna]})`;
        ctx.fillRect(ox, oy, tam, tam);
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${op[linha]})`;
        ctx.fillRect(ox, oy, tam, tam);
      }
    }
    offsetY += 4 * tam;
  });

  ctx.globalCompositeOperation = "source-over";

  cores.forEach(cor => {
    let r = parseInt(cor.substr(1, 2), 16), g = parseInt(cor.substr(3, 2), 16), b = parseInt(cor.substr(5, 2), 16);
    for (let coluna = 0; coluna < 4; coluna++) {
      ctx.fillStyle = `rgba(${r},${g},${b},${op[coluna]})`;
      ctx.fillRect(coluna * tam, offsetY, tam, tam);
    }
    offsetY += tam;
  });

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, offsetY, canvas.width, tam);
}

function toggleDropdown() {
  let d = document.getElementById("dropdown");
  d.style.display = d.style.display === "none" ? "block" : "none";
}

document.addEventListener("click", function (e) {
  let wrapper = document.getElementById("downloadWrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    document.getElementById("dropdown").style.display = "none";
  }
});

function baixar(modo) {
  document.getElementById("dropdown").style.display = "none";

  let cores = [];
  document.querySelectorAll(".corBox input[type=color]").forEach(c => cores.push(c.value));

  let op = [1, .75, .5, .25];

  let combos = [];
  for (let i = 0; i < cores.length; i++)
    for (let j = i + 1; j < cores.length; j++)
      combos.push([cores[i], cores[j]]);

  let linhasExtras = cores.length ;
  let totalLinhas = combos.length * 4 + linhasExtras;

  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");

  if (modo === "blend") {
    let tam = 50;
    canvas.width = 4 * tam;
    canvas.height = totalLinhas * tam;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let offsetY = 0;

    combos.forEach(([c1, c2]) => {
      let r1 = parseInt(c1.substr(1, 2), 16), g1 = parseInt(c1.substr(3, 2), 16), b1 = parseInt(c1.substr(5, 2), 16);
      let r2 = parseInt(c2.substr(1, 2), 16), g2 = parseInt(c2.substr(3, 2), 16), b2 = parseInt(c2.substr(5, 2), 16);
      for (let linha = 0; linha < 4; linha++) {
        for (let coluna = 0; coluna < 4; coluna++) {
          let ox = coluna * tam;
          let oy = offsetY + linha * tam;
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = `rgba(${r1},${g1},${b1},${op[coluna]})`;
          ctx.fillRect(ox, oy, tam, tam);
          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = `rgba(${r2},${g2},${b2},${op[linha]})`;
          ctx.fillRect(ox, oy, tam, tam);
        }
      }
      offsetY += 4 * tam;
    });

    ctx.globalCompositeOperation = "source-over";

    cores.forEach(cor => {
      let r = parseInt(cor.substr(1, 2), 16), g = parseInt(cor.substr(3, 2), 16), b = parseInt(cor.substr(5, 2), 16);
      for (let coluna = 0; coluna < 4; coluna++) {
        ctx.fillStyle = `rgba(${r},${g},${b},${op[coluna]})`;
        ctx.fillRect(coluna * tam, offsetY, tam, tam);
      }
      offsetY += tam;
    });

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, offsetY, canvas.width, tam);

    // cria um canvas desfocado pra exportar
    let canvasBlur = document.createElement("canvas");
    canvasBlur.width = canvas.width;
    canvasBlur.height = canvas.height;
    let ctxBlur = canvasBlur.getContext("2d");
    ctxBlur.filter = "blur(20px)";
    ctxBlur.drawImage(canvas, 0, 0);

    let link = document.createElement("a");
    link.download = "paleta-blend.png";
    link.href = canvasBlur.toDataURL("image/png");
    link.click();
    return;
  } else {
    let tam = modo === "1px" ? 1 : 50;
    canvas.width = 4 * tam;
    canvas.height = totalLinhas * tam;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let offsetY = 0;

    combos.forEach(([c1, c2]) => {
      let r1 = parseInt(c1.substr(1, 2), 16), g1 = parseInt(c1.substr(3, 2), 16), b1 = parseInt(c1.substr(5, 2), 16);
      let r2 = parseInt(c2.substr(1, 2), 16), g2 = parseInt(c2.substr(3, 2), 16), b2 = parseInt(c2.substr(5, 2), 16);
      for (let linha = 0; linha < 4; linha++) {
        for (let coluna = 0; coluna < 4; coluna++) {
          let ox = coluna * tam;
          let oy = offsetY + linha * tam;
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = `rgba(${r1},${g1},${b1},${op[coluna]})`;
          ctx.fillRect(ox, oy, tam, tam);
          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = `rgba(${r2},${g2},${b2},${op[linha]})`;
          ctx.fillRect(ox, oy, tam, tam);
        }
      }
      offsetY += 4 * tam;
    });

    ctx.globalCompositeOperation = "source-over";

    cores.forEach(cor => {
      let r = parseInt(cor.substr(1, 2), 16), g = parseInt(cor.substr(3, 2), 16), b = parseInt(cor.substr(5, 2), 16);
      for (let coluna = 0; coluna < 4; coluna++) {
        ctx.fillStyle = `rgba(${r},${g},${b},${op[coluna]})`;
        ctx.fillRect(coluna * tam, offsetY, tam, tam);
      }
      offsetY += tam;
    });

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, offsetY, canvas.width, tam);
  }

  let link = document.createElement("a");
  link.download = `paleta-${modo}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
