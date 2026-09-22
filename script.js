const API_URL =
  'https://script.google.com/macros/s/AKfycbxxW-c2KDqG-vm7ej5CLZ8d6AHsT4GUxgiCrpwDYLie-9yNkM4NuNqx1FqKSS7A5_6N/exec';


const STATUS_ATIVOS = [

  'candidatura enviada',

  'em análise',

  'entrevista rh',

  'entrevista técnica',

  'teste técnico',

  'entrevista gestor',

  'proposta'

];


const STATUS_APROVADO = [
  'aprovado'
];


const STATUS_ENCERRADOS = [

  'negado',

  'desisti'

];


const STATUS_OPTIONS = [

  'candidatura enviada',

  'em análise',

  'entrevista rh',

  'entrevista técnica',

  'teste técnico',

  'entrevista gestor',

  'proposta',

  'aprovado',

  'negado',

  'desisti'

];


let candidaturas = [];

let salvando = false;

let atualizandoStatus = false;


/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    configurarEventos();

    carregarCandidaturas();

  }
);


/* =========================
   EVENTOS
========================= */

function configurarEventos() {

  document
    .getElementById(
      'btnNovaCandidatura'
    )
    .addEventListener(
      'click',
      abrirModal
    );


  document
    .getElementById(
      'btnFecharModal'
    )
    .addEventListener(
      'click',
      fecharModal
    );


  document
    .getElementById(
      'btnCancelar'
    )
    .addEventListener(
      'click',
      fecharModal
    );


  document
    .getElementById(
      'modalCandidatura'
    )
    .addEventListener(
      'click',
      evento => {

        if (
          evento.target.id ===
          'modalCandidatura'
        ) {

          fecharModal();

        }

      }
    );


  document
    .getElementById(
      'formCandidatura'
    )
    .addEventListener(
      'submit',
      salvarCandidatura
    );


  document
    .getElementById(
      'filtroMes'
    )
    .addEventListener(
      'change',
      desenharGrafico
    );

}


/* =========================
   CARREGAR CANDIDATURAS
========================= */

async function carregarCandidaturas() {

  try {

    const resposta =
      await fetch(
        API_URL +
        '?acao=listar'
      );


    if (!resposta.ok) {

      throw new Error(
        'Erro HTTP ' +
        resposta.status
      );

    }


    const resultado =
      await resposta.json();


    if (
      !resultado.sucesso
    ) {

      throw new Error(
        resultado.erro ||
        'Erro ao carregar dados.'
      );

    }


    candidaturas =
      Array.isArray(
        resultado.dados
      )
        ? resultado.dados
        : [];


    atualizarDashboard();

    atualizarFiltroMes();

    renderizarTodasAsListas();

    desenharGrafico();

  } catch (erro) {

    console.error(
      erro
    );


    mostrarErroGeral(
      'Não foi possível carregar as candidaturas.'
    );

  }

}


/* =========================
   CLASSIFICAÇÃO
========================= */

function estaEmAndamento(
  candidatura
) {

  return STATUS_ATIVOS.includes(
    normalizarStatus(
      candidatura.status_atual
    )
  );

}


function estaAprovada(
  candidatura
) {

  return STATUS_APROVADO.includes(
    normalizarStatus(
      candidatura.status_atual
    )
  ) ||
  candidatura.resultado ===
    'encerrado_positivo';

}


function estaEncerrada(
  candidatura
) {

  const status =
    normalizarStatus(
      candidatura.status_atual
    );


  if (
    estaAprovada(candidatura)
  ) {

    return false;

  }


  if (
    STATUS_ENCERRADOS.includes(
      status
    )
  ) {

    return true;

  }


  if (
    candidatura.resultado ===
    'sem retorno'
  ) {

    return true;

  }


  if (
    candidatura.resultado ===
    'encerrado_negativo'
  ) {

    return true;

  }


  return false;

}


function normalizarStatus(
  status
) {

  return String(
    status || ''
  )
    .trim()
    .toLowerCase();

}


/* =========================
   DASHBOARD
========================= */

