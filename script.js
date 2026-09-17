const API_URL = 'https://script.google.com/macros/s/AKfycbxVubVo3fCVQjYBnG5k40vuppIvDzyPS_xDVVvxWAfB3IKuJc_vIcf0ZiDJUvU7FY4t/exec';

let candidaturas = [];


// ==============================
// DASHBOARD
// ==============================

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

  } catch (erro) {
    console.error('Erro ao carregar dashboard:', erro);
  }
}


// ==============================
// LISTAR CANDIDATURAS
// ==============================

async function carregarCandidaturas() {
  try {
    const resposta = await fetch(API_URL);
    candidaturas = await resposta.json();

    renderizarCandidaturas();

  } catch (erro) {
    console.error('Erro ao carregar candidaturas:', erro);

    document.getElementById('listaCandidaturas').innerHTML = `
      <p class="empty-state">
        Não foi possível carregar as candidaturas.
      </p>
    `;
  }
}


// ==============================
// RENDERIZAR CANDIDATURAS
// ==============================

function renderizarCandidaturas() {

  const lista = document.getElementById('listaCandidaturas');

  const filtro = document.getElementById('filtroStatus').value;

  const candidaturasFiltradas = filtro
    ? candidaturas.filter(
        candidatura => candidatura.status_atual === filtro
      )
    : candidaturas;


  if (candidaturasFiltradas.length === 0) {

    lista.innerHTML = `
      <p class="empty-state">
        Nenhuma candidatura encontrada.
      </p>
    `;

    return;
  }


  lista.innerHTML = candidaturasFiltradas.map(candidatura => `

    <div class="candidatura-card">

      <div class="candidatura-principal">

        <div>
          <h3>${candidatura.vaga || 'Sem vaga'}</h3>
          <p class="empresa">
            ${candidatura.empresa || 'Empresa não informada'}
          </p>
        </div>

        <span class="status">
          ${candidatura.status_atual || 'Sem status'}
        </span>

      </div>


      <div class="candidatura-detalhes">

        <div>
          <span>Data</span>
          <strong>${formatarData(candidatura.data_candidatura)}</strong>
        </div>

        <div>
          <span>Modalidade</span>
          <strong>${candidatura.modalidade || '-'}</strong>
        </div>

        <div>
          <span>Contratação</span>
          <strong>${candidatura.tipo_contratacao || '-'}</strong>
        </div>

        <div>
          <span>Plataforma</span>
          <strong>${candidatura.plataforma || '-'}</strong>
        </div>

      </div>


      <div class="candidatura-footer">

        <span>
          ID: ${candidatura.id_candidatura}
        </span>

        ${
          candidatura.link_vaga
            ? `<a href="${candidatura.link_vaga}" target="_blank">
                Ver vaga
              </a>`
            : ''
        }

      </div>

    </div>

  `).join('');
}


// ==============================
// FORMATAR DATA
// ==============================

function formatarData(data) {

  if (!data) {
    return '-';
  }

  const partes = data.split('-');

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return data;
}


// ==============================
// FILTRO
// ==============================

document.getElementById('filtroStatus').addEventListener(
  'change',
  renderizarCandidaturas
);


// ==============================
// MODAL
// ==============================

const modal = document.getElementById('modalCandidatura');
const abrirModalBtn = document.getElementById('novaCandidaturaBtn');
const fecharModalBtn = document.getElementById('fecharModal');
const cancelarModalBtn = document.getElementById('cancelarModal');


function abrirModal() {

  modal.classList.remove('hidden');

  document.getElementById('data_candidatura').value =
    new Date().toISOString().split('T')[0];

  document.getElementById('empresa').focus();
}


function fecharModal() {
  modal.classList.add('hidden');
}


abrirModalBtn.addEventListener('click', abrirModal);

fecharModalBtn.addEventListener('click', fecharModal);

cancelarModalBtn.addEventListener('click', fecharModal);


modal.addEventListener('click', function (evento) {

  if (evento.target === modal) {
    fecharModal();
  }

});


// ==============================
// CRIAR CANDIDATURA
// ==============================

const formCandidatura =
  document.getElementById('formCandidatura');


formCandidatura.addEventListener(
  'submit',
  async function (evento) {

    evento.preventDefault();

    const botaoSalvar =
      formCandidatura.querySelector(
        'button[type="submit"]'
      );

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = 'Salvando...';


    const dados = {

      empresa:
        document.getElementById('empresa').value,

      vaga:
        document.getElementById('vaga').value,

      data_candidatura:
        document.getElementById('data_candidatura').value,

      salario_informado:
        document.getElementById('salario_informado').value,

      tipo_contratacao:
        document.getElementById('tipo_contratacao').value,

      modalidade:
        document.getElementById('modalidade').value,

      localizacao:
        document.getElementById('localizacao').value,

      plataforma:
        document.getElementById('plataforma').value,

      link_vaga:
        document.getElementById('link_vaga').value,

      observacoes:
        document.getElementById('observacoes').value

    };


    try {

      const resposta = await fetch(API_URL, {

        method: 'POST',

        body: JSON.stringify(dados)

      });


      const resultado = await resposta.json();


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


      // Atualiza dashboard e lista

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


// ==============================
// INICIALIZAÇÃO
// ==============================

carregarDashboard();

carregarCandidaturas();const cancelarModalBtn = document.getElementById('cancelarModal');


function abrirModal() {
  modal.classList.remove('hidden');

  document.getElementById('data_candidatura').value =
    new Date().toISOString().split('T')[0];

  document.getElementById('empresa').focus();
}


function fecharModal() {
  modal.classList.add('hidden');
}


abrirModalBtn.addEventListener('click', abrirModal);

fecharModalBtn.addEventListener('click', fecharModal);

cancelarModalBtn.addEventListener('click', fecharModal);


// Fecha ao clicar fora do formulário

modal.addEventListener('click', function (evento) {
  if (evento.target === modal) {
    fecharModal();
  }
});


// ==============================
// CRIAR CANDIDATURA
// ==============================

const formCandidatura = document.getElementById('formCandidatura');


formCandidatura.addEventListener('submit', async function (evento) {

  evento.preventDefault();

  const botaoSalvar = formCandidatura.querySelector(
    'button[type="submit"]'
  );

  botaoSalvar.disabled = true;
  botaoSalvar.textContent = 'Salvando...';


  const dados = {
    empresa: document.getElementById('empresa').value,
    vaga: document.getElementById('vaga').value,
    data_candidatura: document.getElementById('data_candidatura').value,
    salario_informado: document.getElementById('salario_informado').value,
    tipo_contratacao: document.getElementById('tipo_contratacao').value,
    modalidade: document.getElementById('modalidade').value,
    localizacao: document.getElementById('localizacao').value,
    plataforma: document.getElementById('plataforma').value,
    link_vaga: document.getElementById('link_vaga').value,
    observacoes: document.getElementById('observacoes').value
  };


  try {

    const resposta = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      throw new Error('Não foi possível salvar a candidatura.');
    }


    alert(
      `Candidatura criada com sucesso!\nID: ${resultado.id_candidatura}`
    );


    formCandidatura.reset();

    fecharModal();

    carregarDashboard();


  } catch (erro) {

    console.error('Erro ao criar candidatura:', erro);

    alert(
      'Não foi possível salvar a candidatura. Verifique o console para mais detalhes.'
    );

  } finally {

    botaoSalvar.disabled = false;
    botaoSalvar.textContent = 'Salvar candidatura';

  }

});


// ==============================
// INICIALIZAÇÃO
// ==============================

carregarDashboard();
