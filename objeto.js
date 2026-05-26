let ggb;

// =========================
// INIT GEOGEBRA
// =========================
window.addEventListener("load", () => {
  const params = {
    appName: "graphing",
    width: window.innerWidth,
    height: window.innerHeight,
    showToolBar: false,
    showZoomButtons: false,
    showAlgebraInput: true,
    showMenuBar: false,
    enableShiftDragZoom: true,
    appletOnLoad(api) {
      ggb = api;
      setTimeout(() => atualizarTudo(), 500);
    }
  };
  new GGBApplet(params, true).inject("ggb-element");
});

// =========================
// RESIZE
// =========================
window.addEventListener("resize", () => {
  document.body.style.height = window.innerHeight + "px";
  if (ggb) ggb.setSize(window.innerWidth, window.innerHeight);
});

// =========================
// ELEMENTOS
// =========================
const input = document.getElementById("limiteInput");
const btnLimite = document.getElementById("btnLimite");
const btnContinuidade = document.getElementById("btnContinuidade");
const aproxBox = document.getElementById("aproximacaoBox");
const epsilonSlider = document.getElementById("epsilonSlider");
const epsilonValor = document.getElementById("epsilonValor");
const btnMais = document.getElementById("maisX");
const btnMenos = document.getElementById("menosX");

let epsilon = parseFloat(epsilonSlider.value);

epsilonSlider.oninput = () => {
  epsilon = parseFloat(epsilonSlider.value);
  epsilonValor.textContent = epsilon.toFixed(3);
  atualizarTudo();
};

// =========================
// FORMATAR
// =========================
function format(n) {
  if (!isFinite(n)) return n > 0 ? "+∞" : "-∞";
  let v = Math.round(n * 1000) / 1000;
  return Number.isInteger(v) ? v : v.toString().replace(".", ",");
}

// =========================
// DRAG (MOBILE + DESKTOP)
// =========================
function tornarArrastavel(el) {
  let ativo = false, offsetX = 0, offsetY = 0;
  const ignorar = ["BUTTON", "INPUT", "SELECT", "OPTION", "TEXTAREA", "SUMMARY", "TABLE", "TD", "TR", "TH"];
  
  const iniciar = (x, y) => {
    ativo = true;
    const rect = el.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
  };
  
  const mover = (x, y) => {
    el.style.left = (x - offsetX) + "px";
    el.style.top = (y - offsetY) + "px";
    el.style.right = "auto";
    el.style.bottom = "auto";
  };
  
  const finalizar = () => { ativo = false; };
  
  el.addEventListener("mousedown", (e) => {
    if (ignorar.includes(e.target.tagName)) return;
    iniciar(e.clientX, e.clientY);
  });
  document.addEventListener("mousemove", (e) => { if (ativo) mover(e.clientX, e.clientY); });
  document.addEventListener("mouseup", finalizar);
  
  el.addEventListener("touchstart", (e) => {
    if (ignorar.includes(e.target.tagName)) return;
    const touch = e.touches[0];
    iniciar(touch.clientX, touch.clientY);
    e.preventDefault();
  }, { passive: false });
  document.addEventListener("touchmove", (e) => {
    if (!ativo) return;
    const touch = e.touches[0];
    mover(touch.clientX, touch.clientY);
    e.preventDefault();
  }, { passive: false });
  document.addEventListener("touchend", finalizar);
}

window.addEventListener("load", () => {
  tornarArrastavel(document.getElementById("atividadeBox"));
  tornarArrastavel(document.getElementById("limiteBox"));
  tornarArrastavel(document.getElementById("aproximacaoBox"));
});

// =========================
// FUNÇÃO DO GEOGEBRA
// =========================
function f(x) {
  if (!ggb) return NaN;
  const nomes = ggb.getAllObjectNames();
  for (let n of nomes) {
    try {
      if (ggb.getObjectType(n) === "function") {
        const y = ggb.getValue(`${n}(${x})`);
        if (!isNaN(y)) return y;
      }
    } catch {}
  }
  return NaN;
}

// =========================
// PONTO X TENDE
// =========================
function atualizarPonto(a) {
  if (!ggb) return;
  try { ggb.deleteObject("P_lim"); } catch {}
  if (!isFinite(a)) return;
  ggb.evalCommand(`P_lim=(${a},0)`);
  ggb.setColor("P_lim", 255, 255, 0);
  ggb.setPointSize("P_lim", 8);
  ggb.setFixed("P_lim", true, false);
}

function criarPonto(x, y, nome, r, g, b) {
  if (!ggb || !isFinite(x) || !isFinite(y)) return;
  try { ggb.deleteObject(nome); } catch {}
  ggb.evalCommand(`${nome}=(${x},${y})`);
  ggb.setColor(nome, r, g, b);
  ggb.setPointSize(nome, 5);
  ggb.setFixed(nome, true, false);
}

// =========================
// TABELA
// =========================
function atualizarTabela(a) {
  const esquerda = document.getElementById("tabelaEsquerda");
  const direita = document.getElementById("tabelaDireita");
  esquerda.innerHTML = "";
  direita.innerHTML = "";
  
  for (let i = 0; i < 5; i++) {
    try { ggb.deleteObject(`P_E_${i}`); } catch {}
    try { ggb.deleteObject(`P_D_${i}`); } catch {}
  }
  
  if (!isFinite(a)) return;
  
  [epsilon, epsilon / 10].forEach((p, i) => {
    const xe = a - p, xd = a + p;
    const ye = f(xe), yd = f(xd);
    
    esquerda.innerHTML += `<tr><td>${format(xe)}</td><td>${format(ye)}</td></tr>`;
    direita.innerHTML += `<tr><td>${format(xd)}</td><td>${format(yd)}</td></tr>`;
    
    criarPonto(xe, ye, `P_E_${i}`, 0, 120, 255);
    criarPonto(xd, yd, `P_D_${i}`, 255, 0, 0);
  });
}

