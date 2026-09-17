const API_URL = 'https://script.google.com/macros/s/AKfycbxVubVo3fCVQjYBnG5k40vuppIvDzyPS_xDVVvxWAfB3IKuJc_vIcf0ZiDJUvU7FY4t/exec';

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