function atualizarDashboard() {

  const total =
    candidaturas.length;


  const andamento =
    candidaturas.filter(
      estaEmAndamento
    ).length;


  const aprovadas =
    candidaturas.filter(
      estaAprovada
    ).length;


  const encerradas =
    candidaturas.filter(
      estaEncerrada
    ).length;


  document
    .getElementById(
      'totalCandidaturas'
    )
    .textContent =
      total;


  document
    .getElementById(
      'candidaturasAndamento'
    )
    .textContent =
      andamento;


  document
    .getElementById(
      'candidaturasAprovadas'
    )
    .textContent =
      aprovadas;


  document
    .getElementById(
      'candidaturasEncerradas'
    )
    .textContent =
      encerradas;


  document
    .getElementById(
      'contadorAtivas'
    )
    .textContent =
      andamento;


  document
    .getElementById(
      'contadorAprovadas'
    )
    .textContent =
      aprovadas;


  document
    .getElementById(
      'contadorEncerradas'
    )
    .textContent =
      encerradas;

}


/* =========================
   LISTAS
========================= */

function renderizarTodasAsListas() {

  const ativas =
    candidaturas.filter(
      estaEmAndamento
    );


  const aprovadas =
    candidaturas.filter(
      estaAprovada
    );


  const encerradas =
    candidaturas.filter(
      estaEncerrada
    );


  renderizarLista(
    'listaAtivas',
    ativas,
    'Nenhuma vaga ativa no momento.'
  );


  renderizarLista(
    'listaAprovadas',
    aprovadas,
    'Nenhuma candidatura aprovada ainda.'
  );


  renderizarLista(
    'listaEncerradas',
    encerradas,
    'Nenhuma candidatura encerrada.'
  );

}


function renderizarLista(
  idElemento,
  lista,
  mensagem
) {

  const elemento =
    document.getElementById(
      idElemento
    );


  if (
    lista.length === 0
  ) {

    elemento.innerHTML = `
      <div class="estado-vazio">
        ${mensagem}
      </div>
    `;

    return;

  }


  lista.sort(
    compararDatas
  );


  elemento.innerHTML =
    lista
      .map(
        criarCardCandidatura
      )
      .join('');

}


/* =========================
   CARD
========================= */

function criarCardCandidatura(
  candidatura
) {

  const statusAtual =
    normalizarStatus(
      candidatura.status_atual
    );


  const options =
    STATUS_OPTIONS
      .map(
        status => {

          const selected =
            status ===
            statusAtual
              ? 'selected'
              : '';


          return `
            <option
              value="${escaparHtml(status)}"
              ${selected}
            >
              ${escaparHtml(
                formatarStatus(status)
              )}
            </option>
          `;

        }
      )
      .join('');


  const link =
    candidatura.link_vaga
      ? `
        <a
          class="candidatura-link"
          href="${escaparHtml(
            candidatura.link_vaga
          )}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver vaga ↗
        </a>
      `
      : '';


  const salario =
    formatarSalario(
      candidatura
    );


  return `
    <article
      class="candidatura-card"
      data-id="${escaparHtml(
        candidatura.id_candidatura
      )}"
    >

      <div class="candidatura-topo">

        <div>

          <div class="candidatura-vaga">
            ${escaparHtml(
              candidatura.vaga || '-'
            )}
          </div>

          <div class="candidatura-empresa">
            ${escaparHtml(
              candidatura.empresa || '-'
            )}
          </div>

        </div>


        <select
          class="status-select"
          data-id="${escaparHtml(
            candidatura.id_candidatura
          )}"
          aria-label="Alterar status"
        >

          ${options}

        </select>

      </div>


      <div class="candidatura-info">

        <div class="info-item">

          <span class="info-label">
            Candidatura
          </span>

          <span class="info-value">
            ${formatarData(
              candidatura.data_candidatura
            )}
          </span>

        </div>


        <div class="info-item">

          <span class="info-label">
            Modalidade
          </span>

          <span class="info-value">
            ${escaparHtml(
              candidatura.modalidade || '-'
            )}
          </span>

        </div>


        <div class="info-item">

          <span class="info-label">
            Contratação
          </span>

          <span class="info-value">
            ${escaparHtml(
              candidatura.tipo_contratacao || '-'
            )}
          </span>

        </div>


        <div class="info-item">

          <span class="info-label">
            Plataforma
          </span>

          <span class="info-value">
            ${escaparHtml(
              candidatura.plataforma || '-'
            )}
          </span>

        </div>


        <div class="info-item">

          <span class="info-label">
            Localização
          </span>

          <span class="info-value">
            ${escaparHtml(
              candidatura.localizacao || '-'
            )}
          </span>

        </div>


        <div class="info-item">

          <span class="info-label">
            Salário
          </span>

          <span class="info-value">
            ${escaparHtml(
              salario
            )}
          </span>

        </div>

      </div>


      <div class="candidatura-footer">

        <span class="candidatura-data">
          ${escaparHtml(
            candidatura.id_candidatura || ''
          )}
        </span>

        ${link}

      </div>

    </article>
  `;

  /*
   * O listener do select é adicionado
   * após a renderização dos cards.
   */
}


