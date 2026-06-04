# Importação Automática de Peças

Script para publicar peças em massa no Firestore (`parts` collection) a partir de um ficheiro CSV, associadas a um utilizador específico.

## Como usar

### 1. Preparar o CSV

Usa o ficheiro `exemplo-pecas.csv` como template.

**Colunas obrigatórias:**
| Coluna | Descrição | Exemplo |
|---|---|---|
| `tipo` | venda, desmonte ou procura | `venda` |
| `titulo` | Título do anúncio | `Motor 1.9 TDI` |
| `categoria` | Categoria da peça | `Motor e Transmissão` |
| `marcaCarro` | Marca do carro | `Seat` |
| `estado` | Estado da peça | `Usado` |
| `local` | Localização (concelho) | `Braga` |

**Colunas opcionais:**
`modeloCarro`, `preco` (número), `distrito`, `descricao`, `vendedorTelefone`, `vendedorWhatsApp`, `vendedorEmail`

Campos com vírgulas no valor devem estar entre aspas duplas (`"Carro Completo p/ Desmonte"`).

### 2. Autenticação Firebase

O script usa o Firebase Admin SDK. Tens duas opções:

**Opção A — Service Account (recomendado):**
1. No [Firebase Console](https://console.firebase.google.com), vai a Definições do projeto → Contas de serviço
2. Clica "Gerar nova chave privada" — descarrega o JSON
3. Define a variável de ambiente:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\caminho\para\service-account.json"
```

**Opção B — ADC (Application Default Credentials):**
Se já fizeste `gcloud auth application-default login` com uma conta com acesso ao Firestore.

### 3. Executar

```powershell
# Dry run primeiro (apenas valida, não escreve):
npm run import:pecas:dry -- `
  --csv scripts/exemplo-pecas.csv `
  --user-email admin@reparauto.pt `
  --user-uid UID_DO_UTILIZADOR `
  --user-name "Nome do Vendedor"

# Importação real:
npm run import:pecas -- `
  --csv scripts/exemplo-pecas.csv `
  --user-email admin@reparauto.pt `
  --user-uid UID_DO_UTILIZADOR `
  --user-name "Nome do Vendedor"
```

Podes também chamar o script diretamente:

```powershell
node scripts/importar-pecas.mjs --csv dados.csv --user-email ... --user-uid ... --user-name "..."
```

### 4. Obter o UID do utilizador

O UID (Firebase Auth) do utilizador para associar os anúncios. Podes obter no Firebase Console → Authentication, ou perguntar ao utilizador que está autenticado — o UID fica visível no perfil (campo `criadorUid` nas peças existentes).

### Automatização recorrente (semanal/mensal)

Cria um ficheiro PowerShell (ex: `publicar-pecas.ps1`):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\segredos\reparauto-service-account.json"

node scripts/importar-pecas.mjs `
  --csv "C:\dados\pecas-semana-$(Get-Date -Format yyyy-MM-dd).csv" `
  --user-email "admin@reparauto.pt" `
  --user-uid "abc123def456" `
  --user-name "Admin ReparAuto"
```

Depois agenda no Windows Task Scheduler para correr quando quiseres.

## Notas

- As peças são criadas com `status: 'aprovado'` — ficam imediatamente visíveis no site.
- O script usa `batch` do Firestore para escrever tudo de uma vez (máx. 500 peças por lote).
- Se o ficheiro tiver mais de 500 linhas, parte automaticamente em vários batches.
- O utilizador especificado fica como `criador` (email) e `criadorUid` (UID) — aparece no perfil dele nas "Minhas Peças".
