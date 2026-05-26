// ============ UTILITÁRIOS REPARAUTO ============

/**
 * Formata um número para o formato português (ex: 1.500 €)
 */
export function formatarPreco(valor) {
  if (valor == null || isNaN(valor)) return '0 €';
  return Number(valor).toLocaleString('pt-PT') + ' €';
}

/**
 * Gera um ID único para anúncios
 */
export function gerarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Valida email simples
 */
export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida telefone português (9 dígitos, começando com 9)
 */
export function validarTelefone(tel) {
  return /^9\d{8}$/.test(tel.replace(/\s/g, ''));
}

/**
 * Renderiza descrição com formatação simples (bold, listas)
 */
export function renderDescricao(texto) {
  if (!texto) return '';

  let escaped = texto
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');

  // Bold: **texto**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Listas: * item ou - item
  const lines = escaped.split('\n');
  let inList = false;
  const result = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) {
        result.push('<ul class="list-disc pl-5 my-2 space-y-1">');
        inList = true;
      }
      result.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }
  if (inList) {
    result.push('</ul>');
  }

  return result.join('<br>').replace(/<\/ul><br>/g, '</ul>').replace(/<br><ul/g, '<ul');
}

/**
 * Renderiza foto ou emoji — retorna objeto React (JSX compatível)
 */
export function renderFoto(foto, classes = 'w-full h-full object-cover') {
  if (
    foto &&
    (foto.startsWith('data:image/') ||
      foto.startsWith('blob:') ||
      foto.endsWith('.png') ||
      foto.endsWith('.jpg') ||
      foto.endsWith('.jpeg') ||
      foto.includes('images/'))
  ) {
    // Return a plain img tag descriptor — callers use dangerouslySetInnerHTML or this img element
    return { type: 'img', src: foto, classes };
  }
  const emoji = foto || '🚗';
  return { type: 'emoji', emoji };
}

/**
 * Obtém a data atual formatada (ISO)
 */
export function dataAtualISO() {
  return new Date().toISOString();
}