// =========================
// VERIFICAR LIMITE
// =========================
function verificarLimite(a) {
  const left = f(a - epsilon / 100);
  const right = f(a + epsilon / 100);
  const existe = isFinite(left) && isFinite(right) && Math.abs(left - right) < 0.05;
  return { esquerda: left, direita: right, existe, valor: existe ? (left + right) / 2 : null };
}

// =========================
// ATUALIZAR TUDO
// =========================
function atualizarTudo() {
  if (!ggb) return;
  const raw = input.value.trim().toLowerCase();
  let a;
  if (raw === "infinito") a = Infinity;
  else if (raw === "-infinito") a = -Infinity;
  else a = parseFloat(raw);
  
  if (!isFinite(a)) return;
  atualizarPonto(a);
  atualizarTabela(a);
  aproxBox.removeAttribute("open");
}

input.addEventListener("input", atualizarTudo);

btnMais.onclick = () => {
  let v = parseFloat(input.value);
  if (!isFinite(v)) v = 0;
  input.value = v + 1;
  atualizarTudo();
};

btnMenos.onclick = () => {
  let v = parseFloat(input.value);
  if (!isFinite(v)) v = 0;
  input.value = v - 1;
  atualizarTudo();
};

// =========================
// LIMITE
// =========================
btnLimite.onclick = () => {
  const a = parseFloat(input.value);
  if (!isFinite(a)) { alert("Valor inválido"); return; }
  
  const lim = verificarLimite(a);
  
  let esquerda = prompt("1° Qual o limite lateral ESQUERDO?");
  if (esquerda === null) return;
  esquerda = parseFloat(esquerda.replace(",", "."));
  
  let direita = prompt("2° Qual o limite lateral DIREITO?");
  if (direita === null) return;
  direita = parseFloat(direita.replace(",", "."));
  
  let existe = prompt("3° Existe limite?\n\nDigite:\nsim\nou\nnão");
  if (existe === null) return;
  existe = existe.trim().toLowerCase();
  
  aproxBox.setAttribute("open", true);
  
  let texto = `Limite lateral ESQUERDO:\n${format(lim.esquerda)}\n\nLimite lateral DIREITO:\n${format(lim.direita)}\n\n`;
  
  const corretoEsq = Math.abs(esquerda - lim.esquerda) < 0.05;
  const corretoDir = Math.abs(direita - lim.direita) < 0.05;
  const corretoExiste = (lim.existe && existe === "sim") || (!lim.existe && existe === "não");
  
  texto += (corretoEsq && corretoDir && corretoExiste) ? "✔ Tudo correto!" : "❌ Existe erro nas respostas.";
  alert(texto);
};

// =========================
// CONTINUIDADE
// =========================
btnContinuidade.onclick = () => {
  const a = parseFloat(input.value);
  if (!isFinite(a)) { alert("Valor inválido"); return; }
  
  const lim = verificarLimite(a);
  const imagem = f(a);
  
  let respostaImagem = prompt("1° Digite a imagem da função no ponto:");
  if (respostaImagem === null) return;
  respostaImagem = parseFloat(respostaImagem.replace(",", "."));
  
  if (!isFinite(imagem)) {
    alert("❌ Não existe imagem nesse ponto.\n\nLogo NÃO existe continuidade.");
    return;
  }
  
  if (Math.abs(respostaImagem - imagem) > 0.05) {
    alert(`❌ Imagem incorreta.\n\nImagem correta:\n${format(imagem)}`);
    return;
  }
  
  let respostaLimite = prompt("2° Digite o valor do limite:");
  if (respostaLimite === null) return;
  respostaLimite = parseFloat(respostaLimite.replace(",", "."));
  
  if (!lim.existe) {
    alert("❌ O limite NÃO existe.\n\nLogo NÃO existe continuidade.");
    return;
  }
  
  if (Math.abs(respostaLimite - lim.valor) > 0.05) {
    alert(`❌ Limite incorreto.\n\nLimite correto:\n${format(lim.valor)}`);
    return;
  }
  
  let iguais = prompt("3° O limite e a imagem são iguais?\n\nDigite:\nsim\nou\nnão");
  if (iguais === null) return;
  iguais = iguais.trim().toLowerCase();
  
  const correto = Math.abs(imagem - lim.valor) < 0.05;
  
  if (correto && iguais === "sim") {
    alert("✔ Correto!\n\nA função É contínua nesse ponto.");
  } else if (!correto && iguais === "não") {
    alert("✔ Correto!\n\nA função NÃO é contínua.");
  } else {
    alert("❌ Resposta incorreta.");
  }
};

// =========================
// CARREGAR ATIVIDADE
// =========================
document.getElementById("carregarAtividade").onclick = () => {
  if (!ggb) return;
  const nome = document.getElementById("atividadeSelect").value;
  if (!window.ATIVIDADES || !ATIVIDADES[nome]) {
    alert("Atividade não encontrada");
    return;
  }
  const atv = ATIVIDADES[nome];
  try { ggb.reset(); } catch {}
  ggb.evalCommand(atv.funcao);
  input.value = atv.tende;
  atualizarTudo();
  alert(`Atividade carregada:\n\n${atv.nome}`);
};
