#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'reparauto-site';

function parseArgs() {
  const args = process.argv.slice(2);
  const map = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      map[key] = val;
      if (val !== true) i++;
    }
  }
  return map;
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV tem de ter cabeçalho + pelo menos 1 linha');

  const headers = parseLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    if (values.length === 0) continue;

    const record = {};
    headers.forEach((h, idx) => {
      record[h.trim()] = values[idx]?.trim() ?? '';
    });
    records.push(record);
  }

  return records;
}

function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function validateRequired(value, label) {
  if (!value || value === '') throw new Error(`Campo obrigatório em falta: ${label}`);
}

function mapRecord(record, userEmail, userUid, userName) {
  const tipo = record.tipo?.toLowerCase();
  if (!['venda', 'desmonte', 'procura'].includes(tipo)) {
    throw new Error(`tipo inválido: "${record.tipo}". Deve ser venda, desmonte ou procura`);
  }

  validateRequired(record.titulo, 'titulo');
  validateRequired(record.categoria, 'categoria');
  validateRequired(record.marcaCarro, 'marcaCarro');
  validateRequired(record.estado, 'estado');
  validateRequired(record.local, 'local');

  const precoRaw = record.preco?.trim();
  const preco = precoRaw ? Number(precoRaw.replace(/[^\d.,]/g, '').replace(',', '.')) : null;

  if (preco !== null && isNaN(preco)) {
    throw new Error(`Preço inválido: "${record.preco}"`);
  }

  return {
    tipo,
    titulo: record.titulo,
    categoria: record.categoria,
    marcaCarro: record.marcaCarro,
    modeloCarro: record.modeloCarro || '',
    preco,
    estado: record.estado,
    local: record.local,
    distrito: record.distrito || '',
    descricao: record.descricao || '',
    vendedorTelefone: record.vendedorTelefone || '',
    vendedorWhatsApp: record.vendedorWhatsApp || '',
    vendedorEmail: record.vendedorEmail || userEmail,
    vendedorNome: userName,
    foto: record.foto || '',
    criador: userEmail,
    criadorUid: userUid,
    status: 'aprovado',
    dataCriacao: Timestamp.now(),
    dataAprovacao: Timestamp.now(),
    visualizacoes: 0,
    contagemMensagens: 0,
  };
}

async function main() {
  const args = parseArgs();

  if (args.help || args.h) {
    console.log(`
Uso: node scripts/importar-pecas.mjs [opcoes]

Opcoes obrigatorias:
  --csv <caminho>        Caminho para ficheiro CSV com dados das pecas
  --user-email <email>   Email do utilizador (criador dos anuncios)
  --user-uid <uid>       UID do utilizador no Firebase Auth
  --user-name <nome>     Nome do vendedor para os anuncios

Opcoes opcionais:
  --project-id <id>      Project ID do Firebase (default: reparauto-site)
  --dry-run              Apenas validar, nao escrever no Firestore
  --help                 Mostrar esta ajuda

Variaveis de ambiente:
  GOOGLE_APPLICATION_CREDENTIALS   Caminho para JSON da service account (opcional)

Exemplo:
  set GOOGLE_APPLICATION_CREDENTIALS=C:\\caminho\\service-account.json
  node scripts/importar-pecas.mjs ^
    --csv scripts/exemplo-pecas.csv ^
    --user-email admin@reparauto.pt ^
    --user-uid abc123def456 ^
    --user-name "Admin ReparAuto"
`);
    return;
  }

  const csvPath = args.csv;
  const userEmail = args['user-email'];
  const userUid = args['user-uid'];
  const userName = args['user-name'];
  const dryRun = !!args['dry-run'];
  const projectId = args['project-id'] || PROJECT_ID;

  if (!csvPath) throw new Error('--csv é obrigatório');
  if (!userEmail) throw new Error('--user-email é obrigatório');
  if (!userUid) throw new Error('--user-uid é obrigatório');
  if (!userName) throw new Error('--user-name é obrigatório');

  const fullPath = resolve(csvPath);
  if (!existsSync(fullPath)) throw new Error(`Ficheiro não encontrado: ${fullPath}`);

  const csvText = readFileSync(fullPath, 'utf-8');
  const records = parseCSV(csvText);

  console.log(`\n📄 Ficheiro: ${fullPath}`);
  console.log(`📊 Registos encontrados: ${records.length}`);
  console.log(`👤 Utilizador: ${userName} (${userEmail})`);
  console.log(`🏷️  Project ID: ${projectId}`);
  if (dryRun) console.log(`🔍 Modo: DRY RUN (nada será escrito)`);
  console.log('');

  const mapped = [];
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    try {
      const peca = mapRecord(records[i], userEmail, userUid, userName);
      mapped.push(peca);
      console.log(`  ✅ [${i + 1}/${records.length}] ${peca.titulo}`);
    } catch (err) {
      errors.push({ line: i + 2, error: err.message, data: records[i] });
      console.log(`  ❌ [${i + 1}/${records.length}] Erro: ${err.message}`);
    }
  }

  console.log(`\n📊 Resumo: ${mapped.length} válidos, ${errors.length} erros\n`);

  if (errors.length > 0) {
    console.log('Erros detalhados:');
    errors.forEach(e => {
      console.log(`  Linha ${e.line}: ${e.error}`);
    });
    console.log('');
  }

  if (dryRun || mapped.length === 0) {
    console.log(dryRun ? '🏁 Dry run completo.' : '🏁 Nada a importar.');
    return;
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  }

  const firestore = getFirestore();
  const partsRef = firestore.collection('parts');
  const BATCH_LIMIT = 500;
  let totalWritten = 0;

  for (let start = 0; start < mapped.length; start += BATCH_LIMIT) {
    const chunk = mapped.slice(start, start + BATCH_LIMIT);
    const batch = firestore.batch();

    for (const peca of chunk) {
      const docRef = partsRef.doc();
      batch.set(docRef, peca);
    }

    await batch.commit();
    totalWritten += chunk.length;
    console.log(`  📦 Lote ${Math.floor(start / BATCH_LIMIT) + 1} escrito (${chunk.length} peças)`);
  }

  console.log(`\n✅ ${totalWritten} peça(s) publicada(s) com sucesso em "${projectId}"!\n`);
}

main().catch((err) => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
