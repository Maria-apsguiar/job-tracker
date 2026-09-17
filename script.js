const API_URL = 'https://script.google.com/macros/s/AKfycbxVubVo3fCVQjYBnG5k40vuppIvDzyPS_xDVVvxWAfB3IKuJc_vIcf0ZiDJUvU7FY4t/exec';


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


carregarDashboard();
