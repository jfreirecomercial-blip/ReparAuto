# Fase 2 — Botões de Contacto Consistentes + Remover Duplicação

## Problema
- `DetalhesCarro.tsx` renderiza **StatusPanel** (legacy) **E** **ContactSection** (modern) — duplicando WhatsApp, Email, Telefone
- Botões escondem-se se o vendedor não preencheu os dados (apenas Chat aparece na prática)
- Nos cards de intenção (`CarGrid.tsx`), os botões também dependem de dados facultativos

## Solução
1. Remover `StatusPanel` de `DetalhesCarro.tsx` (consolidar contacto no `ContactSection`)
2. `ContactSection` passa a mostrar **sempre** todos os botões — se o dado não existe, mostrar botão desativado com fallback
3. Garantir que o preço e badge Low-Cost são mostrados mesmo sem StatusPanel

---

## Ficheiro 1: `src/screens/DetalhesCarro.tsx`

Remover `StatusPanel` e mostrar preço + badge no topo:

```typescript
// Remover import de StatusPanel (linha 10):
// import StatusPanel from '@/components/detalhes/StatusPanel';

// Remover o bloco que renderiza StatusPanel (linhas 181-190):
// Substituir por:
        <div className="mb-6">
          {carro.estadoVeiculo === 'manutencao' && (
            <Alert tipo="aviso" icone={<Wrench />} className="!p-3 !rounded-lg !items-center font-semibold">
              Este veículo precisa de manutenção/reparações
            </Alert>
          )}
        </div>

// No topo, junto ao título, adicionar o preço (logo abaixo do h1 ou ao lado):
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-heading">
              {carro.marca} {carro.modelo}
            </h1>
            <p className="text-fg-subtle text-sm mt-1">
              {carro.anoFabricacao} • {carro.km?.toLocaleString('pt-PT')} km • {carro.local || 'Portugal'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Preço + badge Low-Cost */}
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-accent">
                {formatarPreco(carro.preco)}
              </span>
              {isLowCost && <Badge cor="accent" variante="solid">Low-Cost</Badge>}
            </div>
            <div className="flex items-center gap-2">
              {carro.status === 'pendente' && <Badge cor="yellow">Pendente</Badge>}
              {carro.status === 'rejeitado' && <Badge cor="red">Rejeitado</Badge>}
              <button
                onClick={() => toggleFavorito(carro.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition flex items-center gap-1 ${
                  isFavorito(carro.id)
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white text-fg-muted border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Heart weight={isFavorito(carro.id) ? 'fill' : 'regular'} className={isFavorito(carro.id) ? '' : 'text-slate-400'} />
                {isFavorito(carro.id) ? 'Favorito' : 'Favoritar'}
              </button>
              <ShareButton
                title={`${carro.marca} ${carro.modelo} - ReparAuto`}
                text={`${carro.marca} ${carro.modelo} ${carro.anoFabricacao} - ${formatarPreco(carro.preco)}`}
              />
            </div>
          </div>
        </div>
```

Nota: também remover import de `StatusPanel`.

---

## Ficheiro 2: `src/components/detalhes/ContactSection.tsx`

Garantir que os botões aparecem sempre (com fallback quando dados em falta):

```typescript
// Modificar a lógica de temWhatsApp/temTelefone/temEmail para SEMPRE mostrar:
  const whatsapp = obterWhatsApp(carro.vendedorWhatsApp, carro.vendedorTelefone);
  const telefone = carro.vendedorTelefone;
  const email = carro.vendedorEmail || carro.criador;
  // Remover os "tem" checks que escondem — mostrar SEMPRE os botões
  // Se não tem WhatsApp, mostrar botão desativado com tooltip
  // Se não tem telefone, esconder o botão (não há fallback para telefone)
  // Se não tem email, esconder o botão (não há fallback útil)

  // Novo approach: manter os checks mas sempre mostrar visualmente
  const temWhatsApp = !!whatsapp;
  const temTelefone = !!telefone;
  const temEmail = !!email;

// Manter os botões como estão, mas ADICIONAR tooltips/estados disabled:
// No grid de WhatsApp + Email:
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {temWhatsApp ? (
            <a
              href={gerarLinkWhatsApp(whatsapp, `${carro.marca} ${carro.modelo}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition text-sm"
            >
              <WhatsappLogo className="text-lg" />
              WhatsApp
            </a>
          ) : (
            <div
              title="Vendedor não disponibilizou WhatsApp"
              className="flex items-center justify-center gap-2 bg-green-100 text-green-300 font-bold py-3 px-4 rounded-xl text-sm cursor-not-allowed"
            >
              <WhatsappLogo className="text-lg" />
              WhatsApp indisponível
            </div>
          )}

          {temEmail ? (
            <a
              href={`mailto:${email}`}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-fg font-semibold py-3 px-4 rounded-xl transition border border-slate-300 text-sm"
            >
              <Envelope />
              Enviar Email
            </a>
          ) : (
            <div
              title="Vendedor não disponibilizou email"
              className="flex items-center justify-center gap-2 bg-white text-fg-subtle font-semibold py-3 px-4 rounded-xl border border-slate-200 text-sm cursor-not-allowed"
            >
              <Envelope />
              Email indisponível
            </div>
          )}
        </div>

// Telefone (toggle reveal) — manter como está (já mostra sempre se temTelefone)

// Na secção de Chat:
          {temChat && (
            <Button
              tipo="azul"
              tamanho="lg"
              blocoCompleto
              onClick={() => abrirChat(carro.id, 'carro', `${carro.marca} ${carro.modelo}`, vendedorUid!, carro.vendedorNome || carro.criador || 'Vendedor')}
              icone={<ChatCircleDots />}
            >
              Enviar Mensagem (Chat Interno)
            </Button>
          )}

          {!temChat && !user && (
            <button
              onClick={() => loginModal.openLoginModal(window.location.pathname)}
              className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-fg-muted font-semibold py-3 px-4 rounded-xl transition text-sm"
            >
              <SignIn />
              Faça login para enviar mensagem
            </button>
          )}

          {/* NOVO: Se está logado mas não tem chat (mesmo utilizador), mostrar info */}
          {!temChat && user && !vendedorUid && (
            <div className="text-xs text-fg-subtle text-center py-2">
              Chat indisponível para este anúncio.
            </div>
          )}
```

Adicionar ao topo:
```typescript
import { useRouter } from 'next/navigation';
```
E no hook:
```typescript
const router = useRouter();
const { loginModal } = useApp();
```
