let ggb;

// =========================
// INIT
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

  new GGBApplet(params, true)
    .inject("ggb-element");
});

// =========================
// ELEMENTOS
// =========================
const input =
  document.getElementById(
    "limiteInput"
  );

const btnLimite =
  document.getElementById(
    "btnLimite"
  );

const btnContinuidade =
  document.getElementById(
    "btnContinuidade"
  );

const aproxBox =
  document.getElementById(
    "aproximacaoBox"
  );

const epsilonSlider =
  document.getElementById(
    "epsilonSlider"
  );

const epsilonValor =
  document.getElementById(
    "epsilonValor"
  );

let epsilon =
  parseFloat(
    epsilonSlider.value
  );

// =========================
// EPSILON
// =========================
epsilonSlider.oninput = () => {

  epsilon =
    parseFloat(
      epsilonSlider.value
    );

  epsilonValor.textContent =
    epsilon;

  atualizarTudo();
};

// =========================
// FORMATAR
// =========================
function format(n) {

  if (!isFinite(n)) {

    if (n > 0)
      return "+infinito";

    return "-infinito";
  }

  let v =
    Math.round(n * 1000) / 1000;

  if (
    Number.isInteger(v)
  ) {

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
    (e) => {

      dragging = true;

      const rect =
        el.getBoundingClientRect();

      offsetX =
        e.clientX - rect.left;

      offsetY =
        e.clientY - rect.top;
    }
  );

  document.addEventListener(
    "mousemove",
    (e) => {

      if (!dragging)
        return;

      mover(
        e.clientX,
        e.clientY
      );
    }
  );

  document.addEventListener(
    "mouseup",
    () => {

      dragging = false;
    }
  );

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

      if (!dragging)
        return;

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

    el.style.right =
      "auto";

    el.style.bottom =
      "auto";
  }
}

// =========================
// ATIVAR DRAG
// =========================
window.addEventListener(
  "load",
  () => {

    tornarArrastavel(
      document.getElementById(
        "atividadeBox"
      )
    );

    tornarArrastavel(
      document.getElementById(
        "limiteBox"
      )
    );

    tornarArrastavel(
      document.getElementById(
        "continuidadeBox"
      )
    );

    tornarArrastavel(
      document.getElementById(
        "aproximacaoBox"
      )
    );
  }
);

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

        if (!isNaN(y))
          return y;
      }

    } catch {}
  }

  return NaN;
}

