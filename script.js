script.js
const API_URL =
  'https://script.google.com/macros/s/AKfycbxVubVo3fCVQjYBnG5k40vuppIvDzyPS_xDVVvxWAfB3IKuJc_vIcf0ZiDJUvU7FY4t/exec';


/* =========================================================
   ESTADO
========================================================= */

let candidaturas = [];

let visaoAtual = 'ativas';

let salvandoCandidatura = false;

let graficoEvolucao = null;
let graficoStatus = null;
let graficoModalidade = null;
let graficoContratacao = null;


/* =========================================================
   DASHBOARD
========================================================= */

async function carregarDashboard() {

  try {

    const filtroMes =
      document.getElementById('filtroMes');

    const mesSelecionado =
      filtroMes.value || obterMesAtual();


    const resposta =
      await fetch(
        `${API_URL}?dashboard=true&mes=${mesSelecionado}`
      );


    if (!resposta.ok) {
      throw new Error(
        'Erro ao carregar dashboard'
      );
    }


    const dados =
      await resposta.json();


    document.getElementById(
      'totalCandidaturas'
    ).textContent =
      dados.total_candidaturas || 0;


    document.getElementById(
      'emAndamento'
    ).textContent =
      dados.em_andamento || 0;


    document.getElementById(
      'comRetorno'
    ).textContent =
      dados.com_retorno || 0;


    document.getElementById(
      'aprovadas'
    ).textContent =
      dados.aprovadas || 0;


    document.getElementById(
      'ritmoHoje'
    ).textContent =
      dados.ritmo?.hoje || 0;


    document.getElementById(
      'ritmoSemana'
    ).textContent =
      dados.ritmo?.semana || 0;


    document.getElementById(
      'ritmoMes'
    ).textContent =
      dados.ritmo?.mes || 0;


    renderizarGraficoEvolucao(
      dados.evolucao_diaria || []
    );


    renderizarGraficoStatus(
      dados.por_status || {}
    );


    renderizarGraficoModalidade(
      dados.por_modalidade || {}
    );


    renderizarGraficoContratacao(
      dados.por_tipo_contratacao || {}
    );


    renderizarResumoPlataforma(
      dados.por_plataforma || {}
    );


  } catch (erro) {

    console.error(
      'Erro ao carregar dashboard:',
      erro
    );

  }

}


/* =========================================================
   FILTRO DE MÊS
========================================================= */

function obterMesAtual() {

  const hoje =
    new Date();


  return `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, '0')}`;

}


function preencherFiltroMes() {

  const select =
    document.getElementById(
      'filtroMes'
    );


  select.innerHTML = '';


  const hoje =
    new Date();


  for (
    let i = 0;
    i < 12;
    i++
  ) {

    const data =
      new Date(
        hoje.getFullYear(),
        hoje.getMonth() - i,
        1
      );


    const ano =
      data.getFullYear();


    const mes =
      String(
        data.getMonth() + 1
      ).padStart(2, '0');


    const valor =
      `${ano}-${mes}`;


    const opcao =
      document.createElement(
        'option'
      );


    opcao.value =
      valor;


    opcao.textContent =
      formatarMes(valor);


    if (i === 0) {
      opcao.selected = true;
    }


    select.appendChild(
      opcao
    );

  }

}


function formatarMes(valor) {

  const partes =
    valor.split('-');


  if (partes.length !== 2) {
    return valor;
  }


  const data =
    new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      1
    );


  return data
    .toLocaleDateString(
      'pt-BR',
      {
        month: 'long',
        year: 'numeric'
      }
    )
    .replace(
      /^./,
      letra => letra.toUpperCase()
    );

}


/* =========================================================
   GRÁFICO DE EVOLUÇÃO
========================================================= */

