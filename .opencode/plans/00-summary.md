# Plano Completo de Alterações

## Resumo dos 3 problemas

| # | Problema | Solução |
|---|---------|---------|
| 1 | Login redireciona para perfil em vez de voltar ao anúncio | LoginModal global + redirect via contexto |
| 2 | Botões de contacto duplicados e escondem-se se faltam dados | Consolidar ContactSection, remover StatusPanel, mostrar fallbacks |
| 3 | Não há página pública de intenção de compra com perfil do comprador | Nova rota `/intencao/[id]` + screen DetalhesIntencao |

## Ordem de implementação

1. **`src/types/app.ts`** — Adicionar `LoginModalContextValue`
2. **`src/providers/AppProvider.tsx`** — Adicionar estado loginModal + renderizar LoginModal
3. **`src/components/auth/LoginModal.tsx`** — Adicionar `onSuccess` prop
4. **`src/screens/Perfil.tsx`** — Usar contexto em vez de estado local
5. **`src/components/detalhes/ContactSection.tsx`** — Substituir link por openLoginModal + fallbacks
6. **`src/components/pecas/DetalhesPecaModal.tsx`** — Substituir link por openLoginModal
7. **`src/components/home/CarGrid.tsx`** — Substituir link por openLoginModal + ligar intenções
8. **`src/screens/DetalhesCarro.tsx`** — Remover StatusPanel, mostrar preço no topo
9. **`app/intencao/[id]/page.tsx`** — (NOVO) Server component com metadata
10. **`src/screens/DetalhesIntencao.tsx`** — (NOVO) Client component com UI completa

## Ficheiros a criar (2)

- `app/intencao/[id]/page.tsx`
- `src/screens/DetalhesIntencao.tsx`

## Ficheiros a modificar (8)

- `src/types/app.ts`
- `src/providers/AppProvider.tsx`
- `src/components/auth/LoginModal.tsx`
- `src/screens/Perfil.tsx`
- `src/components/detalhes/ContactSection.tsx`
- `src/components/pecas/DetalhesPecaModal.tsx`
- `src/components/home/CarGrid.tsx`
- `src/screens/DetalhesCarro.tsx`

## Fluxo pós-implementação

```
Utilizador não logado vê anúncio /detalhes/abc
  → Clica "Faça login para enviar mensagem"
  → LoginModal abre (sem sair da página!)
  → Faz login/registo com sucesso
  → Modal fecha
  → Redirecionado de volta para /detalhes/abc
  → Vê botão "Enviar Mensagem (Chat Interno)"
```

```
Intenção de compra visível na homepage
  → Clica no título ou "Ver detalhes completos"
  → Navega para /intencao/xyz
  → Vê critérios completos, preferências, perfil do comprador
  → Contacta via WhatsApp/Email/Telefone/Chat
```
