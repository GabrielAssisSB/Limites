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

    appletOnLoad(api) {

      ggb = api;
    }
  };

  const applet =
    new GGBApplet(params, true);

  applet.inject("ggb-element");
});

// =========================
// FIX MOBILE
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
// DRAG
// =========================
function tornarArrastavel(el) {

  let dragging = false;

  let offsetX = 0;
  let offsetY = 0;

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

  function moverElemento(x, y) {

    el.style.left =
      (x - offsetX) + "px";

    el.style.top =
      (y - offsetY) + "px";

    el.style.right = "auto";
    el.style.bottom = "auto";
  }

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
    document.getElementById("continuidadeBox")
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

const btnContinuidade =
  document.getElementById("btnContinuidade");

const aproxBox =
  document.getElementById("aproximacaoBox");

const btnMais =
  document.getElementById("maisX");

const btnMenos =
  document.getElementById("menosX");

// começa escondido
aproxBox.removeAttribute("open");

// =========================
// BOTÕES ↑ ↓
// =========================
btnMais.onclick = () => {

  let v =
    parseFloat(input.value);

  if (!isFinite(v)) v = 0;

  v++;

  input.value = v;

  atualizarTudo();
};

btnMenos.onclick = () => {

  let v =
    parseFloat(input.value);

  if (!isFinite(v)) v = 0;

  v--;

  input.value = v;

  atualizarTudo();
};

// =========================
// INPUT
// =========================
input.addEventListener(
  "input",
  atualizarTudo
);

// =========================
// ATUALIZAR
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

    if (!isFinite(a)) return;
  }

  atualizarPonto(a);

  atualizarTabela(a);

  aproxBox.removeAttribute("open");
}

// =========================
// PONTO
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
// TABELA
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

  if (
    a === Infinity ||
    a === -Infinity
  ) {

    return;
  }

  const passos = [
    0.1,
    0.01
  ];

  passos.forEach((p) => {

    const xe = a - p;
    const xd = a + p;

    adicionarLinha(
      esquerda,
      xe,
      f(xe)
    );

    adicionarLinha(
      direita,
      xd,
      f(xd)
    );
  });
}

// =========================
// LINHAS
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
// VERIFICAR LIMITE
// =========================
function verificarLimite(a) {

  let left =
    f(a - 0.001);

  let right =
    f(a + 0.001);

  const existe =

    isFinite(left) &&
    isFinite(right) &&
    Math.abs(left - right)
    < 0.05;

  return {

    existe,

    valor:
      existe
      ? (left + right) / 2
      : null,

    esquerda: left,
    direita: right
  };
}

// =========================
// LIMITE
// =========================
btnLimite.onclick = () => {

  const a =
    parseFloat(input.value);

  if (!isFinite(a)) {

    alert("Valor inválido");

    return;
  }

  const lim =
    verificarLimite(a);

  let resp =
    prompt(
      "Qual é o limite?"
    );

  if (resp === null) return;

  resp =
    parseFloat(
      resp.replace(",", ".")
    );

  // MOSTRA APROXIMAÇÃO
  aproxBox.setAttribute(
    "open",
    true
  );

  if (lim.existe) {

    if (
      Math.abs(
        resp - lim.valor
      ) < 0.05
    ) {

      alert(

        "✔ Correto!\n\n" +

        "Limite = " +
        format(lim.valor)
      );
    }

    else {

      alert(

        "❌ Errado!\n\n" +

        "Correto: " +
        format(lim.valor)
      );
    }
  }

  else {

    alert(

      "❌ O limite NÃO existe\n\n" +

      "Esquerda = " +
      format(lim.esquerda) +

      "\nDireita = " +
      format(lim.direita)
    );
  }
};

// =========================
// CONTINUIDADE
// =========================
btnContinuidade.onclick = () => {

  const a =
    parseFloat(input.value);

  if (!isFinite(a)) {

    alert("Valor inválido");

    return;
  }

  const lim =
    verificarLimite(a);

  const imagem =
    f(a);

  const existeImagem =
    isFinite(imagem);

  const existeLimite =
    lim.existe;

  const iguais =

    existeImagem &&
    existeLimite &&
    Math.abs(
      imagem - lim.valor
    ) < 0.05;

  const continua =

    existeImagem &&
    existeLimite &&
    iguais;

  let texto = "";

  texto +=
    "1° Imagem existe? ";

  texto +=
    existeImagem
    ? "✔ Sim\n"
    : "❌ Não\n";

  texto +=
    "2° Limite existe? ";

  texto +=
    existeLimite
    ? "✔ Sim\n"
    : "❌ Não\n";

  texto +=
    "3° Limite = Imagem? ";

  texto +=
    iguais
    ? "✔ Sim\n\n"
    : "❌ Não\n\n";

  if (continua) {

    texto +=
      "✔ A função é contínua nesse ponto.";
  }

  else {

    texto +=
      "❌ A função NÃO é contínua nesse ponto.";
  }

  alert(texto);
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
