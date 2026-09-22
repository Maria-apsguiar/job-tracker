const API_URL =
  'https://script.google.com/macros/s/AKfycbxxW-c2KDqG-vm7ej5CLZ8d6AHsT4GUxgiCrpwDYLie-9yNkM4NuNqx1FqKSS7A5_6N/exec';


let candidaturas = [];

let filtroAtual = 'todas';

let graficoCandidaturas = null;
let graficoPlataformas = null;
let graficoModalidades = null;
let graficoContratacoes = null;

let salvando = false;


const STATUS_ANDAMENTO = [
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


const STATUS_ENCERRADO = [
  'negado',
  'desisti'
];


const CORES_GRAFICO = [
  '#5B5FEF',
  '#20B486',
  '#F59E0B',
  '#EF5B7A',
  '#38A3DB',
  '#8B5CF6',
  '#F97316',
  '#14B8A6',
  '#EC4899',
  '#64748B'
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


document.addEventListener(
  'DOMContentLoaded',
  () => {

    carregarCandidaturas();

    document
      .getElementById('filtroMes')
      .addEventListener(
        'change',
        desenharGraficoCandidaturas
      );

  }
);


/* API */


async function carregarCandidaturas() {

  try {

    const resposta =
      await fetch(
        API_URL + '?acao=listar'
      );

    const dados =
      await resposta.json();

    if (!dados.sucesso) {
      throw new Error(
        dados.erro ||
        'Erro ao carregar candidaturas.'
      );
    }

    candidaturas =
      Array.isArray(dados.dados)
        ? dados.dados
        : [];

    atualizarDashboard();

    preencherFiltroMes();

    desenharGraficoCandidaturas();

    desenharGraficosAnaliticos();

    renderizarLista();

  } catch (erro) {

    console.error(erro);

    mostrarToast(
      'Não foi possível carregar as candidaturas.'
    );

  }

}


function enviarPost(dados) {

  fetch(
    API_URL,
    {
      method: 'POST',

      mode: 'no-cors',

      headers: {
        'Content-Type':
          'text/plain;charset=utf-8'
      },

      body:
        JSON.stringify(dados)
    }
  ).catch(
    erro =>
      console.error(
        'Erro no POST:',
        erro
      )
  );

}


/* DASHBOARD */


function atualizarDashboard() {

  const total =
    candidaturas.length;


  const andamento =
    candidaturas.filter(
      candidatura =>
        STATUS_ANDAMENTO.includes(
          normalizarTexto(
            candidatura.status_atual
          )
        )
    ).length;


  const aprovadas =
    candidaturas.filter(
      candidatura =>
        STATUS_APROVADO.includes(
          normalizarTexto(
            candidatura.status_atual
          )
        )
    ).length;


  const encerradas =
    candidaturas.filter(
      candidatura => {

        const status =
          normalizarTexto(
            candidatura.status_atual
          );

        const resultado =
          normalizarTexto(
            candidatura.resultado
          );

        return (
          STATUS_ENCERRADO.includes(status) ||
          resultado === 'sem retorno' ||
          resultado === 'encerrado_negativo'
        );

      }
    ).length;


  document
    .getElementById(
      'totalCandidaturas'
    )
    .textContent =
      total;


  document
    .getElementById(
      'totalAndamento'
    )
    .textContent =
      andamento;


  document
    .getElementById(
      'totalEncerradas'
    )
    .textContent =
      encerradas;


  document
    .getElementById(
      'totalAprovadas'
    )
    .textContent =
      aprovadas;

}


/* GRÁFICO MENSAL */


function preencherFiltroMes() {

  const select =
    document.getElementById(
      'filtroMes'
    );

  const meses =
    new Set();


  candidaturas.forEach(
    candidatura => {

      const data =
        converterData(
          candidatura.data_candidatura
        );

      if (!data) {
        return;
      }

      const chave =
        data.getFullYear() +
        '-' +
        String(
          data.getMonth() + 1
        ).padStart(2, '0');

      meses.add(chave);

    }
  );


  const mesesOrdenados =
    Array.from(meses).sort();


  const valorAtual =
    select.value;


  select.innerHTML = '';


  const opcaoTodos =
    document.createElement(
      'option'
    );

  opcaoTodos.value =
    'todos';

  opcaoTodos.textContent =
    'Mês atual';

  select.appendChild(
    opcaoTodos
  );


  mesesOrdenados.forEach(
    chave => {

      const [ano, mes] =
        chave.split('-');

      const opcao =
        document.createElement(
          'option'
        );

      opcao.value =
        chave;

      opcao.textContent =
        nomeMes(
          Number(mes) - 1
        ) +
        ' ' +
        ano;

      select.appendChild(
        opcao
      );

    }
  );


  if (
    mesesOrdenados.includes(
      valorAtual
    )
  ) {

    select.value =
      valorAtual;

  } else {

    select.value =
      'todos';

  }

}


function desenharGraficoCandidaturas() {

  const canvas =
    document.getElementById(
      'graficoCandidaturas'
    );

  if (!canvas) {
    return;
  }


  const select =
    document.getElementById(
      'filtroMes'
    );


  if (!select) {
    return;
  }


  const filtro =
    select.value;


  let ano;
  let mes;


  if (
    filtro === 'todos'
  ) {

    const hoje =
      new Date();

    ano =
      hoje.getFullYear();

    mes =
      hoje.getMonth();

  } else {

    const partes =
      filtro.split('-');

    ano =
      Number(partes[0]);

    mes =
      Number(partes[1]) - 1;

  }


  const quantidadeDias =
    new Date(
      ano,
      mes + 1,
      0
    ).getDate();


  const contagem =
    {};


  for (
    let dia = 1;
    dia <= quantidadeDias;
    dia++
  ) {

    const chave =
      String(dia).padStart(2, '0');

    contagem[chave] =
      0;

  }


  candidaturas.forEach(
    candidatura => {

      const data =
        converterData(
          candidatura.data_candidatura
        );


      if (!data) {
        return;
      }


      if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes
      ) {

        return;

      }


      const dia =
        String(
          data.getDate()
        ).padStart(2, '0');


      contagem[dia] =
        (contagem[dia] || 0) + 1;

    }
  );


  const labels =
    Array.from(
      {
        length:
          quantidadeDias
      },
      (_, indice) =>
        String(
          indice + 1
        ).padStart(2, '0') +
        '/' +
        String(
          mes + 1
        ).padStart(2, '0')
    );


  const valores =
    Array.from(
      {
        length:
          quantidadeDias
      },
      (_, indice) =>
        contagem[
          String(
            indice + 1
          ).padStart(2, '0')
        ] || 0
    );


  const ctx =
    canvas.getContext('2d');


  if (
    graficoCandidaturas
  ) {

    graficoCandidaturas.destroy();

  }


  graficoCandidaturas =
    new Chart(
      ctx,
      {
        type: 'bar',

        data: {
          labels,

          datasets: [
            {
              label:
                'Candidaturas',

              data:
                valores,

              borderRadius: 6,

              backgroundColor:
                '#5B5FEF',

              hoverBackgroundColor:
                '#4549D9'
            }
          ]
        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              display: false
            },

            tooltip: {

              callbacks: {

                label:
                  context =>
                    ` ${context.raw} candidatura(s)`

              }

            }

          },

          scales: {

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0
              },

              grid: {
                color:
                  '#eef1f5'
              }

            },

            x: {

              grid: {
                display: false
              },

              ticks: {

                autoSkip: true,

                maxTicksLimit: 15

              }

            }

          }

        }

      }
    );

}


