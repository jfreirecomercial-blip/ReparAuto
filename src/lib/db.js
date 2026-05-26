import {
  DB_VERSION,
  DB_VERSION_KEY,
  STORAGE_KEY_CARROS,
  STORAGE_KEY_PECAS,
} from './constants';

// ============ SEED DATA ============

const defaultCarros = [
  {
    id: 1,
    marca: 'Renault',
    modelo: 'Clio 1.5 dCi',
    anoFabricacao: 2007,
    anoModelo: 2008,
    preco: 600,
    km: 210000,
    combustivel: 'Diesel',
    cambio: 'Manual',
    cor: 'Cinzento',
    portas: 5,
    local: 'Braga',
    descricao:
      'Viatura comercial com alguns problemas de motor. **Motor de arranque avariado.**\nIdeal para quem quer reparar.\n\n* Direção assistida\n* Fecho centralizado\n* Vidros elétricos',
    estadoVeiculo: 'manutencao',
    tiposManutencao: ['Mecânica', 'Elétrica'],
    manutencaoOutro: '',
    temOrcamento: true,
    orcamentoTexto:
      'Diagnóstico elétrico e motor de arranque novo: 250€ com mão de obra incluída.',
    incluirMecanicoNome: true,
    mecanicoNome: 'Auto Oficina Rapidez',
    incluirMecanicoTelefone: true,
    mecanicoTelefone: '912345678',
    fotos: ['images/clio.png', '🔧', '⚠️'],
    criador: 'admin@reparauto.pt',
    rodando: false,
    inspecao: false,
  },
  {
    id: 2,
    marca: 'Peugeot',
    modelo: '206 1.1',
    anoFabricacao: 2004,
    anoModelo: 2004,
    preco: 450,
    km: 195000,
    combustivel: 'Gasolina',
    cambio: 'Manual',
    cor: 'Azul',
    portas: 3,
    local: 'Porto',
    descricao:
      'Peugeot 206 sinistrado na parte frontal. Ideal para peças ou reparação profunda.\n\n* Motor arranca mas radiador está partido\n* Interiores em bom estado\n* Farol esquerdo partido',
    estadoVeiculo: 'manutencao',
    tiposManutencao: ['Mecânica', 'Pintura e funilaria', 'Lataria / amassados'],
    manutencaoOutro: 'Radiador partido',
    temOrcamento: false,
    orcamentoTexto: '',
    incluirMecanicoNome: false,
    mecanicoNome: '',
    incluirMecanicoTelefone: false,
    mecanicoTelefone: '',
    fotos: ['images/peugeot206.png', '🛠️', '📦'],
    criador: 'admin@reparauto.pt',
    rodando: false,
    inspecao: false,
  },
  {
    id: 3,
    marca: 'Volkswagen',
    modelo: 'Golf IV 1.9 TDI',
    anoFabricacao: 2003,
    anoModelo: 2003,
    preco: 900,
    km: 280000,
    combustivel: 'Diesel',
    cambio: 'Manual',
    cor: 'Preto',
    portas: 5,
    local: 'Coimbra',
    descricao:
      'Excelente motor 1.9 TDI de 110cv. Anda diariamente mas precisa de pastilhas e discos novos urgentemente.\n\n* Revisão feita há 5.000 km\n* AC a funcionar\n* Interiores desgastados',
    estadoVeiculo: 'manutencao',
    tiposManutencao: ['Mecânica'],
    manutencaoOutro: '',
    temOrcamento: true,
    orcamentoTexto:
      'Substituição de discos e pastilhas frontais e traseiras: 180€ com mão de obra',
    incluirMecanicoNome: true,
    mecanicoNome: 'Mecânica do Zé',
    incluirMecanicoTelefone: false,
    mecanicoTelefone: '',
    fotos: ['images/golf4.png', '✅', '🔩'],
    criador: 'admin@reparauto.pt',
    rodando: true,
    inspecao: true,
  },
  {
    id: 4,
    marca: 'BMW',
    modelo: '320d Coupé (Valor Livre)',
    anoFabricacao: 2011,
    anoModelo: 2012,
    preco: 12400,
    km: 185000,
    combustivel: 'Diesel',
    cambio: 'Manual',
    cor: 'Branco',
    portas: 3,
    local: 'Lisboa',
    descricao:
      'BMW 320d Coupé em excelente estado de conservação. Quilómetros reais e comprovados.\n\n* Estofos em pele\n* Faróis Bi-Xénon\n* Sensores de estacionamento\n* Jantes de liga leve',
    estadoVeiculo: 'pronto',
    tiposManutencao: [],
    manutencaoOutro: '',
    temOrcamento: false,
    orcamentoTexto: '',
    incluirMecanicoNome: false,
    mecanicoNome: '',
    incluirMecanicoTelefone: false,
    mecanicoTelefone: '',
    fotos: ['images/bmw320d.png', '✨', '💎'],
    criador: 'admin@reparauto.pt',
  },
  {
    id: 5,
    marca: 'Opel',
    modelo: 'Corsa B 1.2',
    anoFabricacao: 1999,
    anoModelo: 1999,
    preco: 350,
    km: 165000,
    combustivel: 'Gasolina',
    cambio: 'Manual',
    cor: 'Verde',
    portas: 5,
    local: 'Lisboa',
    descricao:
      'Carro parado há 2 anos numa garagem. Não pega, provavelmente bateria ou bomba de combustível avariada.\nTem alguma ferrugem na porta do condutor.\n\n* Pintura queimada do sol\n* Pneus ressequidos',
    estadoVeiculo: 'manutencao',
    tiposManutencao: ['Mecânica', 'Elétrica', 'Pintura e funilaria', 'Lataria / amassados'],
    manutencaoOutro: 'Parado há muito tempo',
    temOrcamento: false,
    orcamentoTexto: '',
    incluirMecanicoNome: false,
    mecanicoNome: '',
    incluirMecanicoTelefone: false,
    mecanicoTelefone: '',
    fotos: ['🚐', '⏳', '🕸️'],
    criador: 'admin@reparauto.pt',
    rodando: false,
    inspecao: false,
  },
  {
    id: 6,
    marca: 'Mercedes-Benz',
    modelo: 'C220 CDI (Valor Livre)',
    anoFabricacao: 2009,
    anoModelo: 2009,
    preco: 8900,
    km: 250000,
    combustivel: 'Diesel',
    cambio: 'Automático',
    cor: 'Preto',
    portas: 4,
    local: 'Porto',
    descricao:
      'Mercedes C220 CDI nacional, caixa automática. Anda diariamente sem qualquer problema.\n\n* GPS e Bluetooth\n* Tecto de abrir\n* Bancos elétricos com memória',
    estadoVeiculo: 'pronto',
    tiposManutencao: [],
    manutencaoOutro: '',
    temOrcamento: false,
    orcamentoTexto: '',
    incluirMecanicoNome: false,
    mecanicoNome: '',
    incluirMecanicoTelefone: false,
    mecanicoTelefone: '',
    fotos: ['images/mercedes.png', '🚗', '⚙️'],
    criador: 'admin@reparauto.pt',
  },
  {
    id: 7,
    marca: 'Seat',
    modelo: 'Ibiza 1.4',
    anoFabricacao: 2006,
    anoModelo: 2006,
    preco: 750,
    km: 230000,
    combustivel: 'Gasolina',
    cambio: 'Manual',
    cor: 'Vermelho',
    portas: 5,
    local: 'Faro',
    descricao:
      'Seat Ibiza 1.4 a gasolina. Anda diariamente mas apresenta luz de erro de motor no painel (EGR ou sonda lambda) e o ar condicionado não arrefece.\n\n* Jantes especiais\n* Vidros elétricos à frente\n* Fecho central',
    estadoVeiculo: 'manutencao',
    tiposManutencao: ['Eletrônica', 'Ar-condicionado'],
    manutencaoOutro: '',
    temOrcamento: true,
    orcamentoTexto: 'Diagnóstico de erro EGR + carregamento de AC: 120€',
    incluirMecanicoNome: false,
    mecanicoNome: '',
    incluirMecanicoTelefone: true,
    mecanicoTelefone: '933567890',
    fotos: ['🚗', '⚡', '🔌'],
    criador: 'admin@reparauto.pt',
    rodando: true,
    inspecao: true,
  },
];

