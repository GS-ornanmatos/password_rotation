function cksum(str) {
  let crc = 0;
  let length = str.length;
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  crc = 0 ^ (-1);
  for (let i = 0; i < length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

// --- CONFIGURAÇÃO E DADOS ---
const _SEC_RDP = "WyJVc2VyQHtIT1NUfSM3OCIsIkFjY2VzcyN7SE9TVH0hMDQiLCJEZXNrJHtIT1NUfSY5MiIsIlJlbW90ZUB7SE9TVH0jMTEiLCJSZHAje0hPU1R9ITMzIiwiQ2xpZW50JHtIT1NUfSY1NiIsIlNlc3Npb25Ae0hPU1R9Izg4IiwiTmV0IHtIT1NUfSExMSIsIkxpbmskR2F0ZUB7SE9TVH0jNjciXQ==";
const _SEC_ADM = "WyJSb290QHtIT1NUfSNNYXN0ZXIiLCJTZWN1cmUje0hPU1R9IU9uZSIsIlBvd2VyJHtIT1NUfSZBZG0iLCJQcmltZUB7SE9TVH0jU3lzIiwiQm9zcyN7SE9TVH0hTW9kZSIsIlN1cGVyJHtIT1NUfSZVc2VyIiwiS2V5QHtIT1NUfSNBZG1pbiIsIlVsdHJhIHtIT1NUfSFDb3JlIiwiTWVnYSR7SE9TVH0mUm9vdCIsIkFscGhhQHtIT1NUfSNBY2Nlc3MiXQ==";

let SENHAS_RDP, SENHAS_ADMIN;
try {
  SENHAS_RDP = JSON.parse(atob(_SEC_RDP));
  SENHAS_ADMIN = JSON.parse(atob(_SEC_ADM));
} catch (e) {
  console.error("Erro na integridade dos dados de segurança.");
  SENHAS_RDP = [];
  SENHAS_ADMIN = [];
}

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}


function gerarSenhas() {
  const inputHost = document.getElementById('hostname').value;
  const resultArea = document.getElementById('resultArea');

  if (!inputHost.trim()) {
    alert("Por favor, digite o hostname.");
    return;
  }

  const hostClean = inputHost.toLowerCase().replace(/\s/g, '');
  const hostSeed = cksum(hostClean);
  const diaDoAno = getDayOfYear();

  // Garante rotação circular correta (0 a 9)
  const indice = Math.abs((diaDoAno + hostSeed) % 10);

  // Substituição do Template
  const finalRdp = SENHAS_RDP[indice].replace("{HOST}", hostClean);
  const finalAdmin = SENHAS_ADMIN[indice].replace("{HOST}", hostClean);

  // Preenche os campos
  document.getElementById('outRdp').value = finalRdp;
  document.getElementById('outAdmin').value = finalAdmin;

  // Reset visual
  document.getElementById('outRdp').type = 'password';
  document.getElementById('outAdmin').type = 'password';

  // Debug info (opcional, pode remover se quiser mais sigilo)
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  document.getElementById('debugInfo').innerHTML =
    `ID: ${hostSeed.toString(16).toUpperCase()} | IDX: ${indice}`;

  resultArea.style.display = "block";
}

function toggleView(fieldId) {
  const field = document.getElementById(fieldId);
  field.type = (field.type === "password") ? "text" : "password";
}

function copyToClipboard(fieldId) {
  const field = document.getElementById(fieldId);
  field.select();
  field.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(field.value).then(() => {
    const originalColor = field.style.color;
    field.style.color = '#4CAF50';
    setTimeout(() => { field.style.color = originalColor || '#fff'; }, 500);
  });
}
