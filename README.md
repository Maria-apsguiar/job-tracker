# 📊 Job Tracker — Sistema de Gestão de Candidaturas

Aplicação web desenvolvida para **centralizar, acompanhar e analisar processos seletivos**, transformando o acompanhamento das candidaturas em dados estruturados e indicadores para apoiar a tomada de decisões durante a busca por emprego.

🔗 **Aplicação:** https://job-tracker-neon-alpha.vercel.app

---

## 🎯 Sobre o projeto

Durante uma busca por emprego, informações sobre candidaturas podem ficar distribuídas entre diferentes plataformas, e-mails, anotações e planilhas.

O **Job Tracker** foi desenvolvido como uma solução para centralizar essas informações em uma única aplicação, permitindo registrar candidaturas, acompanhar a evolução dos processos, controlar follow-ups e visualizar indicadores da busca por oportunidades.

Além de solucionar uma necessidade prática, o projeto foi desenvolvido como um **projeto de portfólio**, permitindo aplicar conceitos de análise e estruturação de dados, desenvolvimento de aplicações, APIs, automação e visualização de informações.

---

## 🚀 Funcionalidades

### 📋 Gestão de candidaturas

* Cadastro de novas candidaturas
* Atualização de informações
* Acompanhamento do status do processo seletivo
* Registro de empresa, vaga, faixa salarial, modalidade e localização
* Registro da plataforma de origem da candidatura
* Controle de retorno
* Registro de observações

### 📈 Dashboard

O sistema apresenta indicadores para acompanhamento da busca por emprego, incluindo:

* Total de candidaturas
* Processos em andamento
* Processos encerrados
* Retornos recebidos
* Evolução das candidaturas ao longo do tempo
* Distribuição das candidaturas por plataforma
* Indicadores relacionados aos resultados dos processos

### 📝 Histórico

Cada candidatura possui histórico de alterações, permitindo acompanhar a evolução do processo seletivo e registrar mudanças de status.

### 🔔 Follow-ups

O sistema permite registrar e acompanhar contatos realizados durante os processos seletivos, mantendo informações sobre o tipo e o status de cada follow-up.

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura simples, baseada em frontend, API e uma base de dados estruturada no Google Sheets.

```text
┌──────────────────────────┐
│        FRONTEND          │
│     HTML / CSS / JS      │
└────────────┬─────────────┘
             │
             │ HTTP / API
             ▼
┌──────────────────────────┐
│     GOOGLE APPS SCRIPT   │
│          BACKEND         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      GOOGLE SHEETS       │
│        DATABASE          │
├──────────────────────────┤
│ Candidaturas             │
│ Historico                │
│ Follow_ups               │
│ Config                   │
└──────────────────────────┘
```

O frontend é responsável pela interface e interação com o usuário.

O **Google Apps Script** funciona como backend e API, realizando operações de leitura, criação e atualização dos registros.

O **Google Sheets** funciona como base de dados da aplicação, organizada em diferentes abas de acordo com a finalidade de cada informação.

---

## 🗂️ Estrutura da base de dados

A base é composta pelas seguintes abas:

| Aba            | Descrição                                                 |
| -------------- | --------------------------------------------------------- |
| `Candidaturas` | Armazena os dados principais dos processos seletivos      |
| `Historico`    | Registra alterações e mudanças de status                  |
| `Follow_ups`   | Controla acompanhamentos realizados durante os processos  |
| `Config`       | Armazena listas e configurações utilizadas pela aplicação |

A separação das informações permite organizar os dados de forma estruturada e facilita a utilização dessas informações para análises e indicadores.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia             | Aplicação no projeto                       |
| ---------------------- | ------------------------------------------ |
| **HTML**               | Estrutura da aplicação                     |
| **CSS**                | Estilização e interface                    |
| **JavaScript**         | Lógica do frontend e comunicação com a API |
| **Google Apps Script** | Backend, API e regras de negócio           |
| **Google Sheets**      | Armazenamento e organização dos dados      |
| **Git / GitHub**       | Versionamento e documentação               |
| **Vercel**             | Hospedagem do frontend                     |

---

## 📊 Dados e indicadores

O projeto utiliza os dados das candidaturas para gerar informações que ajudam a compreender o comportamento da busca por emprego.