const defaultPecas = [
  {
    id: 1,
    tipo: 'venda',
    titulo: 'Motor 1.9 TDI ASZ 130cv',
    categoria: 'Motor e Transmissão',
    marcaCarro: 'Seat',
    modeloCarro: 'Ibiza 6L',
    preco: 450,
    estado: 'Usado',
    local: 'Braga',
    contacto: '912345678',
    foto: '⚙️',
    criador: 'admin@reparauto.pt',
    descricao:
      'Motor em excelente estado de funcionamento. Retirado de veículo acidentado na traseira. Tem cerca de 210.000 km. Vendido completo com turbo original.',
  },
  {
    id: 2,
    tipo: 'desmonte',
    titulo: 'Peugeot 206 1.1 para desmonte completo',
    categoria: 'Carro Completo p/ Desmonte',
    marcaCarro: 'Peugeot',
    modeloCarro: '206',
    preco: 300,
    estado: 'Usado',
    local: 'Porto',
    contacto: '933567890',
    foto: '🚗',
    criador: 'carlos@email.com',
    descricao:
      'Carro completo para peças. Chaparia em bom estado, interiores impecáveis. Motor parado. Vendo peças individuais ou o conjunto.',
  },
  {
    id: 3,
    tipo: 'procura',
    titulo: 'Procuro Farol Frontal Esquerdo Halogéneo',
    categoria: 'Iluminação e Óticas',
    marcaCarro: 'Renault',
    modeloCarro: 'Clio III',
    preco: 0,
    estado: 'Usado',
    local: 'Lisboa',
    contacto: '922456789',
    foto: '🔍',
    criador: 'admin@reparauto.pt',
    descricao:
      'Procuro farol esquerdo (lado condutor) original e em bom estado para Renault Clio de 2007 (Fase 1).',
  },
];