/* GRÁFICOS DE ROSCA */


function desenharGraficosAnaliticos() {

  const plataformas =
    contarValores(
      candidaturas,
      'plataforma'
    );

  const modalidades =
    contarValores(
      candidaturas,
      'modalidade'
    );

  const contratacoes =
    contarValores(
      candidaturas,
      'tipo_contratacao'
    );


  graficoPlataformas =
    criarGraficoRosca(
      'graficoPlataformas',
      plataformas,
      'legendaPlataformas',
      graficoPlataformas
    );


  graficoModalidades =
    criarGraficoRosca(
      'graficoModalidades',
      modalidades,
      'legendaModalidades',
      graficoModalidades
    );


  graficoContratacoes =
    criarGraficoRosca(
      'graficoContratacoes',
      contratacoes,
      'legendaContratacoes',
      graficoContratacoes
    );

}


function contarValores(
  lista,
  campo
) {

  const resultado = {};


  lista.forEach(
    item => {

      let valor =
        item[campo];


      if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ''
      ) {

        valor = 'Não informado';

      }


      const chave =
        formatarLabel(
          valor
        );


      resultado[chave] =
        (resultado[chave] || 0) + 1;

    }
  );


  return resultado;

}


function criarGraficoRosca(
  canvasId,
  dados,
  legendaId,
  graficoAnterior
) {

  const canvas =
    document.getElementById(
      canvasId
    );


  const legenda =
    document.getElementById(
      legendaId
    );


  if (!canvas) {
    return null;
  }


  if (
    graficoAnterior
  ) {

    graficoAnterior.destroy();

  }


  const labels =
    Object.keys(
      dados
    );


  const valores =
    Object.values(
      dados
    );


  const cores =
    labels.map(
      (_, indice) =>
        CORES_GRAFICO[
          indice %
          CORES_GRAFICO.length
        ]
    );


  const total =
    valores.reduce(
      (soma, valor) =>
        soma + valor,
      0
    );


  legenda.innerHTML = '';


  labels.forEach(
    (label, indice) => {

      const percentual =
        total === 0
          ? 0
          : (
              valores[indice] /
              total
            ) *
            100;


      const item =
        document.createElement(
          'div'
        );

      item.className =
        'legend-item';


      const dot =
        document.createElement(
          'span'
        );

      dot.className =
        'legend-dot';

      dot.style.backgroundColor =
        cores[indice];


      const labelElement =
        document.createElement(
          'span'
        );

      labelElement.className =
        'legend-label';

      labelElement.textContent =
        label;


      const percentElement =
        document.createElement(
          'span'
        );

      percentElement.className =
        'legend-percent';

      percentElement.textContent =
        percentual.toFixed(0) +
        '%';


      item.appendChild(dot);

      item.appendChild(
        labelElement
      );

      item.appendChild(
        percentElement
      );

      legenda.appendChild(
        item
      );

    }
  );


  const ctx =
    canvas.getContext('2d');


  return new Chart(
    ctx,
    {

      type: 'doughnut',

      data: {

        labels,

        datasets: [
          {
            data: valores,

            backgroundColor:
              cores,

            borderWidth: 2,

            borderColor:
              '#ffffff'
          }
        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '62%',

        plugins: {

          legend: {
            display: false
          },

          tooltip: {

            callbacks: {

              label:
                context => {

                  const valor =
                    context.raw;

                  const percentual =
                    total === 0
                      ? 0
                      : (
                          valor /
                          total
                        ) *
                        100;

                  return (
                    ' ' +
                    context.label +
                    ': ' +
                    valor +
                    ' (' +
                    percentual.toFixed(1) +
                    '%)'
                  );

                }

            }

          }

        }

      }

    }
  );

}


/* LISTA */


function alterarFiltroLista(
  filtro
) {

  filtroAtual =
    filtro;


  document
    .querySelectorAll(
      '.filtro-btn'
    )
    .forEach(
      botao => {

        botao.classList.toggle(
          'active',
          botao.dataset.filtro ===
            filtro
        );

      }
    );


  renderizarLista();

}


function renderizarLista() {

  const container =
    document.getElementById(
      'listaCandidaturas'
    );


  const listaVazia =
    document.getElementById(
      'listaVazia'
    );


  container.innerHTML = '';


  let lista =
    candidaturas;


  if (
    filtroAtual === 'andamento'
  ) {

    lista =
      candidaturas.filter(
        candidatura =>
          STATUS_ANDAMENTO.includes(
            normalizarTexto(
              candidatura.status_atual
            )
          )
      );

  }


  if (
    filtroAtual === 'aprovadas'
  ) {

    lista =
      candidaturas.filter(
        candidatura =>
          STATUS_APROVADO.includes(
            normalizarTexto(
              candidatura.status_atual
            )
          )
      );

  }


  if (
    filtroAtual === 'encerradas'
  ) {

    lista =
      candidaturas.filter(
        candidatura => {

          const status =
            normalizarTexto(
              candidatura.status_atual
            );

          const resultado =
            normalizarTexto(
              candidatura.resultado
            );

          return (
            STATUS_ENCERRADO.includes(status) ||
            resultado === 'sem retorno' ||
            resultado === 'encerrado_negativo'
          );

        }
      );

  }


  if (
    lista.length === 0
  ) {

    listaVazia.style.display =
      'block';

    return;

  }


  listaVazia.style.display =
    'none';


  const listaOrdenada =
    [...lista].sort(
      (a, b) => {

        const dataA =
          converterData(
            a.data_candidatura
          );

        const dataB =
          converterData(
            b.data_candidatura
          );

        return (
          (dataB || 0) -
          (dataA || 0)
        );

      }
    );


  listaOrdenada.forEach(
    candidatura => {

      const row =
        document.createElement(
          'div'
        );

      row.className =
        'candidatura-row';


      const empresa =
        document.createElement(
          'div'
        );

      empresa.className =
        'empresa-cell candidatura-click';

      empresa.innerHTML =
        `<span class="empresa-nome">
          ${escaparHTML(
            candidatura.empresa ||
            '-'
          )}
        </span>`;


      const vaga =
        document.createElement(
          'div'
        );

      vaga.className =
        'vaga-cell candidatura-click';

      vaga.innerHTML =
        `<span class="vaga-nome">
          ${escaparHTML(
            candidatura.vaga ||
            '-'
          )}
        </span>`;


      const contratacao =
        document.createElement(
          'div'
        );

      contratacao.className =
        'tipo-cell candidatura-click';

      contratacao.textContent =
        formatarLabel(
          candidatura.tipo_contratacao
        ) || '-';


      const modalidade =
        document.createElement(
          'div'
        );

      modalidade.className =
        'modalidade-cell candidatura-click';

      modalidade.textContent =
        formatarLabel(
          candidatura.modalidade
        ) || '-';


      const statusCell =
        document.createElement(
          'div'
        );

      statusCell.className =
        'status-cell';


      const select =
        document.createElement(
          'select'
        );

      select.className =
        'status-select';


      STATUS_OPTIONS.forEach(
        status => {

          const option =
            document.createElement(
              'option'
            );

          option.value =
            status;

          option.textContent =
            formatarLabel(
              status
            );

          if (
            normalizarTexto(
              candidatura.status_atual
            ) ===
            normalizarTexto(status)
          ) {

            option.selected =
              true;

          }

          select.appendChild(
            option
          );

        }
      );


      select.addEventListener(
        'click',
        evento =>
          evento.stopPropagation()
      );


      select.addEventListener(
        'change',
        evento => {

          evento.stopPropagation();

          atualizarStatus(
            candidatura,
            select.value
          );

        }
      );


      statusCell.appendChild(
        select
      );


      const data =
        document.createElement(
          'div'
        );

      data.className =
        'data-cell candidatura-click';

      data.textContent =
        formatarData(
          candidatura.data_candidatura
        );


      row.appendChild(
        empresa
      );

      row.appendChild(
        vaga
      );

      row.appendChild(
        contratacao
      );

      row.appendChild(
        modalidade
      );

      row.appendChild(
        statusCell
      );

      row.appendChild(
        data
      );


      [
        empresa,
        vaga,
        contratacao,
        modalidade,
        data
      ].forEach(
        elemento => {

          elemento.addEventListener(
            'click',
            () =>
              abrirDetalhes(
                candidatura
              )
          );

        }
      );


      container.appendChild(
        row
      );

    }
  );

}


/* ATUALIZAÇÃO DE STATUS */


function atualizarStatus(
  candidatura,
  novoStatus
) {

  candidatura.status_atual =
    novoStatus;


  enviarPost({

    acao:
      'atualizar',

    id_candidatura:
      candidatura.id_candidatura,

    status_atual:
      novoStatus,

    observacao_historico:
      'Status atualizado pelo Job Tracker'

  });


  mostrarToast(
    'Status atualizado.'
  );


  atualizarDashboard();

  desenharGraficosAnaliticos();

  renderizarLista();


  setTimeout(
    carregarCandidaturas,
    1200
  );

}


/* MODAL NOVA CANDIDATURA */


function abrirModalNovaCandidatura() {

  const modal =
    document.getElementById(
      'modalCandidatura'
    );


  document
    .getElementById(
      'formCandidatura'
    )
    .reset();


  document
    .getElementById(
      'data_candidatura'
    )
    .value =
      obterDataHoje();


  modal.classList.add(
    'open'
  );

}


function fecharModal() {

  document
    .getElementById(
      'modalCandidatura'
    )
    .classList.remove(
      'open'
    );

}


async function salvarCandidatura(
  evento
) {

  evento.preventDefault();


  if (salvando) {
    return;
  }


  salvando = true;


  const botao =
    document.getElementById(
      'btnSalvar'
    );


  botao.disabled =
    true;

  botao.textContent =
    'Salvando...';


  const dados = {

    acao:
      'criar',

    data_candidatura:
      document.getElementById(
        'data_candidatura'
      ).value,

    empresa:
      document.getElementById(
        'empresa'
      ).value.trim(),

    vaga:
      document.getElementById(
        'vaga'
      ).value.trim(),

    salario_min:
      document.getElementById(
        'salario_min'
      ).value,

    salario_max:
      document.getElementById(
        'salario_max'
      ).value,

    salario_informado:
      document.getElementById(
        'salario_informado'
      ).value.trim(),

    tipo_contratacao:
      document.getElementById(
        'tipo_contratacao'
      ).value,

    modalidade:
      document.getElementById(
        'modalidade'
      ).value,

    localizacao:
      document.getElementById(
        'localizacao'
      ).value.trim(),

    plataforma:
      document.getElementById(
        'plataforma'
      ).value,

    link_vaga:
      document.getElementById(
        'link_vaga'
      ).value.trim(),

    status_atual:
      'candidatura enviada',

    teve_retorno:
      'não',

    resultado:
      'em andamento',

    observacoes:
      document.getElementById(
        'observacoes'
      ).value.trim()

  };


  enviarPost(
    dados
  );


  fecharModal();


  document
    .getElementById(
      'formCandidatura'
    )
    .reset();


  mostrarToast(
    'Candidatura salva com sucesso.'
  );


  salvando =
    false;

  botao.disabled =
    false;

  botao.textContent =
    'Salvar candidatura';


  setTimeout(
    carregarCandidaturas,
    1200
  );

}


/* MODAL DE DETALHES */


function abrirDetalhes(
  candidatura
) {

  document
    .getElementById(
      'detalheTitulo'
    )
    .textContent =
      candidatura.vaga ||
      'Candidatura';


  document
    .getElementById(
      'detalheEmpresa'
    )
    .textContent =
      candidatura.empresa ||
      '';


  const container =
    document.getElementById(
      'conteudoDetalhes'
    );


  container.innerHTML = '';


  adicionarDetalhe(
    container,
    'Empresa',
    candidatura.empresa
  );


  adicionarDetalhe(
    container,
    'Vaga',
    candidatura.vaga
  );


  adicionarDetalhe(
    container,
    'Data da candidatura',
    formatarData(
      candidatura.data_candidatura
    )
  );


  adicionarDetalhe(
    container,
    'Status',
    formatarLabel(
      candidatura.status_atual
    )
  );


  adicionarDetalhe(
    container,
    'Tipo de contratação',
    formatarLabel(
      candidatura.tipo_contratacao
    )
  );


  adicionarDetalhe(
    container,
    'Modalidade',
    formatarLabel(
      candidatura.modalidade
    )
  );


  adicionarDetalhe(
    container,
    'Localização',
    candidatura.localizacao
  );


  adicionarDetalhe(
    container,
    'Plataforma',
    formatarLabel(
      candidatura.plataforma
    )
  );


  adicionarDetalhe(
    container,
    'Salário mínimo',
    formatarSalario(
      candidatura.salario_min
    )
  );


  adicionarDetalhe(
    container,
    'Salário máximo',
    formatarSalario(
      candidatura.salario_max
    )
  );


  adicionarDetalhe(
    container,
    'Salário informado',
    candidatura.salario_informado
  );


  adicionarDetalhe(
    container,
    'Teve retorno',
    formatarLabel(
      candidatura.teve_retorno
    )
  );


  adicionarDetalhe(
    container,
    'Resultado',
    formatarLabel(
      candidatura.resultado
    )
  );


  adicionarDetalhe(
    container,
    'Dias em processo',
    candidatura.dias_em_processo
  );


  if (
    candidatura.link_vaga
  ) {

    adicionarDetalheLink(
      container,
      'Link da vaga',
      candidatura.link_vaga
    );

  } else {

    adicionarDetalhe(
      container,
      'Link da vaga',
      'Não informado'
    );

  }


  adicionarDetalhe(
    container,
    'Observações',
    candidatura.observacoes ||
      'Nenhuma observação.',
    true
  );


  document
    .getElementById(
      'modalDetalhes'
    )
    .classList.add(
      'open'
    );

}


function adicionarDetalhe(
  container,
  label,
  valor,
  full = false
) {

  const item =
    document.createElement(
      'div'
    );


  item.className =
    full
      ? 'detalhe-item full'
      : 'detalhe-item';


  item.innerHTML =
    `
      <span class="detalhe-label">
        ${escaparHTML(label)}
      </span>

      <span class="detalhe-valor">
        ${escaparHTML(
          valor === null ||
          valor === undefined ||
          String(valor).trim() === ''
            ? 'Não informado'
            : String(valor)
        )}
      </span>
    `;


  container.appendChild(
    item
  );

}


function adicionarDetalheLink(
  container,
  label,
  url
) {

  const item =
    document.createElement(
      'div'
    );


  item.className =
    'detalhe-item full';


  item.innerHTML =
    `
      <span class="detalhe-label">
        ${escaparHTML(label)}
      </span>

      <span class="detalhe-valor">
        <a
          href="${escaparAtributo(url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir vaga
        </a>
      </span>
    `;


  container.appendChild(
    item
  );

}


function fecharModalDetalhes() {

  document
    .getElementById(
      'modalDetalhes'
    )
    .classList.remove(
      'open'
    );

}


/* FORMATAÇÕES */


function normalizarTexto(
  valor
) {

  return String(
    valor || ''
  )
    .trim()
    .toLowerCase();

}


function formatarLabel(
  valor
) {

  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ''
  ) {

    return '';

  }


  return String(valor)
    .replaceAll(
      '_',
      ' '
    )
    .replace(
      /\b\w/g,
      letra =>
        letra.toUpperCase()
    );

}


