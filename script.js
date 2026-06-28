let combinacoes = [];

function adicionarCor() {
  let box = document.createElement("div");
  box.className = "corBox";
  box.innerHTML = `
    <input type="color" value="#ffffff">
    <input type="text" value="#FFFFFF" maxlength="7">
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
    if (!color || !hex || color.id === "corFundo") return;

    if (!hex.value.startsWith("#")) {
      hex.value = "#" + hex.value.replace("#", "");
    }

    color.oninput = function () {
      hex.value = color.value.toUpperCase();
    }

    hex.oninput = function () {
      let valor = "#" + hex.value.replace(/#/g, "");
      valor = valor.substring(0, 7).toUpperCase();
      hex.value = valor;
      if (/^#[0-9A-F]{6}$/i.test(valor)) {
        color.value = valor;
      }
    }

    hex.onpaste = function (e) {
      e.preventDefault();
      let texto = e.clipboardData.getData("text").replace(/#/g, "");
      hex.value = "#" + texto.substring(0, 6).toUpperCase();
      if (/^#[0-9A-F]{6}$/i.test(hex.value)) {
        color.value = hex.value;
      }
    }
  });
}

sincronizarCores();

function sincronizarFundo() {
  let color = document.getElementById("corFundo");
  let hex = document.getElementById("hexFundo");

  function aplicarFundo(valor) {
    document.querySelectorAll(".bloco").forEach(b => b.style.background = valor);
    criarImagem();
  }

  color.oninput = function () {
    hex.value = color.value.toUpperCase();
    aplicarFundo(color.value);
  }

  hex.oninput = function () {
    let valor = "#" + hex.value.replace(/#/g, "");
    valor = valor.substring(0, 7).toUpperCase();
    hex.value = valor;
    if (/^#[0-9A-F]{6}$/i.test(valor)) {
      color.value = valor;
      aplicarFundo(valor);
    }
  }

  hex.onpaste = function (e) {
    e.preventDefault();
    let texto = e.clipboardData.getData("text").replace(/#/g, "");
    hex.value = "#" + texto.substring(0, 6).toUpperCase();
    if (/^#[0-9A-F]{6}$/i.test(hex.value)) {
      color.value = hex.value;
      aplicarFundo(hex.value);
    }
  }
}

sincronizarFundo();

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

function renderizarBlocoOffscreen(c1, c2, fundo) {
  let tam = 50;
  let cv = document.createElement("canvas");
  cv.width = 5 * tam;
  cv.height = 5 * tam;
  let cx = cv.getContext("2d");

  let r1 = parseInt(c1.substr(1,2),16), g1 = parseInt(c1.substr(3,2),16), b1 = parseInt(c1.substr(5,2),16);
  let r2 = parseInt(c2.substr(1,2),16), g2 = parseInt(c2.substr(3,2),16), b2 = parseInt(c2.substr(5,2),16);
  let op = [1, .75, .5, .25, 0];

  cx.fillStyle = fundo;
  cx.fillRect(0, 0, cv.width, cv.height);

  for (let linha = 0; linha < 5; linha++) {
    for (let coluna = 0; coluna < 5; coluna++) {
      cx.globalCompositeOperation = "source-over";
      cx.fillStyle = `rgba(${r1},${g1},${b1},${op[coluna]})`;
      cx.fillRect(coluna * tam, linha * tam, tam, tam);
    }
  }

  cx.save();
  cx.translate(cv.width / 2, cv.height / 2);
  cx.rotate(Math.PI / 2);
  cx.translate(-cv.width / 2, -cv.height / 2);
  cx.globalCompositeOperation = "multiply";
  for (let linha = 0; linha < 5; linha++) {
    for (let coluna = 0; coluna < 5; coluna++) {
      cx.fillStyle = `rgba(${r2},${g2},${b2},${op[coluna]})`;
      cx.fillRect(coluna * tam, linha * tam, tam, tam);
    }
  }
  cx.restore();

  return cx.getImageData(0, 0, cv.width, cv.height);
}

function pixelDaImagem(imageData, coluna, linha, tam) {
  let x = coluna * tam + Math.floor(tam / 2);
  let y = linha * tam + Math.floor(tam / 2);
  let idx = (y * imageData.width + x) * 4;
  return [imageData.data[idx], imageData.data[idx+1], imageData.data[idx+2]];
}

function gerar() {
  let cores = [];
  document.querySelectorAll(".corBox input[type=color]").forEach(c => {
    if (c.id !== "corFundo") cores.push(c.value);
  });

  let fundo = document.getElementById("corFundo").value;
  let area = document.getElementById("paletas");
  area.innerHTML = "";
  combinacoes = [];

  for (let i = 0; i < cores.length; i++) {
    for (let j = i + 1; j < cores.length; j++) {
      let bloco = document.createElement("div");
      bloco.className = "bloco";
      bloco.style.background = fundo;
      bloco.appendChild(criarGrade(cores[i], "cam1"));
      bloco.appendChild(criarGrade(cores[j], "cam2"));
      area.appendChild(bloco);
      combinacoes.push([cores[i], cores[j]]);
    }
  }

  criarImagem();
}

function criarImagem() {
  let canvas = document.getElementById("canvasPaleta");
  let ctx = canvas.getContext("2d");

  let cores = [];
  document.querySelectorAll(".corBox input[type=color]").forEach(c => {
    if (c.id !== "corFundo") cores.push(c.value);
  });

  let fundo = document.getElementById("corFundo").value;
  let tam = 50;

  let combos = [];
  for (let i = 0; i < cores.length; i++)
    for (let j = i + 1; j < cores.length; j++)
      combos.push([cores[i], cores[j]]);

  let duasCores = cores.length === 2;
  let grade = duasCores ? 5 : 4;

  canvas.width = grade * tam;
  canvas.height = duasCores
    ? grade * tam
    : (combos.length * 4 + cores.length) * tam;

  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let offsetY = 0;

  combos.forEach(([c1, c2]) => {
    let imageData = renderizarBlocoOffscreen(c1, c2, fundo);
    for (let linha = 0; linha < grade; linha++) {
      for (let coluna = 0; coluna < grade; coluna++) {
        let [r, g, b] = pixelDaImagem(imageData, coluna, linha, tam);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(coluna * tam, offsetY + linha * tam, tam, tam);
      }
    }
    offsetY += grade * tam;
  });

  if (!duasCores) {
    cores.forEach(cor => {
      let combo = combos.find(([c1]) => c1 === cor);
      if (!combo) combo = combos.find(([c1, c2]) => c2 === cor);
      if (!combo) return;
      let imageData = renderizarBlocoOffscreen(combo[0], combo[1], fundo);
      let isC1 = combo[0] === cor;
      for (let coluna = 0; coluna < 4; coluna++) {
        let r, g, b;
        if (isC1) {
          [r, g, b] = pixelDaImagem(imageData, coluna, 4, tam);
        } else {
          [r, g, b] = pixelDaImagem(imageData, 4, coluna, tam);
        }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(coluna * tam, offsetY, tam, tam);
      }
      offsetY += tam;
    });
  }
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
  document.querySelectorAll(".corBox input[type=color]").forEach(c => {
    if (c.id !== "corFundo") cores.push(c.value);
  });

  let fundo = document.getElementById("corFundo").value;

  let combos = [];
  for (let i = 0; i < cores.length; i++)
    for (let j = i + 1; j < cores.length; j++)
      combos.push([cores[i], cores[j]]);

  let duasCores = cores.length === 2;
  let grade = duasCores ? 5 : 4;
  let totalLinhas = duasCores ? 5 : combos.length * 4 + cores.length;

  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let tam = modo === "1px" ? 1 : 50;
  let tamOffscreen = 50;

  canvas.width = grade * tam;
  canvas.height = totalLinhas * tam;

  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let offsetY = 0;

  combos.forEach(([c1, c2]) => {
    let imageData = renderizarBlocoOffscreen(c1, c2, fundo);
    for (let linha = 0; linha < grade; linha++) {
      for (let coluna = 0; coluna < grade; coluna++) {
        let [r, g, b] = pixelDaImagem(imageData, coluna, linha, tamOffscreen);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(coluna * tam, offsetY + linha * tam, tam, tam);
      }
    }
    offsetY += grade * tam;
  });

  if (!duasCores) {
    cores.forEach(cor => {
      let combo = combos.find(([c1]) => c1 === cor);
      if (!combo) combo = combos.find(([c1, c2]) => c2 === cor);
      if (!combo) return;
      let imageData = renderizarBlocoOffscreen(combo[0], combo[1], fundo);
      let isC1 = combo[0] === cor;
      for (let coluna = 0; coluna < 4; coluna++) {
        let r, g, b;
        if (isC1) {
          [r, g, b] = pixelDaImagem(imageData, coluna, 4, tamOffscreen);
        } else {
          [r, g, b] = pixelDaImagem(imageData, 4, coluna, tamOffscreen);
        }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(coluna * tam, offsetY, tam, tam);
      }
      offsetY += tam;
    });
  }

  if (modo === "blend") {
    let canvasBlur = document.createElement("canvas");
    canvasBlur.width = canvas.width;
    canvasBlur.height = canvas.height;
    let ctxBlur = canvasBlur.getContext("2d");
    ctxBlur.filter = "blur(15px)";
    ctxBlur.drawImage(canvas, 0, 0);
    let link = document.createElement("a");
    link.download = "paleta-blend.png";
    link.href = canvasBlur.toDataURL("image/png");
    link.click();
    return;
  }

  let link = document.createElement("a");
  link.download = `paleta-${modo}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