// ============ FUNÇÕES DE DADOS ============

/**
 * Inicializa a base de dados (migração de versão)
 */
export function initDatabase() {
  const versaoAtual = localStorage.getItem(DB_VERSION_KEY);
  const carrosExist = localStorage.getItem(STORAGE_KEY_CARROS);
  const pecasExist = localStorage.getItem(STORAGE_KEY_PECAS);

  if (versaoAtual !== DB_VERSION || !carrosExist || !pecasExist) {
    localStorage.setItem(STORAGE_KEY_CARROS, JSON.stringify(defaultCarros));
    localStorage.setItem(STORAGE_KEY_PECAS, JSON.stringify(defaultPecas));
    localStorage.setItem(DB_VERSION_KEY, DB_VERSION);
    localStorage.removeItem('oficinas_reparauto');
  }
}

/**
 * Retorna a lista de carros do localStorage
 */
export function getCarros() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CARROS)) || [];
  } catch {
    return [];
  }
}

/**
 * Salva a lista de carros no localStorage
 */
export function setCarros(lista) {
  localStorage.setItem(STORAGE_KEY_CARROS, JSON.stringify(lista));
}

/**
 * Retorna a lista de peças do localStorage
 */
export function getPecas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PECAS)) || [];
  } catch {
    return [];
  }
}

/**
 * Salva a lista de peças no localStorage
 */
export function setPecas(lista) {
  localStorage.setItem(STORAGE_KEY_PECAS, JSON.stringify(lista));
}

/**
 * Retorna os dados do seed (para reset)
 */
export function getDefaultCarros() {
  return JSON.parse(JSON.stringify(defaultCarros));
}

export function getDefaultPecas() {
  return JSON.parse(JSON.stringify(defaultPecas));
}