/* =========================
   LISTENER DOS STATUS
========================= */

document.addEventListener(
  'change',
  evento => {

    if (
      !evento.target.classList.contains(
        'status-select'
      )
    ) {

      return;

    }


    const id =
      evento.target.dataset.id;


    const novoStatus =
      evento.target.value;


    alterarStatus(
      id,
      novoStatus,
      evento.target
    );

  }
);


/* =========================
   ALTERAR STATUS
========================= */

async function alterarStatus(
  id,
  novoStatus,
  select
) {

  if (
    atualizandoStatus
  ) {

    return;

  }


  const candidatura =
    candidaturas.find(
      item =>
        String(
          item.id_candidatura
        ) ===
        String(id)
    );


  if (!candidatura) {

    return;

  }


  const statusAnterior =
    candidatura.status_atual;


  if (
    normalizarStatus(
      statusAnterior
    ) ===
    normalizarStatus(
      novoStatus
    )
  ) {

    return;

  }


  atualizandoStatus = true;

  select.disabled = true;


  try {

    await enviarPostSemAguardarResposta({

      acao:
        'atualizar',

      id_candidatura:
        id,

      status_atual:
        novoStatus,

      observacao_historico:
        'Status alterado pelo frontend'

    });


    candidatura.status_atual =
      novoStatus;


    /*
     * Pequeno intervalo para garantir
     * que o Apps Script processe a gravação
     * antes da nova leitura.
     */
    await esperar(
      1200
    );


    await carregarCandidaturas();


  } catch (erro) {

    console.error(
      erro
    );


    select.value =
      statusAnterior;


    alert(
      'Não foi possível atualizar o status.'
    );

  } finally {

    atualizandoStatus = false;

    select.disabled = false;

  }

}


/* =========================
   NOVA CANDIDATURA
========================= */

async function salvarCandidatura(
  evento
) {

  evento.preventDefault();


  if (
    salvando
  ) {

    return;

  }


  const formulario =
    document.getElementById(
      'formCandidatura'
    );


  const dadosFormulario =
    new FormData(
      formulario
    );


  const dados = {

    acao:
      'criar',

    data_candidatura:
      dadosFormulario.get(
        'data_candidatura'
      ),

    empresa:
      dadosFormulario.get(
        'empresa'
      ),

    vaga:
      dadosFormulario.get(
        'vaga'
      ),

    salario_min:
      dadosFormulario.get(
        'salario_min'
      ),

    salario_max:
      dadosFormulario.get(
        'salario_max'
      ),

    salario_informado:
      dadosFormulario.get(
        'salario_informado'
      ),

    tipo_contratacao:
      dadosFormulario.get(
        'tipo_contratacao'
      ),

    modalidade:
      dadosFormulario.get(
        'modalidade'
      ),

    localizacao:
      dadosFormulario.get(
        'localizacao'
      ),

    plataforma:
      dadosFormulario.get(
        'plataforma'
      ),

    link_vaga:
      dadosFormulario.get(
        'link_vaga'
      ),

    status_atual:
      'candidatura enviada',

    teve_retorno:
      'não',

    resultado:
      'em andamento',

    observacoes:
      dadosFormulario.get(
        'observacoes'
      )

  };


  salvando = true;


  const botaoSalvar =
    document.getElementById(
      'btnSalvar'
    );


  const botaoCancelar =
    document.getElementById(
      'btnCancelar'
    );


  botaoSalvar.disabled = true;

  botaoCancelar.disabled = true;

  botaoSalvar.textContent =
    'Salvando...';


  mostrarMensagemFormulario(
    'Salvando candidatura...'
  );


  try {

    /*
     * Utilizamos no-cors porque o Web App
     * do Apps Script pode manter a requisição
     * aberta por causa do redirecionamento.
     *
     * A gravação já foi validada no backend.
     * Depois do envio, fazemos uma nova leitura
     * da API para atualizar a tela.
     */

    await enviarPostSemAguardarResposta(
      dados
    );


    await esperar(
      1500
    );


    fecharModal();

    formulario.reset();

    esconderMensagemFormulario();


    await carregarCandidaturas();


  } catch (erro) {

    console.error(
      'Erro ao salvar candidatura:',
      erro
    );


    mostrarMensagemFormulario(
      'Não foi possível enviar a candidatura.'
    );


  } finally {

    salvando = false;

    botaoSalvar.disabled = false;

    botaoCancelar.disabled = false;

    botaoSalvar.textContent =
      'Salvar candidatura';

  }

}


