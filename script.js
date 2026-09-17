const API_URL = 'https://script.google.com/macros/s/AKfycbxVubVo3fCVQjYBnG5k40vuppIvDzyPS_xDVVvxWAfB3IKuJc_vIcf0ZiDJUvU7FY4t/exec';

let candidaturas = [];

/* =========================
   DASHBOARD
========================= */

async function carregarDashboard() {
  try {
    const resposta = await fetch(`${API_URL}?dashboard=true`);
    const dados = await resposta.json();

    document.getElementById('totalCandidaturas').textContent =
      dados.total_candidaturas;

    document.getElementById('emAndamento').textContent =
      dados.em_andamento;

    document.getElementById('comRetorno').textContent =
      `${dados.taxa_retorno}%`;

    document.getElementById('aprovadas').textContent =
      dados.aprovadas;

    renderizarBarras(
      'graficoStatus',
      dados.por_status
    );

    renderizarBarras(
      'graficoPlataforma',
      dados.por_plataforma
    );

    renderizarBarras(
      'graficoModalidade',
      dados.por_modalidade
    );

    renderizarBarras(
      'graficoContratacao',
      dados.por_tipo_contratacao
    );

  } catch (erro) {
    console.error(
      'Erro ao carregar dashboard:',
      erro
    );
  }
}

function renderizarBarras(elementoId, dados) {
  const elemento =
    document.getElementById(elementoId);

  if (!elemento) {
    return;
  }

  const entradas =
    Object.entries(dados || {});

  if (entradas.length === 0) {
    elemento.innerHTML = `
      <p class="empty-state">
        Sem dados disponíveis.
      </p>
    `;
    return;
  }

  entradas.sort(
    (a, b) => b[1] - a[1]
  );

  const maiorValor =
    Math.max(...entradas.map(item => item[1]));

  elemento.innerHTML =
    entradas.map(([nome, valor]) => {

      const percentual =
        maiorValor > 0
          ? (valor / maiorValor) * 100
          : 0;

      return `
        <div class="barra-item">

          <div class="barra-legenda">
            <span>${formatarRotulo(nome)}</span>
            <strong>${valor}</strong>
          </div>

          <div class="barra-trilha">
            <div
              class="barra-preenchimento"
              style="width: ${percentual}%">
            </div>
          </div>

        </div>
      `;

    }).join('');
}

function formatarRotulo(texto) {
  if (!texto) {
    return '-';
  }

  return texto.charAt(0).toUpperCase() +
    texto.slice(1);
}

/* =========================
   CANDIDATURAS
========================= */

async function carregarCandidaturas() {
  try {
    const resposta =
      await fetch(API_URL);

    candidaturas =
      await resposta.json();

    renderizarCandidaturas();

  } catch (erro) {

    console.error(
      'Erro ao carregar candidaturas:',
      erro
    );

    document.getElementById(
      'listaCandidaturas'
    ).innerHTML = `
      <p class="empty-state">
        Não foi possível carregar as candidaturas.
      </p>
    `;
  }
}

function renderizarCandidaturas() {

  const lista =
    document.getElementById(
      'listaCandidaturas'
    );

  const filtro =
    document.getElementById(
      'filtroStatus'
    ).value;

  const ordenacao =
    document.getElementById(
      'ordenacao'
    ).value;

  let candidaturasFiltradas =
    filtro
      ? candidaturas.filter(
          candidatura =>
            candidatura.status_atual === filtro
        )
      : [...candidaturas];

  candidaturasFiltradas.sort(
    (a, b) => {

      const dataA =
        obterDataCandidatura(
          a.data_candidatura
        );

      const dataB =
        obterDataCandidatura(
          b.data_candidatura
        );

      if (ordenacao === 'mais-antigas') {
        return dataA - dataB;
      }

      return dataB - dataA;
    }
  );

  if (candidaturasFiltradas.length === 0) {

    lista.innerHTML = `
      <p class="empty-state">
        Nenhuma candidatura encontrada.
      </p>
    `;

    return;
  }

  lista.innerHTML =
    candidaturasFiltradas.map(
      candidatura => `

      <div class="candidatura-card">

        <div class="candidatura-principal">

          <div>
            <h3>
              ${candidatura.vaga || 'Sem vaga'}
            </h3>

            <p class="empresa">
              ${candidatura.empresa || 'Empresa não informada'}
            </p>
          </div>

          <select
            class="status-select"
            data-id="${candidatura.id_candidatura}">
            ${gerarOpcoesStatus(
              candidatura.status_atual
            )}
          </select>

        </div>

        <div class="candidatura-detalhes">

          <div>
            <span>Data</span>
            <strong>
              ${formatarData(
                candidatura.data_candidatura
              )}
            </strong>
          </div>

          <div>
            <span>Modalidade</span>
            <strong>
              ${candidatura.modalidade || '-'}
            </strong>
          </div>

          <div>
            <span>Contratação</span>
            <strong>
              ${candidatura.tipo_contratacao || '-'}
            </strong>
          </div>

          <div>
            <span>Plataforma</span>
            <strong>
              ${candidatura.plataforma || '-'}
            </strong>
          </div>

        </div>

        <div class="candidatura-footer">

          <span>
            ID: ${candidatura.id_candidatura}
          </span>

          ${
            candidatura.link_vaga
              ? `
                <a
                  href="${candidatura.link_vaga}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Ver vaga
                </a>
              `
              : ''
          }

        </div>

      </div>

    `
    ).join('');

  adicionarEventosStatus();
}

/* =========================
   STATUS
========================= */