Entre as análises realizadas estão:

* Volume de candidaturas
* Evolução das candidaturas ao longo do tempo
* Distribuição por plataforma
* Situação atual dos processos
* Retornos recebidos
* Resultados dos processos seletivos
* Processos ainda em andamento

A proposta é ir além do simples registro das candidaturas, utilizando os dados para identificar padrões e acompanhar indicadores da própria estratégia de busca.

---

## 🔄 Fluxo da aplicação

```text
Cadastro da candidatura
          ↓
Registro na base de dados
          ↓
Acompanhamento do processo
          ↓
Atualização de status
          ↓
Registro no histórico
          ↓
Follow-up quando necessário
          ↓
Atualização dos indicadores
          ↓
Análise dos dados
```

---

## 🤖 Uso de IA e Vibe Coding

A Inteligência Artificial foi utilizada como ferramenta de apoio durante o desenvolvimento do projeto.

Entre as aplicações estão:

* Exploração de soluções técnicas
* Estruturação e revisão de código
* Identificação e correção de erros
* Desenvolvimento e evolução de funcionalidades
* Apoio na documentação
* Sugestões de melhorias na interface e na estrutura do projeto

O processo também foi utilizado como experiência prática de **Vibe Coding**, com validação, testes, ajustes e tomada de decisões durante o desenvolvimento.

A utilização de IA não substituiu a compreensão da solução: as funcionalidades foram testadas e ajustadas de acordo com os requisitos do projeto.

---

## 📚 Principais aprendizados

O desenvolvimento do Job Tracker permitiu aplicar, na prática, conceitos relacionados a:

* Estruturação e organização de dados
* Modelagem de uma base de dados
* APIs e integração entre sistemas
* Operações de criação e atualização de registros
* Regras de negócio
* Automação
* Indicadores e KPIs
* Visualização de dados
* Desenvolvimento de aplicações web
* Versionamento com Git e GitHub
* Documentação técnica
* Utilização de Inteligência Artificial no desenvolvimento

Além da parte técnica, o projeto envolveu decisões sobre **quais dados registrar, como organizá-los e quais indicadores poderiam gerar informações úteis para a tomada de decisão**.

---

## 📁 Estrutura do repositório

```text
job-tracker/
│
├── README.md
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── apps-script/
│   ├── Config.gs
│   ├── Candidaturas.gs
│   ├── Historico.gs
│   └── Follow_ups.gs
│
├── database/
│   └── Job_Tracker_Modelo.xlsx
│
├── docs/
│   └── guia-de-replicacao.md
│
└── screenshots/
    ├── dashboard.png
    ├── candidaturas.png
    └── formulario.png
```

---

## 🔁 Como replicar o projeto

O projeto pode ser reproduzido utilizando a planilha modelo e os arquivos disponibilizados neste repositório.

📊 **Planilha modelo:** [`Job_Tracker_Modelo.xlsx`]

📖 **Guia de replicação:** [`guia-de-replicacao.md`](docs/guia-de-replicacao.md)

O guia apresenta o processo de configuração da base de dados, Google Apps Script, API, frontend e publicação da aplicação.

---

## 🚧 Próximas melhorias

Algumas possibilidades de evolução do projeto:

* [ ] Filtros avançados no dashboard
* [ ] Novos indicadores de desempenho
* [ ] Melhorias na responsividade
* [ ] Exportação de relatórios
* [ ] Evolução da gestão de follow-ups
* [ ] Autenticação de usuários
* [ ] Expansão das análises sobre os processos seletivos

---

## 👩‍💻 Sobre o projeto

Este projeto foi desenvolvido como parte da minha transição profissional para a área de **Dados**, com o objetivo de transformar conhecimentos adquiridos durante minha formação em um projeto aplicado e funcional.

O Job Tracker reúne conhecimentos de **dados, tecnologia, negócios e análise**, utilizando uma situação real como contexto para desenvolver uma solução completa, desde a estruturação da base até a disponibilização da aplicação.

---

### 📌 Projeto desenvolvido por Maria Aparecida Sousa Aguiar

**Área de interesse:** Análise de Dados | Business Intelligence | Dados e Automação

[LinkedIn](https://www.linkedin.com/in/mariaaguiar/)