/* =========================
   POST
========================= */

function enviarPostSemAguardarResposta(
  dados
) {

  return fetch(
    API_URL,
    {
      method: 'POST',

      mode: 'no-cors',

      headers: {
        'Content-Type':
          'text/plain;charset=utf-8'
      },

      body:
        JSON.stringify(
          dados
        )
    }
  );

}


/* =========================
   FILTRO DE MÊS
========================= */

function atualizarFiltroMes() {

  const select =
    document.getElementById(
      'filtroMes'
    );


  const meses =
    obterMesesDisponiveis();


  const valorAtual =
    select.value;


  select.innerHTML = '';


  if (
    meses.length === 0
  ) {

    const option =
      document.createElement(
        'option'
      );

    option.value = '';

    option.textContent =
      'Nenhum mês disponível';

    select.appendChild(
      option
    );

    return;

  }


  meses.forEach(
    mes => {

      const option =
        document.createElement(
          'option'
        );

      option.value =
        mes.valor;

      option.textContent =
        mes.label;

      select.appendChild(
        option
      );

    }
  );


  if (
    meses.some(
      mes =>
        mes.valor ===
        valorAtual
    )
  ) {

    select.value =
      valorAtual;

  } else {

    select.value =
      meses[0].valor;

  }

}


function obterMesesDisponiveis() {

  const mapa =
    new Map();


  candidaturas.forEach(
    candidatura => {

      const chave =
        obterMesCandidatura(
          candidatura
        );


      if (!chave) {
        return;
      }


      if (
        !mapa.has(chave)
      ) {

        mapa.set(
          chave,
          formatarMes(
            chave
          )
        );

      }

    }
  );


  return Array
    .from(
      mapa.entries()
    )
    .sort(
      (a, b) =>
        b[0].localeCompare(
          a[0]
        )
    )
    .map(
      ([valor, label]) => ({
        valor,
        label
      })
    );

}


/* =========================
   GRÁFICO
========================= */

