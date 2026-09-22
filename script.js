const API_URL =
  'https://script.google.com/macros/s/AKfycbxxW-c2KDqG-vm7ej5CLZ8d6AHsT4GUxgiCrpwDYLie-9yNkM4NuNqx1FqKSS7A5_6N/exec';


let candidaturas = [];


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

  const btnNova =
    document.getElementById(
      'btnNovaCandidatura'
    );

  const btnFechar =
    document.getElementById(
      'btnFecharModal'
    );

  const btnCancelar =
    document.getElementById(
      'btnCancelar'
    );

  const modal =
    document.getElementById(
      'modalCandidatura'
    );

  const formulario =
    document.getElementById(
      'formCandidatura'
    );

  const filtro =
    document.getElementById(
      'filtroStatus'
    );


  btnNova.addEventListener(
    'click',
    abrirModal
  );


  btnFechar.addEventListener(
    'click',
    fecharModal
  );


  btnCancelar.addEventListener(
    'click',
    fecharModal
  );


  modal.addEventListener(
    'click',
    evento => {

      if (
        evento.target === modal
      ) {
        fecharModal();
      }

    }
  );


  formulario.addEventListener(
    'submit',
    salvarCandidatura
  );


  filtro.addEventListener(
    'change',
    renderizarCandidaturas
  );

}


/* =========================
   API
========================= */

async function carregarCandidaturas() {

  mostrarMensagem(
    'Carregando candidaturas...'
  );


  try {

    const resposta =
      await fetch(
        API_URL +
        '?acao=listar'
      );


    if (!resposta.ok) {

      throw new Error(
        'Erro HTTP: ' +
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
        'Erro ao carregar candidaturas.'
      );

    }


    candidaturas =
      resultado.dados || [];


    atualizarDashboard();

    renderizarCandidaturas();

    esconderMensagem();


  } catch (erro) {

    console.error(
      'Erro ao carregar candidaturas:',
      erro
    );


    mostrarMensagem(
      'Não foi possível carregar as candidaturas.'
    );

  }

}


/* =========================
   DASHBOARD
========================= */

function atualizarDashboard() {

  const total =
    candidaturas.length;


  const andamento =
    candidaturas.filter(
      candidatura =>
        candidatura.resultado ===
        'em andamento'
    ).length;


  const comRetorno =
    candidaturas.filter(
      candidatura =>
        String(
          candidatura.teve_retorno
        ).toLowerCase() ===
        'sim'
    ).length;


  const aprovadas =
    candidaturas.filter(
      candidatura =>
        candidatura.status_atual ===
        'aprovado' ||
        candidatura.resultado ===
        'encerrado_positivo'
    ).length;


  document.getElementById(
    'totalCandidaturas'
  ).textContent = total;


  document.getElementById(
    'candidaturasAndamento'
  ).textContent = andamento;


  document.getElementById(
    'candidaturasComRetorno'
  ).textContent = comRetorno;


  document.getElementById(
    'candidaturasAprovadas'
  ).textContent = aprovadas;

}


/* =========================
   LISTAGEM
========================= */

function renderizarCandidaturas() {

  const container =
    document.getElementById(
      'listaCandidaturas'
    );


  const filtro =
    document.getElementById(
      'filtroStatus'
    ).value;


  let lista =
    [...candidaturas];


  if (filtro) {

    lista =
      lista.filter(
        candidatura =>
          candidatura.status_atual ===
          filtro
      );

  }


  lista.sort(
    (a, b) => {

      const dataA =
        new Date(
          a.data_candidatura || 0
        );

      const dataB =
        new Date(
          b.data_candidatura || 0
        );

      return dataB - dataA;

    }
  );


  if (lista.length === 0) {

    container.innerHTML = `
      <div class="estado-vazio">
        Nenhuma candidatura encontrada
      </div>
    `;

    return;

  }


  container.innerHTML =
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

  const data =
    formatarData(
      candidatura.data_candidatura
    );


  const modalidade =
    candidatura.modalidade ||
    '-';


  const contratacao =
    candidatura.tipo_contratacao ||
    '-';


  const plataforma =
    candidatura.plataforma ||
    '-';


  const status =
    candidatura.status_atual ||
    '-';


  const link =
    candidatura.link_vaga;


  const linkHtml =
    link
      ? `
        <a
          class="candidatura-link"
          href="${escaparHtml(link)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver vaga ↗
        </a>
      `
      : '';


  return `
    <article class="candidatura-card">

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

        <span class="status-badge">
          ${escaparHtml(status)}
        </span>

      </div>


      <div class="candidatura-info">

        <div class="info-item">

          <span class="info-label">
            Data
          </span>

          <span class="info-value">
            ${data}
          </span>

        </div>


        <div class="info-item">

          <span class="info-label">
            Modalidade
          </span>

          <span class="info-value">
            ${escaparHtml(
              modalidade
            )}
          </span>

        </div>


        <div class="info-item">

          <span class="info-label">
            Contratação
          </span>

          <span class="info-value">
            ${escaparHtml(
              contratacao
            )}
          </span>

        </div>


        <div class="info-item">

          <span class="info-label">
            Plataforma
          </span>

          <span class="info-value">
            ${escaparHtml(
              plataforma
            )}
          </span>

        </div>

      </div>


      <div class="candidatura-footer">

        <span class="candidatura-data">
          ${escaparHtml(
            candidatura.localizacao || ''
          )}
        </span>

        ${linkHtml}

      </div>

    </article>
  `;

}


/* =========================
   NOVA CANDIDATURA
========================= */

async function salvarCandidatura(
  evento
) {

  evento.preventDefault();


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


  const botao =
    formulario.querySelector(
      'button[type="submit"]'
    );


  botao.disabled = true;

  botao.textContent =
    'Salvando...';


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


    const resultado =
      await resposta.json();


    if (
      !resultado.sucesso
    ) {

      throw new Error(
        resultado.erro ||
        'Erro ao criar candidatura.'
      );

    }


    fecharModal();

    formulario.reset();


    await carregarCandidaturas();


  } catch (erro) {

    console.error(
      'Erro ao salvar candidatura:',
      erro
    );


    alert(
      'Não foi possível salvar a candidatura.\n\n' +
      erro.message
    );


  } finally {

    botao.disabled = false;

    botao.textContent =
      'Salvar candidatura';

  }

}


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


  if (!data.value) {

    const hoje =
      new Date();


    const ano =
      hoje.getFullYear();


    const mes =
      String(
        hoje.getMonth() + 1
      ).padStart(2, '0');


    const dia =
      String(
        hoje.getDate()
      ).padStart(2, '0');


    data.value =
      `${ano}-${mes}-${dia}`;

  }

}


function fecharModal() {

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

function mostrarMensagem(
  mensagem
) {

  const elemento =
    document.getElementById(
      'mensagem'
    );


  elemento.textContent =
    mensagem;


  elemento.classList.add(
    'visivel'
  );

}


function esconderMensagem() {

  const elemento =
    document.getElementById(
      'mensagem'
    );


  elemento.textContent =
    '';


  elemento.classList.remove(
    'visivel'
  );

}


/* =========================
   FORMATAÇÃO
========================= */

function formatarData(
  valor
) {

  if (!valor) {
    return '-';
  }


  const data =
    new Date(valor);


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return valor;

  }


  return data.toLocaleDateString(
    'pt-BR',
    {
      timeZone: 'America/Sao_Paulo'
    }
  );

}


/* =========================
   SEGURANÇA
========================= */

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
