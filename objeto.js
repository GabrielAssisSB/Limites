let ggb;

// =========================
// INIT GEOGEBRA
// =========================
window.addEventListener("load", () => {

  const params = {

    appName: "graphing",

    width: window.innerWidth,
    height: window.innerHeight,

    // DESABILITADOS
    showToolBar: false,
    showZoomButtons: false,

    showAlgebraInput: true,
    showMenuBar: false,

    appletOnLoad(api) {

      ggb = api;
    }
  };

  const applet =
    new GGBApplet(params, true);

  applet.inject("ggb-element");
});

// =========================
// FIX MOBILE KEYBOARD
// =========================
window.addEventListener("resize", () => {

  document.body.style.height =
    window.innerHeight + "px";

  if (!ggb) return;

  ggb.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

// evita scroll automático
document.addEventListener("focusin", () => {

  setTimeout(() => {

    window.scrollTo(0, 0);

  }, 50);
});

// =========================
// FORMATAR
// =========================
function format(n) {

  if (!isFinite(n)) {

    if (n > 0) return "+infinito";

    return "-infinito";
  }

  let v =
    Math.round(n * 1000) / 1000;

  if (Number.isInteger(v)) {

    return v;
  }

  return v
    .toString()
    .replace(".", ",");
}

// =========================
// DRAG MOBILE + PC
// =========================
function tornarArrastavel(el) {

  let dragging = false;

  let offsetX = 0;
  let offsetY = 0;

  // =========================
  // DESKTOP
  // =========================
  el.addEventListener(
    "mousedown",
    iniciarMouse
  );

  document.addEventListener(
    "mousemove",
    moverMouse
  );

  document.addEventListener(
    "mouseup",
    pararDrag
  );

  function iniciarMouse(e) {

    dragging = true;

    const rect =
      el.getBoundingClientRect();

    offsetX =
      e.clientX - rect.left;

    offsetY =
      e.clientY - rect.top;
  }

  function moverMouse(e) {

    if (!dragging) return;

    moverElemento(
      e.clientX,
      e.clientY
    );
  }

  // =========================
  // MOBILE
  // =========================
  el.addEventListener(
    "touchstart",
    iniciarTouch,
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    moverTouch,
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    pararDrag
  );

  function iniciarTouch(e) {

    dragging = true;

    const touch =
      e.touches[0];

    const rect =
      el.getBoundingClientRect();

    offsetX =
      touch.clientX - rect.left;

    offsetY =
      touch.clientY - rect.top;

    e.preventDefault();
  }

  function moverTouch(e) {

    if (!dragging) return;

    const touch =
      e.touches[0];

    moverElemento(
      touch.clientX,
      touch.clientY
    );

    e.preventDefault();
  }

  // =========================
  // MOVER ELEMENTO
  // =========================
  function moverElemento(x, y) {

    el.style.left =
      (x - offsetX) + "px";

    el.style.top =
      (y - offsetY) + "px";

    el.style.right = "auto";
    el.style.bottom = "auto";
  }

  // =========================
  // PARAR
  // =========================
  function pararDrag() {

    dragging = false;
  }
}

// =========================
// ATIVAR DRAG
// =========================
window.addEventListener("load", () => {

  tornarArrastavel(
    document.getElementById("atividadeBox")
  );

  tornarArrastavel(
    document.getElementById("limiteBox")
  );

  tornarArrastavel(
    document.getElementById("aproximacaoBox")
  );
});

// =========================
// ELEMENTOS
// =========================
const input =
  document.getElementById("limiteInput");

const btnLimite =
  document.getElementById("btnLimite");

const btnMais =
  document.getElementById("maisX");

const btnMenos =
  document.getElementById("menosX");

// =========================
// BOTÕES ↑ ↓
// =========================
btnMais.onclick = () => {

  let v =
    parseFloat(input.value);

  if (!isFinite(v)) {

    v = 0;
  }

  v++;

  input.value = v;

  atualizarTudo();
};

btnMenos.onclick = () => {

  let v =
    parseFloat(input.value);

  if (!isFinite(v)) {

    v = 0;
  }

  v--;

  input.value = v;

  atualizarTudo();
};

// =========================
// INPUT MANUAL
// =========================
input.addEventListener(
  "input",
  () => {

    atualizarTudo();
  }
);

// =========================
// ATUALIZAR TUDO
// =========================
function atualizarTudo() {

  const raw =
    input.value
    .trim()
    .toLowerCase();

  let a;

  if (raw === "infinito") {

    a = Infinity;
  }

  else if (
    raw === "-infinito"
  ) {

    a = -Infinity;
  }

  else {

    a = parseFloat(raw);

    if (!isFinite(a)) {

      return;
    }
  }

  atualizarPonto(a);

  atualizarTabela(a);
}

// =========================
// PONTO AMARELO
// =========================
function atualizarPonto(a) {

  if (!ggb) return;

  try {

    ggb.deleteObject("P_lim");

  } catch {}

  if (
    a === Infinity ||
    a === -Infinity
  ) {

    return;
  }

  ggb.evalCommand(
    `P_lim=(${a},0)`
  );

  ggb.setColor(
    "P_lim",
    255,
    255,
    0
  );

  ggb.setPointSize(
    "P_lim",
    8
  );
}

// =========================
// PEGAR FUNÇÃO
// =========================
function f(x) {

  const nomes =
    ggb.getAllObjectNames();

  for (let n of nomes) {

    try {

      if (
        ggb.getObjectType(n)
        === "function"
      ) {

        const y =
          ggb.getValue(
            `${n}(${x})`
          );

        if (!isNaN(y)) {

          return y;
        }
      }

    } catch {}
  }

  return NaN;
}

// =========================
// TABELA APROXIMAÇÃO
// =========================
function atualizarTabela(a) {

  const esquerda =
    document.getElementById(
      "tabelaEsquerda"
    );

  const direita =
    document.getElementById(
      "tabelaDireita"
    );

  esquerda.innerHTML = "";
  direita.innerHTML = "";

  limparPontos();

  if (
    a === Infinity ||
    a === -Infinity
  ) {

    return;
  }

  // APENAS 2 VALORES
  const passos = [
    0.1,
    0.01
  ];

  passos.forEach((p, i) => {

    // esquerda
    const xe = a - p;
    const ye = f(xe);

    adicionarLinha(
      esquerda,
      xe,
      ye
    );

    criarPonto(
      xe,
      ye,
      i,
      "E"
    );

    // direita
    const xd = a + p;
    const yd = f(xd);

    adicionarLinha(
      direita,
      xd,
      yd
    );

    criarPonto(
      xd,
      yd,
      i,
      "D"
    );
  });
}

// =========================
// LINHAS TABELA
// =========================
function adicionarLinha(
  tabela,
  x,
  y
) {

  tabela.innerHTML += `

    <tr>

      <td>${format(x)}</td>

      <td>${format(y)}</td>

    </tr>

  `;
}

// =========================
// PONTOS
// =========================
function criarPonto(
  x,
  y,
  i,
  lado
) {

  if (!ggb) return;

  const nome =
    `P_${lado}_${i}`;

  ggb.evalCommand(
    `${nome}=(${x},${y})`
  );

  // azul esquerda
  if (lado === "E") {

    ggb.setColor(
      nome,
      0,
      120,
      255
    );
  }

  // vermelho direita
  else {

    ggb.setColor(
      nome,
      255,
      0,
      0
    );
  }

  ggb.setPointSize(
    nome,
    5
  );
}

// =========================
// LIMPAR PONTOS
// =========================
function limparPontos() {

  if (!ggb) return;

  for (let i = 0; i < 5; i++) {

    try {

      ggb.deleteObject(
        `P_E_${i}`
      );

    } catch {}

    try {

      ggb.deleteObject(
        `P_D_${i}`
      );

    } catch {}
  }
}

// =========================
// LIMITES
// =========================
btnLimite.onclick = () => {

  const raw =
    input.value
    .trim()
    .toLowerCase();

  let a;

  if (raw === "infinito") {

    a = Infinity;
  }

  else if (
    raw === "-infinito"
  ) {

    a = -Infinity;
  }

  else {

    a = parseFloat(raw);

    if (!isFinite(a)) {

      alert(
        "Valor inválido"
      );

      return;
    }
  }

  let left;
  let right;

  if (a === Infinity) {

    left = f(1000);
    right = f(10000);
  }

  else if (
    a === -Infinity
  ) {

    left = f(-1000);
    right = f(-10000);
  }

  else {

    left = f(a - 0.001);
    right = f(a + 0.001);
  }

  const existe =

    isFinite(left) &&
    isFinite(right) &&
    Math.abs(left - right)
    < 0.05;

  const limite =

    existe
      ? (left + right) / 2
      : null;

  let resp =
    prompt(
      "Qual é o limite?"
    );

  if (resp === null) return;

  resp =
    resp.trim()
    .toLowerCase();

  let aluno;

  if (
    resp === "infinito" ||
    resp === "+infinito"
  ) {

    aluno = Infinity;
  }

  else if (
    resp === "-infinito"
  ) {

    aluno = -Infinity;
  }

  else {

    aluno =
      parseFloat(
        resp.replace(",", ".")
      );

    if (!isFinite(aluno)) {

      alert(
        "Resposta inválida"
      );

      return;
    }
  }

  if (existe) {

    const correto =

      Math.abs(
        aluno - limite
      ) < 0.05;

    if (correto) {

      alert(

        "✔ Correto!\n\n" +

        "Limite = " +
        format(limite)
      );
    }

    else {

      alert(

        "❌ Errado!\n\n" +

        "Correto: " +
        format(limite)
      );
    }
  }

  else {

    alert(

      "❌ O limite NÃO existe\n\n" +

      "Esquerda = " +
      format(left) +

      "\nDireita = " +
      format(right)
    );
  }
};

// =========================
// CARREGAR ATIVIDADE
// =========================
document
.getElementById(
  "carregarAtividade"
)

.onclick = () => {

  if (!ggb) return;

  const nome =
    document
    .getElementById(
      "atividadeSelect"
    )
    .value;

  if (
    !window.ATIVIDADES ||
    !ATIVIDADES[nome]
  ) {

    alert(
      "Atividade não encontrada"
    );

    return;
  }

  const atv =
    ATIVIDADES[nome];

  try {

    ggb.reset();

  } catch {}

  ggb.evalCommand(
    atv.funcao
  );

  input.value =
    atv.tende;

  atualizarTudo();

  alert(

    "Atividade carregada:\n" +

    atv.nome
  );
};