function desenharGrafico() {

  const canvas =
    document.getElementById(
      'graficoCandidaturas'
    );


  const wrapper =
    canvas.parentElement;


  const largura =
    wrapper.clientWidth;


  const altura =
    wrapper.clientHeight;


  if (
    largura <= 0 ||
    altura <= 0
  ) {

    return;

  }


  const proporcao =
    window.devicePixelRatio || 1;


  canvas.width =
    largura * proporcao;

  canvas.height =
    altura * proporcao;


  const contexto =
    canvas.getContext(
      '2d'
    );


  contexto.scale(
    proporcao,
    proporcao
  );


  contexto.clearRect(
    0,
    0,
    largura,
    altura
  );


  const mesSelecionado =
    document.getElementById(
      'filtroMes'
    ).value;


  if (!mesSelecionado) {

    desenharMensagemGrafico(
      contexto,
      largura,
      altura,
      'Nenhum dado disponível'
    );

    return;

  }


  const ano =
    Number(
      mesSelecionado
        .split('-')[0]
    );


  const mes =
    Number(
      mesSelecionado
        .split('-')[1]
    );


  const diasNoMes =
    new Date(
      ano,
      mes,
      0
    ).getDate();


  const valores =
    Array(
      diasNoMes
    ).fill(0);


  candidaturas.forEach(
    candidatura => {

      const data =
        extrairDataLocal(
          candidatura.data_candidatura
        );


      if (!data) {
        return;
      }


      if (
        data.ano === ano &&
        data.mes === mes
      ) {

        valores[
          data.dia - 1
        ]++;

      }

    }
  );


  const maiorValor =
    Math.max(
      ...valores,
      1
    );


  const margemEsquerda =
    45;

  const margemDireita =
    18;

  const margemTopo =
    20;

  const margemInferior =
    45;


  const areaLargura =
    largura -
    margemEsquerda -
    margemDireita;


  const areaAltura =
    altura -
    margemTopo -
    margemInferior;


  const contexto2 =
    contexto;


  contexto2.font =
    '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';


  contexto2.fillStyle =
    '#6b7280';


  contexto2.strokeStyle =
    '#e5e7eb';


  contexto2.lineWidth =
    1;


  /*
   * Linhas horizontais.
   */

  const linhas =
    4;


  for (
    let i = 0;
    i <= linhas;
    i++
  ) {

    const y =
      margemTopo +
      areaAltura -
      (
        areaAltura *
        i /
        linhas
      );


    contexto2.beginPath();

    contexto2.moveTo(
      margemEsquerda,
      y
    );

    contexto2.lineTo(
      largura -
        margemDireita,
      y
    );

    contexto2.stroke();


    const valor =
      Math.round(
        maiorValor *
        i /
        linhas
      );


    contexto2.fillText(
      String(valor),
      10,
      y + 4
    );

  }


  const larguraColuna =
    areaLargura /
    diasNoMes;


  const larguraBarra =
    Math.max(
      3,
      larguraColuna * 0.58
    );


  valores.forEach(
    (valor, indice) => {

      const alturaBarra =
        valor === 0
          ? 0
          :
          (
            valor /
            maiorValor
          ) *
          areaAltura;


      const x =
        margemEsquerda +
        (
          indice *
          larguraColuna
        ) +
        (
          larguraColuna -
          larguraBarra
        ) / 2;


      const y =
        margemTopo +
        areaAltura -
        alturaBarra;


      if (
        valor > 0
      ) {

        contexto2.fillStyle =
          '#111827';


        contexto2.fillRect(
          x,
          y,
          larguraBarra,
          alturaBarra
        );


        contexto2.fillStyle =
          '#374151';


        contexto2.textAlign =
          'center';


        contexto2.fillText(
          String(valor),
          x +
            larguraBarra / 2,
          y - 6
        );

      }


      /*
       * Mostra os dias sem poluir
       * o gráfico.
       */
      if (
        diasNoMes <= 16 ||
        indice % 2 === 0
      ) {

        contexto2.fillStyle =
          '#9ca3af';


        contexto2.fillText(
          String(
            indice + 1
          ),
          x +
            larguraBarra / 2,
          altura -
            15
        );

      }

    }
  );

}


function desenharMensagemGrafico(
  contexto,
  largura,
  altura,
  mensagem
) {

  contexto.fillStyle =
    '#9ca3af';


  contexto.font =
    '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';


  contexto.textAlign =
    'center';


  contexto.fillText(
    mensagem,
    largura / 2,
    altura / 2
  );

}


/* =========================
   REDIMENSIONAMENTO
========================= */

window.addEventListener(
  'resize',
  () => {

    desenharGrafico();

  }
);


/* =========================
   MODAL
========================= */

function abrirModal() {

  const modal =
    document.getElementById(
      'modalCandidatura'
    );


  modal.classList.remove(
    'hidden'
  );


  const data =
    document.getElementById(
      'data_candidatura'
    );


  if (
    !data.value
  ) {

    const hoje =
      new Date();


    const ano =
      hoje.getFullYear();


    const mes =
      String(
        hoje.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const dia =
      String(
        hoje.getDate()
      ).padStart(
        2,
        '0'
      );


    data.value =
      `${ano}-${mes}-${dia}`;

  }

}


function fecharModal() {

  if (
    salvando
  ) {

    return;

  }


  const modal =
    document.getElementById(
      'modalCandidatura'
    );


  modal.classList.add(
    'hidden'
  );

}


/* =========================
   MENSAGENS
========================= */

function mostrarMensagemFormulario(
  mensagem
) {

  const elemento =
    document.getElementById(
      'mensagemFormulario'
    );


  elemento.textContent =
    mensagem;


  elemento.classList.add(
    'visible'
  );

}


function esconderMensagemFormulario() {

  const elemento =
    document.getElementById(
      'mensagemFormulario'
    );


  elemento.textContent =
    '';


  elemento.classList.remove(
    'visible'
  );

}


function mostrarErroGeral(
  mensagem
) {

  console.error(
    mensagem
  );

}


/* =========================
   FORMATAÇÃO DE DATA
========================= */

function extrairDataLocal(
  valor
) {

  if (!valor) {
    return null;
  }


  const texto =
    String(valor);


  /*
   * Quando a API retorna
   * "2026-09-21T03:00:00.000Z",
   * usamos diretamente a parte
   * YYYY-MM-DD para não sofrer
   * alteração de dia pelo fuso.
   */

  const correspondencia =
    texto.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );


  if (
    correspondencia
  ) {

    return {

      ano:
        Number(
          correspondencia[1]
        ),

      mes:
        Number(
          correspondencia[2]
        ),

      dia:
        Number(
          correspondencia[3]
        )

    };

  }


  const data =
    new Date(
      valor
    );


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return null;

  }


  return {

    ano:
      data.getFullYear(),

    mes:
      data.getMonth() + 1,

    dia:
      data.getDate()

  };

}


