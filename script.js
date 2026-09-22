/* =========================================================
   SCRIPT.JS — FRONTEND VERCEL
========================================================= */

const API_URL =
  'https://script.google.com/macros/s/AKfycbxVubVo3fCVQjYBnG5k40vuppIvDzyPS_xDVVvxWAfB3IKuJc_vIcf0ZiDJUvU7FY4t/exec';

/* =========================================================
   ESTADO GLOBAL
========================================================= */
let candidaturas = [];
let visaoAtual = 'ativas';
let salvandoCandidatura = false;

let graficoEvolucao = null;
let graficoStatus = null;
let graficoModalidade = null;
let graficoContratacao = null;

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

/* =========================================================
   DASHBOARD
========================================================= */
async function carregarDashboard() {