function gerarOpcoesStatus(statusAtual) {

  const status = [

    ['candidatura enviada', 'Candidatura enviada'],

    ['em análise', 'Em análise'],

    ['entrevista rh', 'Entrevista RH'],

    ['entrevista técnica', 'Entrevista técnica'],

    ['teste técnico', 'Teste técnico'],

    ['entrevista gestor', 'Entrevista gestor'],

    ['proposta', 'Proposta'],

    ['aprovado', 'Aprovado'],

    ['negado', 'Negado'],

    ['desisti', 'Desisti']

  ];

  return status.map(
    ([valor, texto]) => `

      <option
        value="${valor}"
        ${valor === statusAtual ? 'selected' : ''}>
        ${texto}
      </option>

    `
  ).join('');
}

function adicionarEventosStatus() {

  const selects =
    document.querySelectorAll(
      '.status-select'
    );

  selects.forEach(
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

  const idCandidatura =
    select.dataset.id;

  const novoStatus =
    select.value;

  const candidatura =
    candidaturas.find(
      item =>
        item.id_candidatura ===
        idCandidatura
    );

  if (!candidatura) {
    return;
  }

  const statusAnterior =
    candidatura.status_atual;

  if (statusAnterior === novoStatus) {
    return;
  }

  select.disabled = true;

  try {

    const resposta =
      await fetch(
        API_URL,
        {
          method: 'POST',

          body: JSON.stringify({
            acao: 'atualizar',
            id_candidatura:
              idCandidatura,
            status_atual:
              novoStatus
          })
        }
      );

    const resultado =
      await resposta.json();

    if (!resultado.sucesso) {

      throw new Error(
        'Não foi possível atualizar o status.'
      );

    }

    candidatura.status_atual =
      novoStatus;

    await carregarDashboard();

    renderizarCandidaturas();

  } catch (erro) {

    console.error(
      'Erro ao atualizar status:',
      erro
    );

    alert(
      'Não foi possível atualizar o status.'
    );

    select.value =
      statusAnterior;

  } finally {

    select.disabled = false;

  }
}

/* =========================
   DATAS
========================= */

function obterDataCandidatura(data) {

  if (!data) {
    return new Date(0);
  }

  const dataNormalizada =
    String(data).substring(0, 10);

  const partes =
    dataNormalizada.split('-');

  if (partes.length !== 3) {
    return new Date(0);
  }

  return new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2])
  );
}

function formatarData(data) {

  if (!data) {
    return '-';
  }

  const dataNormalizada =
    String(data).substring(0, 10);

  const partes =
    dataNormalizada.split('-');

  if (partes.length !== 3) {
    return '-';
  }

  return `
    ${partes[2]}/${partes[1]}/${partes[0]}
  `;
}

/* =========================
   FILTROS
========================= */

document
  .getElementById('filtroStatus')
  .addEventListener(
    'change',
    renderizarCandidaturas
  );

document
  .getElementById('ordenacao')
  .addEventListener(
    'change',
    renderizarCandidaturas
  );

/* =========================
   MODAL
========================= */

const modal =
  document.getElementById(
    'modalCandidatura'
  );

const abrirModalBtn =
  document.getElementById(
    'novaCandidaturaBtn'
  );

const fecharModalBtn =
  document.getElementById(
    'fecharModal'
  );

const cancelarModalBtn =
  document.getElementById(
    'cancelarModal'
  );

function abrirModal() {

  modal.classList.remove(
    'hidden'
  );

  document.getElementById(
    'data_candidatura'
  ).value =
    new Date()
      .toISOString()
      .split('T')[0];

  document
    .getElementById('empresa')
    .focus();
}

function fecharModal() {

  modal.classList.add(
    'hidden'
  );
}

abrirModalBtn.addEventListener(
  'click',
  abrirModal
);

fecharModalBtn.addEventListener(
  'click',
  fecharModal
);

cancelarModalBtn.addEventListener(
  'click',
  fecharModal
);

modal.addEventListener(
  'click',
  function (evento) {

    if (evento.target === modal) {
      fecharModal();
    }

  }
);

/* =========================
   NOVA CANDIDATURA
========================= */

const formCandidatura =
  document.getElementById(
    'formCandidatura'
  );

formCandidatura.addEventListener(
  'submit',
  async function (evento) {

    evento.preventDefault();

    const botaoSalvar =
      formCandidatura.querySelector(
        'button[type="submit"]'
      );

    botaoSalvar.disabled = true;

    botaoSalvar.textContent =
      'Salvando...';

    const dados = {

      empresa:
        document.getElementById(
          'empresa'
        ).value,

      vaga:
        document.getElementById(
          'vaga'
        ).value,

      data_candidatura:
        document.getElementById(
          'data_candidatura'
        ).value,

      salario_informado:
        document.getElementById(
          'salario_informado'
        ).value,

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
        ).value,

      plataforma:
        document.getElementById(
          'plataforma'
        ).value,

      link_vaga:
        document.getElementById(
          'link_vaga'
        ).value,

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
            body: JSON.stringify(dados)
          }
        );

      const resultado =
        await resposta.json();

      if (!resultado.sucesso) {

        throw new Error(
          'Não foi possível salvar a candidatura.'
        );

      }

      alert(
        `Candidatura criada com sucesso!\nID: ${resultado.id_candidatura}`
      );

      formCandidatura.reset();

      fecharModal();

      await carregarDashboard();

      await carregarCandidaturas();

    } catch (erro) {

      console.error(
        'Erro ao criar candidatura:',
        erro
      );

      alert(
        'Não foi possível salvar a candidatura.'
      );

    } finally {

      botaoSalvar.disabled = false;

      botaoSalvar.textContent =
        'Salvar candidatura';

    }

  }
);

/* =========================
   INICIALIZAÇÃO
========================= */

carregarDashboard();
carregarCandidaturas();