function formatarData(
  valor
) {

  const data =
    extrairDataLocal(
      valor
    );


  if (!data) {
    return '-';
  }


  return (
    String(data.dia).padStart(
      2,
      '0'
    ) +
    '/' +
    String(data.mes).padStart(
      2,
      '0'
    ) +
    '/' +
    data.ano
  );

}


function obterMesCandidatura(
  candidatura
) {

  const data =
    extrairDataLocal(
      candidatura.data_candidatura
    );


  if (!data) {
    return null;
  }


  return (
    data.ano +
    '-' +
    String(
      data.mes
    ).padStart(
      2,
      '0'
    )
  );

}


function formatarMes(
  valor
) {

  const partes =
    valor.split('-');


  const ano =
    Number(
      partes[0]
    );


  const mes =
    Number(
      partes[1]
    );


  const nomes =
    [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ];


  return (
    nomes[mes - 1] +
    ' ' +
    ano
  );

}


/* =========================
   FORMATAÇÃO DE STATUS
========================= */

function formatarStatus(
  status
) {

  const mapa = {

    'candidatura enviada':
      'Candidatura enviada',

    'em análise':
      'Em análise',

    'entrevista rh':
      'Entrevista RH',

    'entrevista técnica':
      'Entrevista técnica',

    'teste técnico':
      'Teste técnico',

    'entrevista gestor':
      'Entrevista gestor',

    'proposta':
      'Proposta',

    'aprovado':
      'Aprovado',

    'negado':
      'Negado',

    'desisti':
      'Desisti'

  };


  return (
    mapa[status] ||
    status
  );

}


/* =========================
   SALÁRIO
========================= */

function formatarSalario(
  candidatura
) {

  if (
    candidatura.salario_informado
  ) {

    return String(
      candidatura.salario_informado
    );

  }


  const minimo =
    Number(
      candidatura.salario_min
    );


  const maximo =
    Number(
      candidatura.salario_max
    );


  if (
    minimo &&
    maximo
  ) {

    return (
      formatarMoeda(minimo) +
      ' a ' +
      formatarMoeda(maximo)
    );

  }


  if (
    minimo
  ) {

    return formatarMoeda(
      minimo
    );

  }


  if (
    maximo
  ) {

    return formatarMoeda(
      maximo
    );

  }


  return '-';

}


function formatarMoeda(
  valor
) {

  return Number(
    valor
  ).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }
  );

}


/* =========================
   ORDENAÇÃO
========================= */

function compararDatas(
  a,
  b
) {

  const dataA =
    extrairDataLocal(
      a.data_candidatura
    );


  const dataB =
    extrairDataLocal(
      b.data_candidatura
    );


  if (!dataA) {
    return 1;
  }


  if (!dataB) {
    return -1;
  }


  const valorA =
    Number(
      dataA.ano +
      String(dataA.mes).padStart(
        2,
        '0'
      ) +
      String(dataA.dia).padStart(
        2,
        '0'
      )
    );


  const valorB =
    Number(
      dataB.ano +
      String(dataB.mes).padStart(
        2,
        '0'
      ) +
      String(dataB.dia).padStart(
        2,
        '0'
      )
    );


  return valorB - valorA;

}


/* =========================
   SEGURANÇA
========================= */

function escaparHtml(
  valor
) {

  return String(
    valor ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

}


/* =========================
   UTILITÁRIO
========================= */

function esperar(
  milissegundos
) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milissegundos
      )
  );

}
