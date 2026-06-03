let ggb;

// =========================
// INIT GEOGEBRA
// =========================
window.addEventListener("load", () => {

  const params = {

    appName: "graphing",

    width: window.innerWidth,
    height: window.innerHeight,

    showToolBar: true,
    showZoomButtons: false,

    showAlgebraInput: true,
    showMenuBar: true,

    enableShiftDragZoom: true,

    appletOnLoad(api) {

      ggb = api;

      // NÃO carrega nenhuma função automaticamente
      // O usuário digitará sua própria função no GeoGebra
      
      // Apenas atualiza a tabela se houver um valor no input
      setTimeout(() => {

        if (input.value.trim() !== "") {
          atualizarTudo();
        }

      }, 1000);
    }
  };

  const applet = new GGBApplet(params, true);
  applet.inject("ggb-element");
});

// =========================
// FIX MOBILE
// =========================
window.addEventListener("resize", () => {

  document.body.style.height = window.innerHeight + "px";

  if (!ggb) return;

  ggb.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener("focusin", () => {

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);
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
  epsilonValor.textContent = epsilon;
  atualizarTudo();
};

function format(n) {
  if (!isFinite(n)) {
    if (n > 0) return "+infinito";
    return "-infinito";
  }
  let v = Math.round(n * 1000) / 1000;
  if (Number.isInteger(v)) {
    return v;
  }
  return v.toString().replace(".", ",");
}

// =========================
// DRAG MOBILE + DESKTOP
// =========================
function tornarArrastavel(el) {
  let ativo = false;
  let offsetX = 0;
  let offsetY = 0;
  const ignorar = ["BUTTON", "INPUT", "SELECT", "OPTION", "TEXTAREA", "SUMMARY", "TABLE", "TD", "TR"];

  // MOUSE
  el.addEventListener("mousedown", (e) => {
    if (ignorar.includes(e.target.tagName)) return;
    iniciar(e.clientX, e.clientY);
  });

  document.addEventListener("mousemove", (e) => {
    if (!ativo) return;
    mover(e.clientX, e.clientY);
  });

  document.addEventListener("mouseup", finalizar);

  // TOUCH
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

  function iniciar(x, y) {
    ativo = true;
    const rect = el.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
  }

  function mover(x, y) {
    el.style.left = (x - offsetX) + "px";
    el.style.top = (y - offsetY) + "px";
    el.style.right = "auto";
    el.style.bottom = "auto";
  }

  function finalizar() {
    ativo = false;
  }
}

window.addEventListener("load", () => {
  tornarArrastavel(document.getElementById("atividadeBox"));
  tornarArrastavel(document.getElementById("limiteBox"));
  tornarArrastavel(document.getElementById("continuidadeBox"));
  tornarArrastavel(document.getElementById("aproximacaoBox"));
});

// =========================
// PEGAR FUNÇÃO DO GEOGEBRA
// =========================
function f(x) {
  if (!ggb) return NaN;
  const nomes = ggb.getAllObjectNames();
  for (let n of nomes) {
    try {
      if (ggb.getObjectType(n) === "function") {
        const y = ggb.getValue(`${n}(${x})`);
        if (!isNaN(y)) {
          return y;
        }
      }
    } catch {}
  }
  return NaN;
}

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
  if (!ggb) return;
  try { ggb.deleteObject(nome); } catch {}
  if (!isFinite(x) || !isFinite(y)) return;
  ggb.evalCommand(`${nome}=(${x},${y})`);
  ggb.setColor(nome, r, g, b);
  ggb.setPointSize(nome, 5);
  ggb.setFixed(nome, true, false);
}

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

  const passos = [epsilon, epsilon / 10];

  passos.forEach((p, i) => {
    const xe = a - p;
    const xd = a + p;
    const ye = f(xe);
    const yd = f(xd);

    esquerda.innerHTML += `<tr><td>${format(xe)}</td><td>${format(ye)}</td></tr>`;
    direita.innerHTML += `<tr><td>${format(xd)}</td><td>${format(yd)}</td></tr>`;

    criarPonto(xe, ye, `P_E_${i}`, 0, 120, 255);
    criarPonto(xd, yd, `P_D_${i}`, 255, 0, 0);
  });
}

function verificarLimite(a) {
  const left = f(a - epsilon / 100);
  const right = f(a + epsilon / 100);
  const existe = isFinite(left) && isFinite(right) && Math.abs(left - right) < 0.05;
  return { esquerda: left, direita: right, existe, valor: existe ? (left + right) / 2 : null };
}

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
  v++;
  input.value = v;
  atualizarTudo();
};

btnMenos.onclick = () => {
  let v = parseFloat(input.value);
  if (!isFinite(v)) v = 0;
  v--;
  input.value = v;
  atualizarTudo();
};

btnLimite.onclick = () => {
  const a = parseFloat(input.value);
  if (!isFinite(a)) {
    alert("Valor inválido");
    return;
  }
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
  let texto = "";
  texto += "Limite lateral ESQUERDO:\n" + format(lim.esquerda) + "\n\n";
  texto += "Limite lateral DIREITO:\n" + format(lim.direita) + "\n\n";
  const corretoEsq = Math.abs(esquerda - lim.esquerda) < 0.05;
  const corretoDir = Math.abs(direita - lim.direita) < 0.05;
  const corretoExiste = (lim.existe && existe === "sim") || (!lim.existe && existe === "não");
  if (corretoEsq && corretoDir && corretoExiste) {
    texto += "✔ Tudo correto!";
  } else {
    texto += "❌ Existe erro nas respostas.";
  }
  alert(texto);
};

btnContinuidade.onclick = () => {
  const a = parseFloat(input.value);
  if (!isFinite(a)) {
    alert("Valor inválido");
    return;
  }
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
    alert("❌ Imagem incorreta.\n\nImagem correta:\n" + format(imagem));
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
    alert("❌ Limite incorreto.\n\nLimite correto:\n" + format(lim.valor));
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
  alert("Atividade carregada:\n\n" + atv.nome);
};
