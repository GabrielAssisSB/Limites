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

  // DESKTOP
  el.addEventListener("mousedown", (e) => {

    dragging = true;

    const rect =
      el.getBoundingClientRect();

    offsetX =
      e.clientX - rect.left;

    offsetY =
      e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {

    if (!dragging) return;

    mover(
      e.clientX,
      e.clientY
    );
  });

  document.addEventListener("mouseup", () => {

    dragging = false;
  });

  // MOBILE
  el.addEventListener(
    "touchstart",
    (e) => {

      dragging = true;

      const touch =
        e.touches[0];

      const rect =
        el.getBoundingClientRect();

      offsetX =
        touch.clientX - rect.left;

      offsetY =
        touch.clientY - rect.top;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {

      if (!dragging) return;

      const touch =
        e.touches[0];

      mover(
        touch.clientX,
        touch.clientY
      );
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    () => {

      dragging = false;
    }
  );

  function mover(x, y) {

    el.style.left =
      (x - offsetX) + "px";

    el.style.top =
      (y - offsetY) + "px";

    el.style.right = "auto";

    el.style.bottom = "auto";
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

// =========================
// ESCONDER APROXIMAÇÃO
// =========================
aproxBox.removeAttribute("open");

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
// CRIAR PONTOS VISUAIS
// =========================
function criarPonto(
  x,
  y,
  nome,
  r,
  g,
  b
) {

  if (!ggb) return;

  try {

    ggb.deleteObject(nome);

  } catch {}

  if (
    !isFinite(x) ||
    !isFinite(y)
  ) {

    return;
  }

  ggb.evalCommand(
    `${nome}=(${x},${y})`
  );

  ggb.setColor(
    nome,
    r,
    g,
    b
  );

  ggb.setPointSize(
    nome,
    5
  );

  ggb.setFixed(
    nome,
    true,
    false
  );
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

  // limpa pontos
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

  passos.forEach((p, i) => {

    const xe = a - p;
    const xd = a + p;

    const ye = f(xe);
    const yd = f(xd);

    adicionarLinha(
      esquerda,
      xe,
      ye
    );

    adicionarLinha(
      direita,
      xd,
      yd
    );

    criarPonto(
      xe,
      ye,
      `P_E_${i}`,
      0,
      120,
      255
    );

    criarPonto(
      xd,
      yd,
      `P_D_${i}`,
      255,
      0,
      0
    );
  });
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

    alert(
      "Valor inválido"
    );

    return;
  }

  const lim =
    verificarLimite(a);

  const imagem =
    f(a);

  // =========================
  // 1° IMAGEM
  // =========================
  let respostaImagem =
    prompt(

      "1° A imagem existe no ponto?\n\n" +

      "Digite o valor da imagem."
    );

  if (
    respostaImagem === null
  ) return;

  respostaImagem =
    parseFloat(
      respostaImagem
      .replace(",", ".")
    );

  const imagemExiste =
    isFinite(imagem);

  if (!imagemExiste) {

    alert(

      "❌ ERRADO\n\n" +

      "A função NÃO possui imagem nesse ponto.\n\n" +

      "Logo NÃO existe continuidade."
    );

    return;
  }

  if (
    Math.abs(
      respostaImagem - imagem
    ) > 0.05
  ) {

    alert(

      "❌ ERRADO\n\n" +

      "A imagem correta era:\n" +

      format(imagem)
    );

    return;
  }

  // =========================
  // 2° LIMITE
  // =========================
  let respostaLimite =
    prompt(

      "2° O limite existe?\n\n" +

      "Digite o valor do limite."
    );

  if (
    respostaLimite === null
  ) return;

  respostaLimite =
    parseFloat(
      respostaLimite
      .replace(",", ".")
    );

  if (!lim.existe) {

    alert(

      "❌ ERRADO\n\n" +

      "O limite NÃO existe.\n\n" +

      "Logo NÃO existe continuidade."
    );

    return;
  }

  if (
    Math.abs(
      respostaLimite - lim.valor
    ) > 0.05
  ) {

    alert(

      "❌ ERRADO\n\n" +

      "O limite correto era:\n" +

      format(lim.valor)
    );

    return;
  }

  // =========================
  // 3° IGUAIS?
  // =========================
  let iguais =
    prompt(

      "3° O limite e a imagem são iguais?\n\n" +

      "Digite:\n" +

      "sim\n" +

      "ou\n" +

      "não"
    );

  if (iguais === null)
    return;

  iguais =
    iguais
    .trim()
    .toLowerCase();

  const correto =

    Math.abs(
      imagem - lim.valor
    ) < 0.05;

  const alunoDisseSim =

    iguais === "sim";

  if (
    correto &&
    alunoDisseSim
  ) {

    alert(

      "✔ CORRETO!\n\n" +

      "A função é contínua nesse ponto."
    );
  }

  else if (
    !correto &&
    iguais === "não"
  ) {

    alert(

      "✔ CORRETO!\n\n" +

      "A função NÃO é contínua."
    );
  }

  else {

    alert(
      "❌ ERRADO"
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