// =========================
// PONTO AMARELO
// =========================
function atualizarPonto(a) {

  try {

    ggb.deleteObject(
      "P_lim"
    );

  } catch {}

  if (!isFinite(a))
    return;

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
// PONTOS APROXIMAÇÃO
// =========================
function criarPonto(
  x,
  y,
  nome,
  r,
  g,
  b
) {

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

  for (let i = 0; i < 5; i++) {

    try {

      ggb.deleteObject(
        `P_E_${i}`
      );

      ggb.deleteObject(
        `P_D_${i}`
      );

    } catch {}
  }

  if (!isFinite(a))
    return;

  const passos = [
    epsilon,
    epsilon / 10
  ];

  passos.forEach((p, i) => {

    const xe = a - p;
    const xd = a + p;

    const ye = f(xe);
    const yd = f(xd);

    esquerda.innerHTML += `
      <tr>
        <td>${format(xe)}</td>
        <td>${format(ye)}</td>
      </tr>
    `;

    direita.innerHTML += `
      <tr>
        <td>${format(xd)}</td>
        <td>${format(yd)}</td>
      </tr>
    `;

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

  const left =
    f(a - epsilon/100);

  const right =
    f(a + epsilon/100);

  const existe =

    isFinite(left) &&
    isFinite(right) &&
    Math.abs(
      left - right
    ) < 0.05;

  return {

    esquerda: left,

    direita: right,

    existe,

    valor:
      existe
      ? (left + right)/2
      : null
  };
}

// =========================
// ATUALIZAR
// =========================
function atualizarTudo() {

  const a =
    parseFloat(
      input.value
    );

  if (!isFinite(a))
    return;

  atualizarPonto(a);

  atualizarTabela(a);

  aproxBox.removeAttribute(
    "open"
  );
}

input.addEventListener(
  "input",
  atualizarTudo
);

// =========================
// BOTÕES X
// =========================
document
.getElementById("maisX")
.onclick = () => {

  let v =
    parseFloat(
      input.value
    );

  if (!isFinite(v))
    v = 0;

  v++;

  input.value = v;

  atualizarTudo();
};

document
.getElementById("menosX")
.onclick = () => {

  let v =
    parseFloat(
      input.value
    );

  if (!isFinite(v))
    v = 0;

  v--;

  input.value = v;

  atualizarTudo();
};

// =========================
// LIMITE
// =========================
btnLimite.onclick = () => {

  const a =
    parseFloat(
      input.value
    );

  if (!isFinite(a)) {

    alert(
      "Valor inválido"
    );

    return;
  }

  const lim =
    verificarLimite(a);

  // esquerda
  let esquerda =
    prompt(

      "1° Qual o limite lateral ESQUERDO?"
    );

  if (esquerda === null)
    return;

  esquerda =
    parseFloat(
      esquerda.replace(",", ".")
    );

  // direita
  let direita =
    prompt(

      "2° Qual o limite lateral DIREITO?"
    );

  if (direita === null)
    return;

  direita =
    parseFloat(
      direita.replace(",", ".")
    );

  // existe?
  let existe =
    prompt(

      "3° Existe limite?\n\nDigite:\nsim\nou\nnão"
    );

  if (existe === null)
    return;

  existe =
    existe
    .trim()
    .toLowerCase();

  aproxBox.setAttribute(
    "open",
    true
  );

  let texto = "";

  texto +=
    "Limite lateral ESQUERDO:\n" +

    format(
      lim.esquerda
    ) +

    "\n\n";

  texto +=
    "Limite lateral DIREITO:\n" +

    format(
      lim.direita
    ) +

    "\n\n";

  const corretoEsq =

    Math.abs(
      esquerda - lim.esquerda
    ) < 0.05;

  const corretoDir =

    Math.abs(
      direita - lim.direita
    ) < 0.05;

  const corretoExiste =

    (lim.existe &&
    existe === "sim")

    ||

    (!lim.existe &&
    existe === "não");

  if (
    corretoEsq &&
    corretoDir &&
    corretoExiste
  ) {

    texto +=
      "✔ Tudo correto!";
  }

  else {

    texto +=
      "❌ Existe erro nas respostas.";
  }

  alert(texto);
};

// =========================
// CONTINUIDADE
// =========================
btnContinuidade.onclick = () => {

  const a =
    parseFloat(
      input.value
    );

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

  let respostaImagem =
    prompt(

      "1° Digite a imagem:"
    );

  if (
    respostaImagem === null
  ) return;

  respostaImagem =
    parseFloat(
      respostaImagem
      .replace(",", ".")
    );

  if (
    !isFinite(imagem)
  ) {

    alert(

      "❌ Não existe imagem.\n\nLogo não há continuidade."
    );

    return;
  }

  if (
    Math.abs(
      respostaImagem - imagem
    ) > 0.05
  ) {

    alert(

      "❌ Imagem incorreta.\n\nImagem correta:\n" +

      format(imagem)
    );

    return;
  }

  let respostaLimite =
    prompt(

      "2° Digite o limite:"
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

      "❌ O limite não existe.\n\nLogo não há continuidade."
    );

    return;
  }

  if (
    Math.abs(
      respostaLimite - lim.valor
    ) > 0.05
  ) {

    alert(

      "❌ Limite incorreto.\n\nCorreto:\n" +

      format(lim.valor)
    );

    return;
  }

  let iguais =
    prompt(

      "3° Limite e imagem são iguais?\n\nsim ou não"
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

  if (
    correto &&
    iguais === "sim"
  ) {

    alert(

      "✔ A função é contínua."
    );
  }

  else if (
    !correto &&
    iguais === "não"
  ) {

    alert(

      "✔ A função NÃO é contínua."
    );
  }

  else {

    alert(
      "❌ Resposta incorreta."
    );
  }
};
const imagem =
    f(a);

  // =========================
  // 1° IMAGEM
  // =========================
  let respostaImagem =
    prompt(

      "1° Digite a imagem da função no ponto:"
    );

  if (
    respostaImagem === null
  ) return;

  respostaImagem =
    parseFloat(
      respostaImagem
      .replace(",", ".")
    );

  // não existe imagem
  if (
    !isFinite(imagem)
  ) {

    alert(

      "❌ Não existe imagem nesse ponto.\n\n" +

      "Logo NÃO existe continuidade."
    );

    return;
  }

  // imagem errada
  if (
    Math.abs(
      respostaImagem - imagem
    ) > 0.05
  ) {

    alert(

      "❌ Imagem incorreta.\n\n" +

      "Imagem correta:\n" +

      format(imagem)
    );

    return;
  }

  // =========================
  // 2° LIMITE
  // =========================
  let respostaLimite =
    prompt(

      "2° Digite o valor do limite:"
    );

  if (
    respostaLimite === null
  ) return;

  respostaLimite =
    parseFloat(
      respostaLimite
      .replace(",", ".")
    );

  // limite não existe
  if (
    !lim.existe
  ) {

    alert(

      "❌ O limite NÃO existe.\n\n" +

      "Logo NÃO existe continuidade."
    );

    return;
  }

  // limite errado
  if (
    Math.abs(
      respostaLimite - lim.valor
    ) > 0.05
  ) {

    alert(

      "❌ Limite incorreto.\n\n" +

      "Limite correto:\n" +

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

  if (
    iguais === null
  ) return;

  iguais =
    iguais
    .trim()
    .toLowerCase();

  const correto =

    Math.abs(
      imagem - lim.valor
    ) < 0.05;

  // correto
  if (
    correto &&
    iguais === "sim"
  ) {

    alert(

      "✔ Correto!\n\n" +

      "A função É contínua nesse ponto."
    );
  }

  // correto dizendo não
  else if (
    !correto &&
    iguais === "não"
  ) {

    alert(

      "✔ Correto!\n\n" +

      "A função NÃO é contínua."
    );
  }

  // errado
  else {

    alert(

      "❌ Resposta incorreta."
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

  // verifica atividades
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

  // limpa geogebra
  try {

    ggb.reset();

  } catch {}

  // carrega função
  ggb.evalCommand(
    atv.funcao
  );

  // valor limite
  input.value =
    atv.tende;

  atualizarTudo();

  alert(

    "Atividade carregada:\n\n" +

    atv.nome
  );
};

// =========================
// INICIALIZA
// =========================
window.addEventListener(
  "load",
  () => {

    atualizarTudo();
  }
);