function converterData(
  valor
) {

  if (!valor) {
    return null;
  }


  if (
    valor instanceof Date
  ) {

    return valor;

  }


  const texto =
    String(valor).trim();


  const dataISO =
    texto.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );


  if (dataISO) {

    return new Date(
      Number(dataISO[1]),
      Number(dataISO[2]) - 1,
      Number(dataISO[3])
    );

  }


  const data =
    new Date(texto);


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return null;

  }


  return data;

}


function formatarData(
  valor
) {

  const data =
    converterData(
      valor
    );


  if (!data) {
    return '-';
  }


  return (
    String(
      data.getDate()
    ).padStart(2, '0') +
    '/' +
    String(
      data.getMonth() + 1
    ).padStart(2, '0') +
    '/' +
    data.getFullYear()
  );

}


function nomeMes(
  indice
) {

  const meses = [
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


  return meses[indice] || '';

}


function formatarSalario(
  valor
) {

  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ''
  ) {

    return 'Não informado';

  }


  const numero =
    Number(valor);


  if (
    Number.isNaN(numero)
  ) {

    return String(valor);

  }


  return numero.toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  );

}


function obterDataHoje() {

  const hoje =
    new Date();


  return (
    hoje.getFullYear() +
    '-' +
    String(
      hoje.getMonth() + 1
    ).padStart(2, '0') +
    '-' +
    String(
      hoje.getDate()
    ).padStart(2, '0')
  );

}


/* SEGURANÇA / UTILITÁRIOS */


function escaparHTML(
  valor
) {

  return String(
    valor ?? ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    );

}


function escaparAtributo(
  valor
) {

  return escaparHTML(
    valor
  );

}


function mostrarToast(
  mensagem
) {

  const toast =
    document.getElementById(
      'toast'
    );


  toast.textContent =
    mensagem;


  toast.classList.add(
    'show'
  );


  clearTimeout(
    window.toastTimeout
  );


  window.toastTimeout =
    setTimeout(
      () => {

        toast.classList.remove(
          'show'
        );

      },
      2500
    );

}