function renderizarGraficoEvolucao(
  evolucao
) {

  const canvas =
    document.getElementById(
      'graficoEvolucao'
    );


  if (!canvas) {
    return;
  }


  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }


  graficoEvolucao =
    new Chart(
      canvas,
      {

        type: 'bar',

        data: {

          labels:
            evolucao.map(
              item => item.data
            ),

          datasets: [

            {

              label:
                'Candidaturas',

              data:
                evolucao.map(
                  item =>
                    item.quantidade
                ),

              borderWidth: 1,

              borderRadius: 5

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,


          plugins: {

            legend: {
              display: false
            }

          },


          scales: {

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0
              },

              title: {

                display: true,

                text:
                  'Quantidade'

              }

            },


            x: {

              title: {

                display: true,

                text:
                  'Dia'

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE STATUS
========================================================= */

function renderizarGraficoStatus(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoStatus'
    );


  if (!canvas) {
    return;
  }


  if (graficoStatus) {
    graficoStatus.destroy();
  }


  graficoStatus =
    new Chart(
      canvas,
      {

        type: 'doughnut',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              data:
                Object.values(dados),

              borderWidth: 1

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              position: 'bottom'
            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE MODALIDADE
========================================================= */

function renderizarGraficoModalidade(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoModalidade'
    );


  if (!canvas) {
    return;
  }


  if (graficoModalidade) {
    graficoModalidade.destroy();
  }


  graficoModalidade =
    new Chart(
      canvas,
      {

        type: 'doughnut',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              data:
                Object.values(dados),

              borderWidth: 1

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              position: 'bottom'
            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE CONTRATAÇÃO
========================================================= */

function renderizarGraficoContratacao(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoContratacao'
    );


  if (!canvas) {
    return;
  }


  if (graficoContratacao) {
    graficoContratacao.destroy();
  }


  graficoContratacao =
    new Chart(
      canvas,
      {

        type: 'bar',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              label:
                'Candidaturas',

              data:
                Object.values(dados),

              borderWidth: 1,

              borderRadius: 5

            }

          ]

        },


        options: {

          indexAxis: 'y',

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              display: false
            }

          },


          scales: {

            x: {

              beginAtZero: true,

              ticks: {
                precision: 0
              }

            }

          }

        }

      }
    );

}


/* =========================================================
   PLATAFORMAS
========================================================= */

function renderizarResumoPlataforma(
  dados
) {

  const container =
    document.getElementById(
      'resumoPlataforma'
    );


  if (!container) {
    return;
  }


  container.innerHTML = '';


  const entradas =
    Object.entries(dados);


  if (entradas.length === 0) {

    container.innerHTML =
      '<p>Nenhuma candidatura registrada.</p>';

    return;

  }


  entradas
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .forEach(
      ([plataforma, quantidade]) => {

        const item =
          document.createElement(
            'div'
          );


        item.className =
          'plataforma-item';


        item.innerHTML = `

          <span>
            ${formatarRotulo(plataforma)}
          </span>

          <strong>
            ${quantidade}
          </strong>

        `;


        container.appendChild(
          item
        );

      }
    );

}


/* =========================================================
   CARREGAR CANDIDATURAS
========================================================= */

async function carregarCandidaturas() {

  try {

    const resposta =
      await fetch(
        `${API_URL}?visao=${visaoAtual}`
      );


    if (!resposta.ok) {
      throw new Error(
        'Erro ao carregar candidaturas'
      );
    }


    candidaturas =
      await resposta.json();


    atualizarContadores();


    gerarOpcoesStatus();


    renderizarCandidaturas();


  } catch (erro) {

    console.error(
      'Erro ao carregar candidaturas:',
      erro
    );

  }

}


/* =========================================================
   CONTADORES
========================================================= */

async function atualizarContadores() {

  try {

    const [respostaAtivas, respostaEncerradas] =
      await Promise.all([

        fetch(
          `${API_URL}?visao=ativas`
        ),

        fetch(
          `${API_URL}?visao=encerradas`
        )

      ]);


    if (
      !respostaAtivas.ok ||
      !respostaEncerradas.ok
    ) {
      return;
    }


    const ativas =
      await respostaAtivas.json();


    const encerradas =
      await respostaEncerradas.json();


    document.getElementById(
      'contadorAtivas'
    ).textContent =
      ativas.length;


    document.getElementById(
      'contadorEncerradas'
    ).textContent =
      encerradas.length;


  } catch (erro) {

    console.error(
      'Erro ao atualizar contadores:',
      erro
    );

  }

}


/* =========================================================
   RENDERIZAÇÃO DAS CANDIDATURAS
========================================================= */

function renderizarCandidaturas() {

  const container =
    document.getElementById(
      'listaCandidaturas'
    );


  if (!container) {
    return;
  }


  const filtro =
    document.getElementById(
      'filtroStatus'
    ).value;


  const ordenacao =
    document.getElementById(
      'ordenacao'
    ).value;


  let lista =
    [...candidaturas];


  if (filtro !== 'todos') {

    lista =
      lista.filter(
        item =>
          item.status_atual === filtro
      );

  }


  lista.sort(
    (a, b) => {

      if (
        ordenacao === 'empresa'
      ) {

        return String(
          a.empresa || ''
        ).localeCompare(
          String(
            b.empresa || ''
          )
        );

      }


      const dataA =
        new Date(
          a.data_candidatura
        );


      const dataB =
        new Date(
          b.data_candidatura
        );


      if (
        ordenacao === 'mais_antiga'
      ) {

        return dataA - dataB;

      }


      return dataB - dataA;

    }
  );


  container.innerHTML = '';


  if (lista.length === 0) {

    container.innerHTML = `

      <div class="lista-vazia">

        <strong>
          ${
            visaoAtual === 'ativas'
              ? 'Nenhuma candidatura ativa'
              : 'Nenhuma candidatura encerrada'
          }
        </strong>

        <span>
          ${
            visaoAtual === 'ativas'
              ? 'As candidaturas em andamento aparecerão aqui.'
              : 'Candidaturas negadas ou desistidas aparecerão aqui.'
          }
        </span>

      </div>

    `;

    return;

  }


  lista.forEach(
    candidatura => {

      const card =
        document.createElement(
          'div'
        );


      const encerrada =
        visaoAtual === 'encerradas';


      card.className =
        `candidatura-card ${
          encerrada
            ? 'encerrada'
            : ''
        }`;


      const dataFormatada =
        formatarData(
          candidatura.data_candidatura
        );


      const ultimaAtualizacao =
        candidatura.ultima_atualizacao
          ? formatarData(
              candidatura.ultima_atualizacao
            )
          : dataFormatada;


      card.innerHTML = `

        <div class="candidatura-topo">

          <div class="candidatura-info">

            <h3>
              ${
                candidatura.empresa ||
                'Sem empresa'
              }
            </h3>

            <p>
              ${
                candidatura.vaga ||
                'Sem vaga'
              }
            </p>

          </div>


          ${
            encerrada

              ? `

                <span class="status-encerrado">

                  ${formatarRotulo(
                    candidatura.status_atual
                  )}

                </span>

              `

              : `

                <select
                  class="status-select"
                  data-id="${candidatura.id_candidatura}"
                >

                  ${gerarOpcoesStatusHtml(
                    candidatura.status_atual
                  )}

                </select>

              `
          }

        </div>



        <div class="candidatura-meta">

          ${
            candidatura.modalidade

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.modalidade
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.tipo_contratacao

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.tipo_contratacao
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.plataforma

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.plataforma
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.dias_em_processo !==
            undefined

              ? `

                <span class="detalhe">

                  ${
                    candidatura.dias_em_processo
                  }
                  ${
                    candidatura.dias_em_processo === 1
                      ? 'dia'
                      : 'dias'
                  }
                  em processo

                </span>

              `

              : ''
          }

        </div>



        <div class="candidatura-footer">

          <span class="candidatura-atualizacao">

            ${
              encerrada
                ? `Encerrada em ${ultimaAtualizacao}`
                : `Última atualização: ${ultimaAtualizacao}`
            }

          </span>


          <button
            class="btn-detalhes"
            data-id="${candidatura.id_candidatura}"
          >

            Ver detalhes →

          </button>

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );


  adicionarEventosStatus();

  adicionarEventosDetalhes();

}


/* =========================================================
   STATUS
========================================================= */

const STATUS = [

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


function gerarOpcoesStatus() {

  const select =
    document.getElementById(
      'filtroStatus'
    );


  if (!select) {
    return;
  }


  const valorAtual =
    select.value;


  select.innerHTML =
    '<option value="todos">Todos os status</option>';


  const statusExistentes =
    [
      ...new Set(
        candidaturas
          .map(
            item =>
              item.status_atual
          )
          .filter(Boolean)
      )
    ];


  const lista =
    [
      ...STATUS,
      ...statusExistentes
    ];


  [
    ...new Set(lista)
  ]
    .forEach(
      status => {

        const option =
          document.createElement(
            'option'
          );


        option.value =
          status;


        option.textContent =
          formatarRotulo(
            status
          );


        select.appendChild(
          option
        );

      }
    );


  select.value =
    valorAtual || 'todos';

}


function gerarOpcoesStatusHtml(
  statusAtual
) {

  const lista =
    [
      ...STATUS,
      statusAtual
    ].filter(Boolean);


  return [
    ...new Set(lista)
  ]
    .map(
      status => `

        <option
          value="${status}"
          ${
            status === statusAtual
              ? 'selected'
              : ''
          }
        >

          ${formatarRotulo(
            status
          )}

        </option>

      `
    )
    .join('');

}


/* =========================================================
   ALTERAR STATUS
========================================================= */

function adicionarEventosStatus() {

  document
    .querySelectorAll(
      '.status-select'
    )
    .forEach(
      select => {

        select.addEventListener(
          'change',
          alterarStatus
        );

      }
    );

}


async function alterarStatus(evento) {

  const select =
    evento.target;


  const id =
    select.dataset.id;


  const novoStatus =
    select.value;


  select.disabled = true;


  try {

    const resposta =
      await fetch(
        API_URL,
        {

          method: 'POST',

          headers: {

            'Content-Type':
              'text/plain;charset=utf-8'

          },

          body:
            JSON.stringify({

              acao:
                'atualizar',

              id_candidatura:
                id,

              status_atual:
                novoStatus

            })

        }
      );


    if (!resposta.ok) {

      throw new Error(
        'Erro ao atualizar status'
      );

    }


    await Promise.all([

      carregarCandidaturas(),

      carregarDashboard(),

      atualizarContadores()

    ]);


  } catch (erro) {

    console.error(
      'Erro ao atualizar status:',
      erro
    );


    alert(
      'Não foi possível atualizar o status.'
    );


    select.disabled = false;

  }

}


/* =========================================================
   DETALHES
========================================================= */

function adicionarEventosDetalhes() {

  document
    .querySelectorAll(
      '.btn-detalhes'
    )
    .forEach(
      botao => {

        botao.addEventListener(
          'click',
          () =>
            abrirDetalhes(
              botao.dataset.id
            )
        );

      }
    );

}


async function abrirDetalhes(
  id
) {

  try {

    const resposta =
      await fetch(
        `${API_URL}?id=${encodeURIComponent(id)}`
      );


    if (!resposta.ok) {

      throw new Error(
        'Erro ao buscar candidatura'
      );

    }


    const candidatura =
      await resposta.json();


    if (!candidatura) {

      throw new Error(
        'Candidatura não encontrada'
      );

    }


    document.getElementById(
      'detalhesEmpresa'
    ).textContent =
      candidatura.empresa ||
      'Sem empresa';


    document.getElementById(
      'detalhesVaga'
    ).textContent =
      candidatura.vaga ||
      'Sem vaga';


    const campos = [

      [
        'Data da candidatura',
        formatarData(
          candidatura.data_candidatura
        )
      ],

      [
        'Status',
        formatarRotulo(
          candidatura.status_atual
        )
      ],

      [
        'Resultado',
        formatarRotulo(
          candidatura.resultado
        )
      ],

      [
        'Teve retorno',
        formatarRotulo(
          candidatura.teve_retorno
        )
      ],

      [
        'Salário mínimo',
        candidatura.salario_min || '-'
      ],

      [
        'Salário máximo',
        candidatura.salario_max || '-'
      ],

      [
        'Salário informado',
        candidatura.salario_informado || '-'
      ],

      [
        'Tipo de contratação',
        formatarRotulo(
          candidatura.tipo_contratacao
        ) || '-'
      ],

      [
        'Modalidade',
        formatarRotulo(
          candidatura.modalidade
        ) || '-'
      ],

      [
        'Localização',
        candidatura.localizacao || '-'
      ],

      [
        'Plataforma',
        formatarRotulo(
          candidatura.plataforma
        ) || '-'
      ],

      [
        'Dias em processo',
        candidatura.dias_em_processo !== undefined
          ? candidatura.dias_em_processo
          : '-'
      ],

      [
        'Última atualização',
        formatarData(
          candidatura.ultima_atualizacao
        )
      ],

      [
        'Observações',
        candidatura.observacoes || '-'
      ]

    ];


    const conteudo =
      document.getElementById(
        'detalhesConteudo'
      );


    conteudo.innerHTML = '';


    campos.forEach(
      ([label, valor]) => {

        const bloco =
          document.createElement(
            'div'
          );


        bloco.className =
          'detalhe-bloco';


        if (
          label === 'Observações'
        ) {

          bloco.classList.add(
            'full'
          );

        }


        bloco.innerHTML = `

          <span class="detalhe-bloco-label">

            ${label}

          </span>

          <span class="detalhe-bloco-valor">

            ${escaparHtml(
              String(valor)
            )}

          </span>

        `;


        conteudo.appendChild(
          bloco
        );

      }
    );


    const link =
      document.getElementById(
        'detalhesLinkVaga'
      );


    if (
      candidatura.link_vaga
    ) {

      link.href =
        candidatura.link_vaga;

      link.classList.remove(
        'oculto'
      );

    } else {

      link.removeAttribute(
        'href'
      );

      link.classList.add(
        'oculto'
      );

    }


    document
      .getElementById(
        'modalDetalhes'
      )
      .classList.add(
        'ativo'
      );


  } catch (erro) {

    console.error(
      'Erro ao abrir detalhes:',
      erro
    );


    alert(
      'Não foi possível carregar os detalhes da candidatura.'
    );

  }

}


/* =========================================================
   NOVA CANDIDATURA
========================================================= */

function abrirModal() {

  const modal =
    document.getElementById(
      'modalCandidatura'
    );


  modal.classList.add(
    'ativo'
  );


  const campoData =
    document.getElementById(
      'dataCandidatura'
    );


  if (!campoData.value) {

    campoData.value =
      obterDataHoje();

  }

}


function fecharModal() {

  document
    .getElementById(
      'modalCandidatura'
    )
    .classList.remove(
      'ativo'
    );

}


function fecharModalDetalhes() {

  document
    .getElementById(
      'modalDetalhes'
    )
    .classList.remove(
      'ativo'
    );

}


/* =========================================================
   CRIAR CANDIDATURA
========================================================= */

async function criarCandidatura(
  evento
) {

  evento.preventDefault();


  if (
    salvandoCandidatura
  ) {

    return;

  }


  salvandoCandidatura =
    true;


  const botaoSalvar =
    document.querySelector(
      '#formCandidatura button[type="submit"]'
    );


  const textoOriginal =
    botaoSalvar.textContent;


  botaoSalvar.disabled =
    true;


  botaoSalvar.textContent =
    'Salvando...';


  botaoSalvar.style.opacity =
    '0.6';


  botaoSalvar.style.cursor =
    'not-allowed';


  const dados = {

    data_candidatura:
      document.getElementById(
        'dataCandidatura'
      ).value,

    empresa:
      document.getElementById(
        'empresa'
      ).value,

    vaga:
      document.getElementById(
        'vaga'
      ).value,

    salario_min:
      document.getElementById(
        'salarioMin'
      ).value,

    salario_max:
      document.getElementById(
        'salarioMax'
      ).value,

    salario_informado:
      document.getElementById(
        'salarioInformado'
      ).value,

    tipo_contratacao:
      document.getElementById(
        'tipoContratacao'
      ).value,

    modalidade:
      document.getElementById(
        'modalidade'
      ).value,

    localizacao:
      document.getElementById(
        'localizacao'
      ).value,

    plataforma:
      document.getElementById(
        'plataforma'
      ).value,

    link_vaga:
      document.getElementById(
        'linkVaga'
      ).value,

    status_atual:
      'candidatura enviada',

    teve_retorno:
      'não',

    resultado:
      'em andamento',

    observacoes:
      document.getElementById(
        'observacoes'
      ).value

  };


  try {

    const resposta =
      await fetch(
        API_URL,
        {

          method: 'POST',

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


    if (!resposta.ok) {

      throw new Error(
        'Erro ao criar candidatura'
      );

    }


    const resultado =
      await resposta.json();


    console.log(
      'Candidatura criada:',
      resultado
    );


    fecharModal();


    document
      .getElementById(
        'formCandidatura'
      )
      .reset();


    await Promise.all([

      carregarCandidaturas(),

      carregarDashboard(),

      atualizarContadores()

    ]);


  } catch (erro) {

    console.error(
      'Erro ao criar candidatura:',
      erro
    );


    alert(
      'Não foi possível criar a candidatura.'
    );


  } finally {

    salvandoCandidatura =
      false;


    botaoSalvar.disabled =
      false;


    botaoSalvar.textContent =
      textoOriginal;


    botaoSalvar.style.opacity =
      '';


    botaoSalvar.style.cursor =
      '';

  }

}


/* =========================================================
   DATAS
========================================================= */

function obterDataHoje() {

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


  return `${ano}-${mes}-${dia}`;

}


function formatarData(
  valor
) {

  if (!valor) {
    return '-';
  }


  const texto =
    String(valor)
      .substring(
        0,
        10
      );


  const partes =
    texto.split('-');


  if (
    partes.length !== 3
  ) {

    return valor;

  }


  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarRotulo(
  valor
) {

  if (!valor) {
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


/* =========================================================
   SEGURANÇA
========================================================= */

function escaparHtml(
  valor
) {

  return String(valor)
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


/* =========================================================
   TROCA DE ABA
========================================================= */

async function trocarVisao(
  novaVisao
) {

  if (
    novaVisao === visaoAtual
  ) {

    return;

  }


  visaoAtual =
    novaVisao;


  document
    .querySelectorAll(
      '.aba-candidaturas'
    )
    .forEach(
      aba => {

        aba.classList.toggle(
          'ativa',
          aba.dataset.visao ===
            visaoAtual
        );

      }
    );


  const filtro =
    document.getElementById(
      'filtroStatus'
    );


  filtro.value =
    'todos';


  await carregarCandidaturas();

}


/* =========================================================
   EVENTOS
========================================================= */

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
    'fecharModal'
  )
  .addEventListener(
    'click',
    fecharModal
  );


document
  .getElementById(
    'cancelarModal'
  )
  .addEventListener(
    'click',
    fecharModal
  );


document
  .getElementById(
    'fecharDetalhes'
  )
  .addEventListener(
    'click',
    fecharModalDetalhes
  );


document
  .getElementById(
    'formCandidatura'
  )
  .addEventListener(
    'submit',
    criarCandidatura
  );


document
  .getElementById(
    'filtroStatus'
  )
  .addEventListener(
    'change',
    renderizarCandidaturas
  );


document
  .getElementById(
    'ordenacao'
  )
  .addEventListener(
    'change',
    renderizarCandidaturas
  );


document
  .getElementById(
    'filtroMes'
  )
  .addEventListener(
    'change',
    carregarDashboard
  );


document
  .getElementById(
    'abaAtivas'
  )
  .addEventListener(
    'click',
    () =>
      trocarVisao(
        'ativas'
      )
  );


document
  .getElementById(
    'abaEncerradas'
  )
  .addEventListener(
    'click',
    () =>
      trocarVisao(
        'encerradas'
      )
  );


/* =========================================================
   FECHAR MODAL CLICANDO FORA
========================================================= */

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
    'modalDetalhes'
  )
  .addEventListener(
    'click',
    evento => {

      if (
        evento.target.id ===
        'modalDetalhes'
      ) {

        fecharModalDetalhes();

      }

    }
  );


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

preencherFiltroMes();

carregarDashboard();

carregarCandidaturas();

atualizarContadores();      await fetch(
        `${API_URL}?dashboard=true&mes=${mesSelecionado}`
      );


    if (!resposta.ok) {
      throw new Error(
        'Erro ao carregar dashboard'
      );
    }


    const dados =
      await resposta.json();


    document.getElementById(
      'totalCandidaturas'
    ).textContent =
      dados.total_candidaturas || 0;


    document.getElementById(
      'emAndamento'
    ).textContent =
      dados.em_andamento || 0;


    document.getElementById(
      'comRetorno'
    ).textContent =
      dados.com_retorno || 0;


    document.getElementById(
      'aprovadas'
    ).textContent =
      dados.aprovadas || 0;


    document.getElementById(
      'encerradas'
    ).textContent =
      dados.encerradas || 0;


    document.getElementById(
      'ritmoHoje'
    ).textContent =
      dados.ritmo?.hoje || 0;


    document.getElementById(
      'ritmoSemana'
    ).textContent =
      dados.ritmo?.semana || 0;


    document.getElementById(
      'ritmoMes'
    ).textContent =
      dados.ritmo?.mes || 0;


    renderizarGraficoEvolucao(
      dados.evolucao_diaria || []
    );


    renderizarGraficoStatus(
      dados.por_status || {}
    );


    renderizarGraficoModalidade(
      dados.por_modalidade || {}
    );


    renderizarGraficoContratacao(
      dados.por_tipo_contratacao || {}
    );


    renderizarResumoPlataforma(
      dados.por_plataforma || {}
    );


  } catch (erro) {

    console.error(
      'Erro ao carregar dashboard:',
      erro
    );

  }

}


/* =========================================================
   FILTRO DE MÊS
========================================================= */

function obterMesAtual() {

  const hoje =
    new Date();


  return `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, '0')}`;

}


function preencherFiltroMes() {

  const select =
    document.getElementById(
      'filtroMes'
    );


  select.innerHTML = '';


  const hoje =
    new Date();


  for (
    let i = 0;
    i < 12;
    i++
  ) {

    const data =
      new Date(
        hoje.getFullYear(),
        hoje.getMonth() - i,
        1
      );


    const ano =
      data.getFullYear();


    const mes =
      String(
        data.getMonth() + 1
      ).padStart(2, '0');


    const valor =
      `${ano}-${mes}`;


    const opcao =
      document.createElement(
        'option'
      );


    opcao.value =
      valor;


    opcao.textContent =
      formatarMes(valor);


    if (i === 0) {
      opcao.selected = true;
    }


    select.appendChild(
      opcao
    );

  }

}


function formatarMes(valor) {

  const partes =
    valor.split('-');


  if (partes.length !== 2) {
    return valor;
  }


  const data =
    new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      1
    );


  return data
    .toLocaleDateString(
      'pt-BR',
      {
        month: 'long',
        year: 'numeric'
      }
    )
    .replace(
      /^./,
      letra => letra.toUpperCase()
    );

}


/* =========================================================
   GRÁFICO DE EVOLUÇÃO
========================================================= */

function renderizarGraficoEvolucao(
  evolucao
) {

  const canvas =
    document.getElementById(
      'graficoEvolucao'
    );


  if (!canvas) {
    return;
  }


  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }


  graficoEvolucao =
    new Chart(
      canvas,
      {

        type: 'bar',

        data: {

          labels:
            evolucao.map(
              item => item.data
            ),

          datasets: [

            {

              label:
                'Candidaturas',

              data:
                evolucao.map(
                  item =>
                    item.quantidade
                ),

              borderWidth: 1,

              borderRadius: 5

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,


          plugins: {

            legend: {
              display: false
            }

          },


          scales: {

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0
              },

              title: {

                display: true,

                text:
                  'Quantidade'

              }

            },


            x: {

              title: {

                display: true,

                text:
                  'Dia'

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE STATUS
========================================================= */

function renderizarGraficoStatus(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoStatus'
    );


  if (!canvas) {
    return;
  }


  if (graficoStatus) {
    graficoStatus.destroy();
  }


  graficoStatus =
    new Chart(
      canvas,
      {

        type: 'doughnut',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              data:
                Object.values(dados),

              borderWidth: 1

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              position: 'bottom'
            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE MODALIDADE
========================================================= */

function renderizarGraficoModalidade(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoModalidade'
    );


  if (!canvas) {
    return;
  }


  if (graficoModalidade) {
    graficoModalidade.destroy();
  }


  graficoModalidade =
    new Chart(
      canvas,
      {

        type: 'doughnut',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              data:
                Object.values(dados),

              borderWidth: 1

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              position: 'bottom'
            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE CONTRATAÇÃO
========================================================= */

function renderizarGraficoContratacao(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoContratacao'
    );


  if (!canvas) {
    return;
  }


  if (graficoContratacao) {
    graficoContratacao.destroy();
  }


  graficoContratacao =
    new Chart(
      canvas,
      {

        type: 'bar',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              label:
                'Candidaturas',

              data:
                Object.values(dados),

              borderWidth: 1,

              borderRadius: 5

            }

          ]

        },


        options: {

          indexAxis: 'y',

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              display: false
            }

          },


          scales: {

            x: {

              beginAtZero: true,

              ticks: {
                precision: 0
              }

            }

          }

        }

      }
    );

}


/* =========================================================
   PLATAFORMAS
========================================================= */

function renderizarResumoPlataforma(
  dados
) {

  const container =
    document.getElementById(
      'resumoPlataforma'
    );


  if (!container) {
    return;
  }


  container.innerHTML = '';


  const entradas =
    Object.entries(dados);


  if (entradas.length === 0) {

    container.innerHTML =
      '<p>Nenhuma candidatura registrada.</p>';

    return;

  }


  entradas
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .forEach(
      ([plataforma, quantidade]) => {

        const item =
          document.createElement(
            'div'
          );


        item.className =
          'plataforma-item';


        item.innerHTML = `

          <span>
            ${formatarRotulo(plataforma)}
          </span>

          <strong>
            ${quantidade}
          </strong>

        `;


        container.appendChild(
          item
        );

      }
    );

}


/* =========================================================
   CARREGAR CANDIDATURAS
========================================================= */

async function carregarCandidaturas() {

  try {

    const resposta =
      await fetch(
        `${API_URL}?visao=${visaoAtual}`
      );


    if (!resposta.ok) {
      throw new Error(
        'Erro ao carregar candidaturas'
      );
    }


    candidaturas =
      await resposta.json();


    atualizarContadores();


    gerarOpcoesStatus();


    renderizarCandidaturas();


  } catch (erro) {

    console.error(
      'Erro ao carregar candidaturas:',
      erro
    );

  }

}


/* =========================================================
   CONTADORES
========================================================= */

async function atualizarContadores() {

  try {

    const [respostaAtivas, respostaEncerradas] =
      await Promise.all([

        fetch(
          `${API_URL}?visao=ativas`
        ),

        fetch(
          `${API_URL}?visao=encerradas`
        )

      ]);


    if (
      !respostaAtivas.ok ||
      !respostaEncerradas.ok
    ) {
      return;
    }


    const ativas =
      await respostaAtivas.json();


    const encerradas =
      await respostaEncerradas.json();


    document.getElementById(
      'contadorAtivas'
    ).textContent =
      ativas.length;


    document.getElementById(
      'contadorEncerradas'
    ).textContent =
      encerradas.length;


  } catch (erro) {

    console.error(
      'Erro ao atualizar contadores:',
      erro
    );

  }

}


/* =========================================================
   RENDERIZAÇÃO DAS CANDIDATURAS
========================================================= */

function renderizarCandidaturas() {

  const container =
    document.getElementById(
      'listaCandidaturas'
    );


  if (!container) {
    return;
  }


  const filtro =
    document.getElementById(
      'filtroStatus'
    ).value;


  const ordenacao =
    document.getElementById(
      'ordenacao'
    ).value;


  let lista =
    [...candidaturas];


  if (filtro !== 'todos') {

    lista =
      lista.filter(
        item =>
          item.status_atual === filtro
      );

  }


  lista.sort(
    (a, b) => {

      if (
        ordenacao === 'empresa'
      ) {

        return String(
          a.empresa || ''
        ).localeCompare(
          String(
            b.empresa || ''
          )
        );

      }


      const dataA =
        new Date(
          a.data_candidatura
        );


      const dataB =
        new Date(
          b.data_candidatura
        );


      if (
        ordenacao === 'mais_antiga'
      ) {

        return dataA - dataB;

      }


      return dataB - dataA;

    }
  );


  container.innerHTML = '';


  if (lista.length === 0) {

    container.innerHTML = `

      <div class="lista-vazia">

        <strong>
          ${
            visaoAtual === 'ativas'
              ? 'Nenhuma candidatura ativa'
              : 'Nenhuma candidatura encerrada'
          }
        </strong>

        <span>
          ${
            visaoAtual === 'ativas'
              ? 'As candidaturas em andamento aparecerão aqui.'
              : 'Candidaturas encerradas aparecerão aqui.'
          }
        </span>

      </div>

    `;

    return;

  }


  lista.forEach(
    candidatura => {

      const card =
        document.createElement(
          'div'
        );


      const encerrada =
        visaoAtual === 'encerradas';


      card.className =
        `candidatura-card ${
          encerrada
            ? 'encerrada'
            : ''
        }`;


      const dataFormatada =
        formatarData(
          candidatura.data_candidatura
        );


      const ultimaAtualizacao =
        candidatura.ultima_atualizacao
          ? formatarData(
              candidatura.ultima_atualizacao
            )
          : dataFormatada;


      card.innerHTML = `

        <div class="candidatura-topo">

          <div class="candidatura-info">

            <h3>
              ${
                candidatura.empresa ||
                'Sem empresa'
              }
            </h3>

            <p>
              ${
                candidatura.vaga ||
                'Sem vaga'
              }
            </p>

          </div>


          ${
            encerrada

              ? `

                <span class="status-encerrado">

                  ${formatarRotulo(
                    candidatura.status_atual
                  )}

                </span>

              `

              : `

                <select
                  class="status-select"
                  data-id="${candidatura.id_candidatura}"
                >

                  ${gerarOpcoesStatusHtml(
                    candidatura.status_atual
                  )}

                </select>

              `
          }

        </div>



        <div class="candidatura-meta">

          ${
            candidatura.modalidade

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.modalidade
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.tipo_contratacao

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.tipo_contratacao
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.plataforma

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.plataforma
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.dias_em_processo !==
            undefined

              ? `

                <span class="detalhe">

                  ${
                    candidatura.dias_em_processo
                  }
                  ${
                    candidatura.dias_em_processo === 1
                      ? 'dia'
                      : 'dias'
                  }
                  em processo

                </span>

              `

              : ''
          }

        </div>



        <div class="candidatura-footer">

          <span class="candidatura-atualizacao">

            ${
              encerrada
                ? `Encerrada em ${ultimaAtualizacao}`
                : `Última atualização: ${ultimaAtualizacao}`
            }

          </span>


          <button
            class="btn-detalhes"
            data-id="${candidatura.id_candidatura}"
          >

            Ver detalhes →

          </button>

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );


  adicionarEventosStatus();

  adicionarEventosDetalhes();

}


/* =========================================================
   STATUS
========================================================= */

const STATUS = [

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


function gerarOpcoesStatus() {

  const select =
    document.getElementById(
      'filtroStatus'
    );


  if (!select) {
    return;
  }


  const valorAtual =
    select.value;


  select.innerHTML =
    '<option value="todos">Todos os status</option>';


  const statusExistentes =
    [
      ...new Set(
        candidaturas
          .map(
            item =>
              item.status_atual
          )
          .filter(Boolean)
      )
    ];


  const lista =
    [
      ...STATUS,
      ...statusExistentes
    ];


  [
    ...new Set(lista)
  ]
    .forEach(
      status => {

        const option =
          document.createElement(
            'option'
          );


        option.value =
          status;


        option.textContent =
          formatarRotulo(
            status
          );


        select.appendChild(
          option
        );

      }
    );


  select.value =
    valorAtual || 'todos';

}


function gerarOpcoesStatusHtml(
  statusAtual
) {

  const lista =
    [
      ...STATUS,
      statusAtual
    ].filter(Boolean);


  return [
    ...new Set(lista)
  ]
    .map(
      status => `

        <option
          value="${status}"
          ${
            status === statusAtual
              ? 'selected'
              : ''
          }
        >

          ${formatarRotulo(
            status
          )}

        </option>

      `
    )
    .join('');

}


/* =========================================================
   ALTERAR STATUS
========================================================= */

function adicionarEventosStatus() {

  document
    .querySelectorAll(
      '.status-select'
    )
    .forEach(
      select => {

        select.addEventListener(
          'change',
          alterarStatus
        );

      }
    );

}


async function alterarStatus(evento) {

  const select =
    evento.target;


  const id =
    select.dataset.id;


  const novoStatus =
    select.value;


  select.disabled = true;


  try {

    const resposta =
      await fetch(
        API_URL,
        {

          method: 'POST',

          headers: {

            'Content-Type':
              'text/plain;charset=utf-8'

          },

          body:
            JSON.stringify({

              acao:
                'atualizar',

              id_candidatura:
                id,

              status_atual:
                novoStatus

            })

        }
      );


    if (!resposta.ok) {

      throw new Error(
        'Erro ao atualizar status'
      );

    }


    await Promise.all([

      carregarCandidaturas(),

      carregarDashboard(),

      atualizarContadores()

    ]);


  } catch (erro) {

    console.error(
      'Erro ao atualizar status:',
      erro
    );


    alert(
      'Não foi possível atualizar o status.'
    );


    select.disabled = false;

  }

}


/* =========================================================
   DETALHES
========================================================= */

function adicionarEventosDetalhes() {

  document
    .querySelectorAll(
      '.btn-detalhes'
    )
    .forEach(
      botao => {

        botao.addEventListener(
          'click',
          () =>
            abrirDetalhes(
              botao.dataset.id
            )
        );

      }
    );

}


async function abrirDetalhes(
  id
) {

  try {

    const resposta =
      await fetch(
        `${API_URL}?id=${encodeURIComponent(id)}`
      );


    if (!resposta.ok) {

      throw new Error(
        'Erro ao buscar candidatura'
      );

    }


    const candidatura =
      await resposta.json();


    if (!candidatura) {

      throw new Error(
        'Candidatura não encontrada'
      );

    }


    document.getElementById(
      'detalhesEmpresa'
    ).textContent =
      candidatura.empresa ||
      'Sem empresa';


    document.getElementById(
      'detalhesVaga'
    ).textContent =
      candidatura.vaga ||
      'Sem vaga';


    const campos = [

      [
        'Data da candidatura',
        formatarData(
          candidatura.data_candidatura
        )
      ],

      [
        'Status',
        formatarRotulo(
          candidatura.status_atual
        )
      ],

      [
        'Resultado',
        formatarRotulo(
          candidatura.resultado
        )
      ],

      [
        'Teve retorno',
        formatarRotulo(
          candidatura.teve_retorno
        )
      ],

      [
        'Salário mínimo',
        candidatura.salario_min || '-'
      ],

      [
        'Salário máximo',
        candidatura.salario_max || '-'
      ],

      [
        'Salário informado',
        candidatura.salario_informado || '-'
      ],

      [
        'Tipo de contratação',
        formatarRotulo(
          candidatura.tipo_contratacao
        ) || '-'
      ],

      [
        'Modalidade',
        formatarRotulo(
          candidatura.modalidade
        ) || '-'
      ],

      [
        'Localização',
        candidatura.localizacao || '-'
      ],

      [
        'Plataforma',
        formatarRotulo(
          candidatura.plataforma
        ) || '-'
      ],

      [
        'Dias em processo',
        candidatura.dias_em_processo !== undefined
          ? candidatura.dias_em_processo
          : '-'
      ],

      [
        'Última atualização',
        formatarData(
          candidatura.ultima_atualizacao
        )
      ],

      [
        'Observações',
        candidatura.observacoes || '-'
      ]

    ];


    const conteudo =
      document.getElementById(
        'detalhesConteudo'
      );


    conteudo.innerHTML = '';


    campos.forEach(
      ([label, valor]) => {

        const bloco =
          document.createElement(
            'div'
          );


        bloco.className =
          'detalhe-bloco';


        if (
          label === 'Observações'
        ) {

          bloco.classList.add(
            'full'
          );

        }


        bloco.innerHTML = `

          <span class="detalhe-bloco-label">

            ${label}

          </span>

          <span class="detalhe-bloco-valor">

            ${escaparHtml(
              String(valor)
            )}

          </span>

        `;


        conteudo.appendChild(
          bloco
        );

      }
    );


    const link =
      document.getElementById(
        'detalhesLinkVaga'
      );


    if (
      candidatura.link_vaga
    ) {

      link.href =
        candidatura.link_vaga;

      link.classList.remove(
        'oculto'
      );

    } else {

      link.removeAttribute(
        'href'
      );

      link.classList.add(
        'oculto'
      );

    }


    document
      .getElementById(
        'modalDetalhes'
      )
      .classList.add(
        'ativo'
      );


  } catch (erro) {

    console.error(
      'Erro ao abrir detalhes:',
      erro
    );


    alert(
      'Não foi possível carregar os detalhes da candidatura.'
    );

  }

}


/* =========================================================
   NOVA CANDIDATURA
========================================================= */

function abrirModal() {

  const modal =
    document.getElementById(
      'modalCandidatura'
    );


  modal.classList.add(
    'ativo'
  );


  const campoData =
    document.getElementById(
      'dataCandidatura'
    );


  if (!campoData.value) {

    campoData.value =
      obterDataHoje();

  }

}


function fecharModal() {

  document
    .getElementById(
      'modalCandidatura'
    )
    .classList.remove(
      'ativo'
    );

}


function fecharModalDetalhes() {

  document
    .getElementById(
      'modalDetalhes'
    )
    .classList.remove(
      'ativo'
    );

}


/* =========================================================
   CRIAR CANDIDATURA
========================================================= */

async function criarCandidatura(
  evento
) {

  evento.preventDefault();


  if (
    salvandoCandidatura
  ) {

    return;

  }


  salvandoCandidatura =
    true;


  const botaoSalvar =
    document.querySelector(
      '#formCandidatura button[type="submit"]'
    );


  const textoOriginal =
    botaoSalvar.textContent;


  botaoSalvar.disabled =
    true;


  botaoSalvar.textContent =
    'Salvando...';


  botaoSalvar.style.opacity =
    '0.6';


  botaoSalvar.style.cursor =
    'not-allowed';


  const dados = {

    data_candidatura:
      document.getElementById(
        'dataCandidatura'
      ).value,

    empresa:
      document.getElementById(
        'empresa'
      ).value,

    vaga:
      document.getElementById(
        'vaga'
      ).value,

    salario_min:
      document.getElementById(
        'salarioMin'
      ).value,

    salario_max:
      document.getElementById(
        'salarioMax'
      ).value,

    salario_informado:
      document.getElementById(
        'salarioInformado'
      ).value,

    tipo_contratacao:
      document.getElementById(
        'tipoContratacao'
      ).value,

    modalidade:
      document.getElementById(
        'modalidade'
      ).value,

    localizacao:
      document.getElementById(
        'localizacao'
      ).value,

    plataforma:
      document.getElementById(
        'plataforma'
      ).value,

    link_vaga:
      document.getElementById(
        'linkVaga'
      ).value,

    status_atual:
      'candidatura enviada',

    teve_retorno:
      'não',

    resultado:
      'em andamento',

    observacoes:
      document.getElementById(
        'observacoes'
      ).value

  };


  try {

    const resposta =
      await fetch(
        API_URL,
        {

          method: 'POST',

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


    if (!resposta.ok) {

      throw new Error(
        'Erro ao criar candidatura'
      );

    }


    const resultado =
      await resposta.json();


    console.log(
      'Candidatura criada:',
      resultado
    );


    fecharModal();


    document
      .getElementById(
        'formCandidatura'
      )
      .reset();


    await Promise.all([

      carregarCandidaturas(),

      carregarDashboard(),

      atualizarContadores()

    ]);


  } catch (erro) {

    console.error(
      'Erro ao criar candidatura:',
      erro
    );


    alert(
      'Não foi possível criar a candidatura.'
    );


  } finally {

    salvandoCandidatura =
      false;


    botaoSalvar.disabled =
      false;


    botaoSalvar.textContent =
      textoOriginal;


    botaoSalvar.style.opacity =
      '';


    botaoSalvar.style.cursor =
      '';

  }

}


/* =========================================================
   DATAS
========================================================= */

function obterDataHoje() {

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


  return `${ano}-${mes}-${dia}`;

}


function formatarData(
  valor
) {

  if (!valor) {
    return '-';
  }


  const texto =
    String(valor)
      .substring(
        0,
        10
      );


  const partes =
    texto.split('-');


  if (
    partes.length !== 3
  ) {

    return valor;

  }


  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarRotulo(
  valor
) {

  if (!valor) {
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


/* =========================================================
   SEGURANÇA
========================================================= */

function escaparHtml(
  valor
) {

  return String(valor)
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


/* =========================================================
   TROCA DE ABA
========================================================= */

async function trocarVisao(
  novaVisao
) {

  if (
    novaVisao === visaoAtual
  ) {

    return;

  }


  visaoAtual =
    novaVisao;


  document
    .querySelectorAll(
      '.aba-candidaturas'
    )
    .forEach(
      aba => {

        aba.classList.toggle(
          'ativa',
          aba.dataset.visao ===
            visaoAtual
        );

      }
    );


  const filtro =
    document.getElementById(
      'filtroStatus'
    );


  filtro.value =
    'todos';


  await carregarCandidaturas();

}


/* =========================================================
   EVENTOS
========================================================= */

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
    'fecharModal'
  )
  .addEventListener(
    'click',
    fecharModal
  );


document
  .getElementById(
    'cancelarModal'
  )
  .addEventListener(
    'click',
    fecharModal
  );


document
  .getElementById(
    'fecharDetalhes'
  )
  .addEventListener(
    'click',
    fecharModalDetalhes
  );


document
  .getElementById(
    'formCandidatura'
  )
  .addEventListener(
    'submit',
    criarCandidatura
  );


document
  .getElementById(
    'filtroStatus'
  )
  .addEventListener(
    'change',
    renderizarCandidaturas
  );


document
  .getElementById(
    'ordenacao'
  )
  .addEventListener(
    'change',
    renderizarCandidaturas
  );


document
  .getElementById(
    'filtroMes'
  )
  .addEventListener(
    'change',
    carregarDashboard
  );


document
  .getElementById(
    'abaAtivas'
  )
  .addEventListener(
    'click',
    () =>
      trocarVisao(
        'ativas'
      )
  );


document
  .getElementById(
    'abaEncerradas'
  )
  .addEventListener(
    'click',
    () =>
      trocarVisao(
        'encerradas'
      )
  );


/* =========================================================
   FECHAR MODAL CLICANDO FORA
========================================================= */

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
    'modalDetalhes'
  )
  .addEventListener(
    'click',
    evento => {

      if (
        evento.target.id ===
        'modalDetalhes'
      ) {

        fecharModalDetalhes();

      }

    }
  );


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

preencherFiltroMes();

carregarDashboard();

carregarCandidaturas();

atualizarContadores();      await fetch(
        `${API_URL}?dashboard=true&mes=${mesSelecionado}`
      );


    if (!resposta.ok) {
      throw new Error(
        'Erro ao carregar dashboard'
      );
    }


    const dados =
      await resposta.json();


    document.getElementById(
      'totalCandidaturas'
    ).textContent =
      dados.total_candidaturas || 0;


    document.getElementById(
      'emAndamento'
    ).textContent =
      dados.em_andamento || 0;


    document.getElementById(
      'comRetorno'
    ).textContent =
      dados.com_retorno || 0;


    document.getElementById(
      'aprovadas'
    ).textContent =
      dados.aprovadas || 0;


    document.getElementById(
      'ritmoHoje'
    ).textContent =
      dados.ritmo?.hoje || 0;


    document.getElementById(
      'ritmoSemana'
    ).textContent =
      dados.ritmo?.semana || 0;


    document.getElementById(
      'ritmoMes'
    ).textContent =
      dados.ritmo?.mes || 0;


    renderizarGraficoEvolucao(
      dados.evolucao_diaria || []
    );


    renderizarGraficoStatus(
      dados.por_status || {}
    );


    renderizarGraficoModalidade(
      dados.por_modalidade || {}
    );


    renderizarGraficoContratacao(
      dados.por_tipo_contratacao || {}
    );


    renderizarResumoPlataforma(
      dados.por_plataforma || {}
    );


  } catch (erro) {

    console.error(
      'Erro ao carregar dashboard:',
      erro
    );

  }

}


/* =========================================================
   FILTRO DE MÊS
========================================================= */

function obterMesAtual() {

  const hoje =
    new Date();


  return `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, '0')}`;

}


function preencherFiltroMes() {

  const select =
    document.getElementById(
      'filtroMes'
    );


  select.innerHTML = '';


  const hoje =
    new Date();


  for (
    let i = 0;
    i < 12;
    i++
  ) {

    const data =
      new Date(
        hoje.getFullYear(),
        hoje.getMonth() - i,
        1
      );


    const ano =
      data.getFullYear();


    const mes =
      String(
        data.getMonth() + 1
      ).padStart(2, '0');


    const valor =
      `${ano}-${mes}`;


    const opcao =
      document.createElement(
        'option'
      );


    opcao.value =
      valor;


    opcao.textContent =
      formatarMes(valor);


    if (i === 0) {
      opcao.selected = true;
    }


    select.appendChild(
      opcao
    );

  }

}


function formatarMes(valor) {

  const partes =
    valor.split('-');


  if (partes.length !== 2) {
    return valor;
  }


  const data =
    new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      1
    );


  return data
    .toLocaleDateString(
      'pt-BR',
      {
        month: 'long',
        year: 'numeric'
      }
    )
    .replace(
      /^./,
      letra => letra.toUpperCase()
    );

}


/* =========================================================
   GRÁFICO DE EVOLUÇÃO
========================================================= */

function renderizarGraficoEvolucao(
  evolucao
) {

  const canvas =
    document.getElementById(
      'graficoEvolucao'
    );


  if (!canvas) {
    return;
  }


  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }


  graficoEvolucao =
    new Chart(
      canvas,
      {

        type: 'bar',

        data: {

          labels:
            evolucao.map(
              item => item.data
            ),

          datasets: [

            {

              label:
                'Candidaturas',

              data:
                evolucao.map(
                  item =>
                    item.quantidade
                ),

              borderWidth: 1,

              borderRadius: 5

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,


          plugins: {

            legend: {
              display: false
            }

          },


          scales: {

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0
              },

              title: {

                display: true,

                text:
                  'Quantidade'

              }

            },


            x: {

              title: {

                display: true,

                text:
                  'Dia'

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE STATUS
========================================================= */

function renderizarGraficoStatus(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoStatus'
    );


  if (!canvas) {
    return;
  }


  if (graficoStatus) {
    graficoStatus.destroy();
  }


  graficoStatus =
    new Chart(
      canvas,
      {

        type: 'doughnut',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              data:
                Object.values(dados),

              borderWidth: 1

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              position: 'bottom'
            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE MODALIDADE
========================================================= */

function renderizarGraficoModalidade(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoModalidade'
    );


  if (!canvas) {
    return;
  }


  if (graficoModalidade) {
    graficoModalidade.destroy();
  }


  graficoModalidade =
    new Chart(
      canvas,
      {

        type: 'doughnut',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              data:
                Object.values(dados),

              borderWidth: 1

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              position: 'bottom'
            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO DE CONTRATAÇÃO
========================================================= */

function renderizarGraficoContratacao(
  dados
) {

  const canvas =
    document.getElementById(
      'graficoContratacao'
    );


  if (!canvas) {
    return;
  }


  if (graficoContratacao) {
    graficoContratacao.destroy();
  }


  graficoContratacao =
    new Chart(
      canvas,
      {

        type: 'bar',

        data: {

          labels:
            Object.keys(dados),

          datasets: [

            {

              label:
                'Candidaturas',

              data:
                Object.values(dados),

              borderWidth: 1,

              borderRadius: 5

            }

          ]

        },


        options: {

          indexAxis: 'y',

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              display: false
            }

          },


          scales: {

            x: {

              beginAtZero: true,

              ticks: {
                precision: 0
              }

            }

          }

        }

      }
    );

}


/* =========================================================
   PLATAFORMAS
========================================================= */

function renderizarResumoPlataforma(
  dados
) {

  const container =
    document.getElementById(
      'resumoPlataforma'
    );


  if (!container) {
    return;
  }


  container.innerHTML = '';


  const entradas =
    Object.entries(dados);


  if (entradas.length === 0) {

    container.innerHTML =
      '<p>Nenhuma candidatura registrada.</p>';

    return;

  }


  entradas
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .forEach(
      ([plataforma, quantidade]) => {

        const item =
          document.createElement(
            'div'
          );


        item.className =
          'plataforma-item';


        item.innerHTML = `

          <span>
            ${formatarRotulo(plataforma)}
          </span>

          <strong>
            ${quantidade}
          </strong>

        `;


        container.appendChild(
          item
        );

      }
    );

}


/* =========================================================
   CARREGAR CANDIDATURAS
========================================================= */

async function carregarCandidaturas() {

  try {

    const resposta =
      await fetch(
        `${API_URL}?visao=${visaoAtual}`
      );


    if (!resposta.ok) {
      throw new Error(
        'Erro ao carregar candidaturas'
      );
    }


    candidaturas =
      await resposta.json();


    atualizarContadores();


    gerarOpcoesStatus();


    renderizarCandidaturas();


  } catch (erro) {

    console.error(
      'Erro ao carregar candidaturas:',
      erro
    );

  }

}


/* =========================================================
   CONTADORES
========================================================= */

async function atualizarContadores() {

  try {

    const [respostaAtivas, respostaEncerradas] =
      await Promise.all([

        fetch(
          `${API_URL}?visao=ativas`
        ),

        fetch(
          `${API_URL}?visao=encerradas`
        )

      ]);


    if (
      !respostaAtivas.ok ||
      !respostaEncerradas.ok
    ) {
      return;
    }


    const ativas =
      await respostaAtivas.json();


    const encerradas =
      await respostaEncerradas.json();


    document.getElementById(
      'contadorAtivas'
    ).textContent =
      ativas.length;


    document.getElementById(
      'contadorEncerradas'
    ).textContent =
      encerradas.length;


  } catch (erro) {

    console.error(
      'Erro ao atualizar contadores:',
      erro
    );

  }

}


/* =========================================================
   RENDERIZAÇÃO DAS CANDIDATURAS
========================================================= */

function renderizarCandidaturas() {

  const container =
    document.getElementById(
      'listaCandidaturas'
    );


  if (!container) {
    return;
  }


  const filtro =
    document.getElementById(
      'filtroStatus'
    ).value;


  const ordenacao =
    document.getElementById(
      'ordenacao'
    ).value;


  let lista =
    [...candidaturas];


  if (filtro !== 'todos') {

    lista =
      lista.filter(
        item =>
          item.status_atual === filtro
      );

  }


  lista.sort(
    (a, b) => {

      if (
        ordenacao === 'empresa'
      ) {

        return String(
          a.empresa || ''
        ).localeCompare(
          String(
            b.empresa || ''
          )
        );

      }


      const dataA =
        new Date(
          a.data_candidatura
        );


      const dataB =
        new Date(
          b.data_candidatura
        );


      if (
        ordenacao === 'mais_antiga'
      ) {

        return dataA - dataB;

      }


      return dataB - dataA;

    }
  );


  container.innerHTML = '';


  if (lista.length === 0) {

    container.innerHTML = `

      <div class="lista-vazia">

        <strong>
          ${
            visaoAtual === 'ativas'
              ? 'Nenhuma candidatura ativa'
              : 'Nenhuma candidatura encerrada'
          }
        </strong>

        <span>
          ${
            visaoAtual === 'ativas'
              ? 'As candidaturas em andamento aparecerão aqui.'
              : 'Candidaturas negadas ou desistidas aparecerão aqui.'
          }
        </span>

      </div>

    `;

    return;

  }


  lista.forEach(
    candidatura => {

      const card =
        document.createElement(
          'div'
        );


      const encerrada =
        visaoAtual === 'encerradas';


      card.className =
        `candidatura-card ${
          encerrada
            ? 'encerrada'
            : ''
        }`;


      const dataFormatada =
        formatarData(
          candidatura.data_candidatura
        );


      const ultimaAtualizacao =
        candidatura.ultima_atualizacao
          ? formatarData(
              candidatura.ultima_atualizacao
            )
          : dataFormatada;


      card.innerHTML = `

        <div class="candidatura-topo">

          <div class="candidatura-info">

            <h3>
              ${
                candidatura.empresa ||
                'Sem empresa'
              }
            </h3>

            <p>
              ${
                candidatura.vaga ||
                'Sem vaga'
              }
            </p>

          </div>


          ${
            encerrada

              ? `

                <span class="status-encerrado">

                  ${formatarRotulo(
                    candidatura.status_atual
                  )}

                </span>

              `

              : `

                <select
                  class="status-select"
                  data-id="${candidatura.id_candidatura}"
                >

                  ${gerarOpcoesStatusHtml(
                    candidatura.status_atual
                  )}

                </select>

              `
          }

        </div>



        <div class="candidatura-meta">

          ${
            candidatura.modalidade

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.modalidade
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.tipo_contratacao

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.tipo_contratacao
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.plataforma

              ? `

                <span class="detalhe">

                  ${formatarRotulo(
                    candidatura.plataforma
                  )}

                </span>

              `

              : ''
          }


          ${
            candidatura.dias_em_processo !==
            undefined

              ? `

                <span class="detalhe">

                  ${
                    candidatura.dias_em_processo
                  }
                  ${
                    candidatura.dias_em_processo === 1
                      ? 'dia'
                      : 'dias'
                  }
                  em processo

                </span>

              `

              : ''
          }

        </div>



        <div class="candidatura-footer">

          <span class="candidatura-atualizacao">

            ${
              encerrada
                ? `Encerrada em ${ultimaAtualizacao}`
                : `Última atualização: ${ultimaAtualizacao}`
            }

          </span>


          <button
            class="btn-detalhes"
            data-id="${candidatura.id_candidatura}"
          >

            Ver detalhes →

          </button>

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );


  adicionarEventosStatus();

  adicionarEventosDetalhes();

}


/* =========================================================
   STATUS
========================================================= */

const STATUS = [

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


function gerarOpcoesStatus() {

  const select =
    document.getElementById(
      'filtroStatus'
    );


  if (!select) {
    return;
  }


  const valorAtual =
    select.value;


  select.innerHTML =
    '<option value="todos">Todos os status</option>';


  const statusExistentes =
    [
      ...new Set(
        candidaturas
          .map(
            item =>
              item.status_atual
          )
          .filter(Boolean)
      )
    ];


  const lista =
    [
      ...STATUS,
      ...statusExistentes
    ];


  [
    ...new Set(lista)
  ]
    .forEach(
      status => {

        const option =
          document.createElement(
            'option'
          );


        option.value =
          status;


        option.textContent =
          formatarRotulo(
            status
          );


        select.appendChild(
          option
        );

      }
    );


  select.value =
    valorAtual || 'todos';

}


function gerarOpcoesStatusHtml(
  statusAtual
) {

  const lista =
    [
      ...STATUS,
      statusAtual
    ].filter(Boolean);


  return [
    ...new Set(lista)
  ]
    .map(
      status => `

        <option
          value="${status}"
          ${
            status === statusAtual
              ? 'selected'
              : ''
          }
        >

          ${formatarRotulo(
            status
          )}

        </option>

      `
    )
    .join('');

}


/* =========================================================
   ALTERAR STATUS
========================================================= */

function adicionarEventosStatus() {

  document
    .querySelectorAll(
      '.status-select'
    )
    .forEach(
      select => {

        select.addEventListener(
          'change',
          alterarStatus
        );

      }
    );

}


async function alterarStatus(evento) {

  const select =
    evento.target;


  const id =
    select.dataset.id;


  const novoStatus =
    select.value;


  select.disabled = true;


  try {

    const resposta =
      await fetch(
        API_URL,
        {

          method: 'POST',

          headers: {

            'Content-Type':
              'text/plain;charset=utf-8'

          },

          body:
            JSON.stringify({

              acao:
                'atualizar',

              id_candidatura:
                id,

              status_atual:
                novoStatus

            })

        }
      );


    if (!resposta.ok) {

      throw new Error(
        'Erro ao atualizar status'
      );

    }


    await Promise.all([

      carregarCandidaturas(),

      carregarDashboard(),

      atualizarContadores()

    ]);


  } catch (erro) {

    console.error(
      'Erro ao atualizar status:',
      erro
    );


    alert(
      'Não foi possível atualizar o status.'
    );


    select.disabled = false;

  }

}


/* =========================================================
   DETALHES
========================================================= */

function adicionarEventosDetalhes() {

  document
    .querySelectorAll(
      '.btn-detalhes'
    )
    .forEach(
      botao => {

        botao.addEventListener(
          'click',
          () =>
            abrirDetalhes(
              botao.dataset.id
            )
        );

      }
    );

}


async function abrirDetalhes(
  id
) {

  try {

    const resposta =
      await fetch(
        `${API_URL}?id=${encodeURIComponent(id)}`
      );


    if (!resposta.ok) {

      throw new Error(
        'Erro ao buscar candidatura'
      );

    }


    const candidatura =
      await resposta.json();


    if (!candidatura) {

      throw new Error(
        'Candidatura não encontrada'
      );

    }


    document.getElementById(
      'detalhesEmpresa'
    ).textContent =
      candidatura.empresa ||
      'Sem empresa';


    document.getElementById(
      'detalhesVaga'
    ).textContent =
      candidatura.vaga ||
      'Sem vaga';


    const campos = [

      [
        'Data da candidatura',
        formatarData(
          candidatura.data_candidatura
        )
      ],

      [
        'Status',
        formatarRotulo(
          candidatura.status_atual
        )
      ],

      [
        'Resultado',
        formatarRotulo(
          candidatura.resultado
        )
      ],

      [
        'Teve retorno',
        formatarRotulo(
          candidatura.teve_retorno
        )
      ],

      [
        'Salário mínimo',
        candidatura.salario_min || '-'
      ],

      [
        'Salário máximo',
        candidatura.salario_max || '-'
      ],

      [
        'Salário informado',
        candidatura.salario_informado || '-'
      ],

      [
        'Tipo de contratação',
        formatarRotulo(
          candidatura.tipo_contratacao
        ) || '-'
      ],

      [
        'Modalidade',
        formatarRotulo(
          candidatura.modalidade
        ) || '-'
      ],

      [
        'Localização',
        candidatura.localizacao || '-'
      ],

      [
        'Plataforma',
        formatarRotulo(
          candidatura.plataforma
        ) || '-'
      ],

      [
        'Dias em processo',
        candidatura.dias_em_processo !== undefined
          ? candidatura.dias_em_processo
          : '-'
      ],

      [
        'Última atualização',
        formatarData(
          candidatura.ultima_atualizacao
        )
      ],

      [
        'Observações',
        candidatura.observacoes || '-'
      ]

    ];


    const conteudo =
      document.getElementById(
        'detalhesConteudo'
      );


    conteudo.innerHTML = '';


    campos.forEach(
      ([label, valor]) => {

        const bloco =
          document.createElement(
            'div'
          );


        bloco.className =
          'detalhe-bloco';


        if (
          label === 'Observações'
        ) {

          bloco.classList.add(
            'full'
          );

        }


        bloco.innerHTML = `

          <span class="detalhe-bloco-label">

            ${label}

          </span>

          <span class="detalhe-bloco-valor">

            ${escaparHtml(
              String(valor)
            )}

          </span>

        `;


        conteudo.appendChild(
          bloco
        );

      }
    );


    const link =
      document.getElementById(
        'detalhesLinkVaga'
      );


    if (
      candidatura.link_vaga
    ) {

      link.href =
        candidatura.link_vaga;

      link.classList.remove(
        'oculto'
      );

    } else {

      link.removeAttribute(
        'href'
      );

      link.classList.add(
        'oculto'
      );

    }


    document
      .getElementById(
        'modalDetalhes'
      )
      .classList.add(
        'ativo'
      );


  } catch (erro) {

    console.error(
      'Erro ao abrir detalhes:',
      erro
    );


    alert(
      'Não foi possível carregar os detalhes da candidatura.'
    );

  }

}


/* =========================================================
   NOVA CANDIDATURA
========================================================= */

function abrirModal() {

  const modal =
    document.getElementById(
      'modalCandidatura'
    );


  modal.classList.add(
    'ativo'
  );


  const campoData =
    document.getElementById(
      'dataCandidatura'
    );


  if (!campoData.value) {

    campoData.value =
      obterDataHoje();

  }

}


function fecharModal() {

  document
    .getElementById(
      'modalCandidatura'
    )
    .classList.remove(
      'ativo'
    );

}


function fecharModalDetalhes() {

  document
    .getElementById(
      'modalDetalhes'
    )
    .classList.remove(
      'ativo'
    );

}


/* =========================================================
   CRIAR CANDIDATURA
========================================================= */

async function criarCandidatura(
  evento
) {

  evento.preventDefault();


  if (
    salvandoCandidatura
  ) {

    return;

  }


  salvandoCandidatura =
    true;


  const botaoSalvar =
    document.querySelector(
      '#formCandidatura button[type="submit"]'
    );


  const textoOriginal =
    botaoSalvar.textContent;


  botaoSalvar.disabled =
    true;


  botaoSalvar.textContent =
    'Salvando...';


  botaoSalvar.style.opacity =
    '0.6';


  botaoSalvar.style.cursor =
    'not-allowed';


  const dados = {

    data_candidatura:
      document.getElementById(
        'dataCandidatura'
      ).value,

    empresa:
      document.getElementById(
        'empresa'
      ).value,

    vaga:
      document.getElementById(
        'vaga'
      ).value,

    salario_min:
      document.getElementById(
        'salarioMin'
      ).value,

    salario_max:
      document.getElementById(
        'salarioMax'
      ).value,

    salario_informado:
      document.getElementById(
        'salarioInformado'
      ).value,

    tipo_contratacao:
      document.getElementById(
        'tipoContratacao'
      ).value,

    modalidade:
      document.getElementById(
        'modalidade'
      ).value,

    localizacao:
      document.getElementById(
        'localizacao'
      ).value,

    plataforma:
      document.getElementById(
        'plataforma'
      ).value,

    link_vaga:
      document.getElementById(
        'linkVaga'
      ).value,

    status_atual:
      'candidatura enviada',

    teve_retorno:
      'não',

    resultado:
      'em andamento',

    observacoes:
      document.getElementById(
        'observacoes'
      ).value

  };


  try {

    const resposta =
      await fetch(
        API_URL,
        {

          method: 'POST',

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


    if (!resposta.ok) {

      throw new Error(
        'Erro ao criar candidatura'
      );

    }


    const resultado =
      await resposta.json();


    console.log(
      'Candidatura criada:',
      resultado
    );


    fecharModal();


    document
      .getElementById(
        'formCandidatura'
      )
      .reset();


    await Promise.all([

      carregarCandidaturas(),

      carregarDashboard(),

      atualizarContadores()

    ]);


  } catch (erro) {

    console.error(
      'Erro ao criar candidatura:',
      erro
    );


    alert(
      'Não foi possível criar a candidatura.'
    );


  } finally {

    salvandoCandidatura =
      false;


    botaoSalvar.disabled =
      false;


    botaoSalvar.textContent =
      textoOriginal;


    botaoSalvar.style.opacity =
      '';


    botaoSalvar.style.cursor =
      '';

  }

}


/* =========================================================
   DATAS
========================================================= */

function obterDataHoje() {

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


  return `${ano}-${mes}-${dia}`;

}


function formatarData(
  valor
) {

  if (!valor) {
    return '-';
  }


  const texto =
    String(valor)
      .substring(
        0,
        10
      );


  const partes =
    texto.split('-');


  if (
    partes.length !== 3
  ) {

    return valor;

  }


  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarRotulo(
  valor
) {

  if (!valor) {
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


/* =========================================================
   SEGURANÇA
========================================================= */

function escaparHtml(
  valor
) {

  return String(valor)
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


/* =========================================================
   TROCA DE ABA
========================================================= */

async function trocarVisao(
  novaVisao
) {

  if (
    novaVisao === visaoAtual
  ) {

    return;

  }


  visaoAtual =
    novaVisao;


  document
    .querySelectorAll(
      '.aba-candidaturas'
    )
    .forEach(
      aba => {

        aba.classList.toggle(
          'ativa',
          aba.dataset.visao ===
            visaoAtual
        );

      }
    );


  const filtro =
    document.getElementById(
      'filtroStatus'
    );


  filtro.value =
    'todos';


  await carregarCandidaturas();

}


/* =========================================================
   EVENTOS
========================================================= */

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
    'fecharModal'
  )
  .addEventListener(
    'click',
    fecharModal
  );


document
  .getElementById(
    'cancelarModal'
  )
  .addEventListener(
    'click',
    fecharModal
  );


document
  .getElementById(
    'fecharDetalhes'
  )
  .addEventListener(
    'click',
    fecharModalDetalhes
  );


document
  .getElementById(
    'formCandidatura'
  )
  .addEventListener(
    'submit',
    criarCandidatura
  );


document
  .getElementById(
    'filtroStatus'
  )
  .addEventListener(
    'change',
    renderizarCandidaturas
  );


document
  .getElementById(
    'ordenacao'
  )
  .addEventListener(
    'change',
    renderizarCandidaturas
  );


document
  .getElementById(
    'filtroMes'
  )
  .addEventListener(
    'change',
    carregarDashboard
  );


document
  .getElementById(
    'abaAtivas'
  )
  .addEventListener(
    'click',
    () =>
      trocarVisao(
        'ativas'
      )
  );


document
  .getElementById(
    'abaEncerradas'
  )
  .addEventListener(
    'click',
    () =>
      trocarVisao(
        'encerradas'
      )
  );


/* =========================================================
   FECHAR MODAL CLICANDO FORA
========================================================= */

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
    'modalDetalhes'
  )
  .addEventListener(
    'click',
    evento => {

      if (
        evento.target.id ===
        'modalDetalhes'
      ) {

        fecharModalDetalhes();

      }

    }
  );


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

preencherFiltroMes();

carregarDashboard();

carregarCandidaturas();

atualizarContadores();
