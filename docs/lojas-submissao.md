# Submissão às Lojas — ReparAuto (App Store & Google Play)

Documento com os dados a inserir na **App Store Connect** (Apple) e na **Google Play
Console**. Todo o texto destina-se ao mercado **Portugal** e está em **português de
Portugal (pt-PT)**. Os campos abaixo estão prontos a copiar/colar; ajuste URLs e datas
conforme necessário.

> Identidade técnica da app: **Bundle ID / App ID** `pt.reparauto.app` · **Nome** ReparAuto

---

## 1. Dados comuns (Apple + Google)

| Campo | Valor |
|---|---|
| Nome da app | **ReparAuto** |
| Subtítulo (Apple, máx. 30) | Carros, peças e oficinas |
| Short description (Google, máx. 80) | Compre e venda carros usados, peças e encontre oficinas em Portugal. |
| Idioma principal | Português (Portugal) |
| Categoria principal | Compras |
| Categoria secundária (Apple) | Estilo de vida |
| Classificação etária | 4+ (Apple) / PEGI 3 (Google) — sem conteúdo sensível |
| Email de contacto | flavioislima@gmail.com |
| Website / URL de marketing | https://reparauto-site.web.app |
| URL de suporte | https://reparauto-site.web.app/faq |
| Política de privacidade | https://reparauto-site.web.app/privacidade |
| Termos de utilização | https://reparauto-site.web.app/termos |
| Preço | Gratuito |
| Países de disponibilidade | Portugal |

### Descrição completa (pt-PT)

```
A ReparAuto é o mercado português de carros usados, peças e oficinas.

Compre e venda viaturas usadas — incluindo carros para reparação — de forma simples,
rápida e segura. Encontre peças auto e sucata, descubra oficinas e mecânicos perto de
si e fale diretamente com vendedores através do chat integrado.

PRINCIPAIS FUNCIONALIDADES
• Anúncios de carros usados e para reparação, com fotos e ficha técnica completa
• Mercado de peças auto e sucata
• Diretório de oficinas e mecânicos com avaliações
• Pesquisa e filtros por marca, modelo, ano, combustível, preço e localidade
• Crie a sua "intenção de compra" e receba contactos de vendedores
• Mensagens em tempo real com compradores e vendedores
• Notificações quando recebe mensagens ou surgem anúncios do seu interesse
• Tire fotos diretamente com a câmara ao publicar um anúncio
• Avaliações e selos de confiança para compras mais seguras

Crie a sua conta com email, Google ou Apple. Pode eliminar a sua conta e todos os seus
dados a qualquer momento, diretamente na app, no separador Perfil.

Junte-se à ReparAuto e dê uma nova vida aos automóveis.
```

### Palavras-chave

- **Apple** (campo único, máx. 100 caracteres, separadas por vírgula):
  ```
  carros usados,peças auto,sucata,oficinas,mecânico,automóveis,vender carro,comprar carro,stand,viaturas
  ```
- **Google** (incorporar naturalmente na descrição; não há campo dedicado): carros usados,
  peças automóveis, oficinas, mecânicos, comprar e vender carros em Portugal.

### Texto promocional (Apple, máx. 170, atualizável sem nova versão)

```
Compre e venda carros usados, peças e sucata. Encontre oficinas perto de si e fale com
vendedores em tempo real. Tudo em português.
```

---

## 2. Privacidade e dados recolhidos

Declarar nos questionários **App Privacy** (Apple) e **Data safety** (Google). A app
usa Firebase (Authentication, Firestore, Storage, Cloud Messaging).

| Tipo de dado | Recolhido? | Finalidade | Associado ao utilizador |
|---|---|---|---|
| Email | Sim | Autenticação da conta | Sim |
| Nome | Sim | Perfil / contacto | Sim |
| Telefone | Sim (opcional) | Contacto entre utilizadores | Sim |
| Localização aproximada (concelho/código postal) | Sim | Localizar anúncios e oficinas | Sim |
| Fotografias | Sim | Fotos dos anúncios | Sim |
| Mensagens / conteúdo do utilizador | Sim | Chat entre comprador e vendedor | Sim |
| Identificadores (token de notificações FCM) | Sim | Enviar notificações push | Sim |
| Dados de diagnóstico / falhas | Não | — | — |
| Dados de publicidade / tracking | Não | A app **não** faz tracking nem publicidade | — |

- **Tracking (Apple ATT):** Não. A app não rastreia utilizadores entre apps/sites.
- **Os dados são vendidos a terceiros?** Não.
- **Eliminação de dados:** o utilizador pode eliminar a conta e todos os dados associados
  na própria app (Perfil → Eliminar conta). Link de eliminação (Google exige URL):
  https://reparauto-site.web.app/perfil

---

## 3. App Store Connect (Apple) — campos específicos

| Campo | Valor |
|---|---|
| Bundle ID | `pt.reparauto.app` |
| SKU | `reparauto-app` |
| Idioma principal | Português (Portugal) |
| Direitos de encriptação (Export Compliance) | Usa apenas HTTPS/encriptação padrão → isento (resposta "Sim" a usar encriptação, "Não" a algoritmos não-standard; qualifica para isenção) |
| Sign in with Apple | **Sim** (obrigatório — a app oferece login Google) |

### App Review — Informação de contacto e conta de demonstração

```
Conta de demonstração:
  Email: demo@reparauto.pt
  Palavra-passe: (criar antes da submissão)

Notas para o revisor:
  - Login disponível por Email, Google e Apple.
  - "Iniciar sessão com a Apple" está disponível no ecrã de login.
  - É possível eliminar permanentemente a conta em Perfil > Eliminar conta.
  - A câmara é usada apenas ao publicar um anúncio (Anunciar > Fotos > Tirar Foto).
  - As notificações são opcionais e pedidas com consentimento explícito.
```

### Textos das autorizações (Info.plist — Purpose strings, pt-PT)

| Chave | Texto |
|---|---|
| NSCameraUsageDescription | A ReparAuto usa a câmara para tirar fotos dos seus anúncios. |
| NSPhotoLibraryUsageDescription | A ReparAuto acede às suas fotos para adicionar imagens aos anúncios. |
| NSPhotoLibraryAddUsageDescription | A ReparAuto guarda imagens na sua galeria quando o solicitar. |
| NSLocationWhenInUseUsageDescription | A ReparAuto usa a sua localização para mostrar anúncios e oficinas perto de si. |

---

## 4. Google Play Console — campos específicos

| Campo | Valor |
|---|---|
| Application ID | `pt.reparauto.app` |
| Nome da app (máx. 30) | ReparAuto |
| Short description (máx. 80) | Compre e venda carros usados, peças e encontre oficinas em Portugal. |
| Full description | (usar a "Descrição completa" da secção 1) |
| Categoria | Compras |
| Tags | Carros, Compras, Estilo de vida |
| Email de contacto | flavioislima@gmail.com |
| Política de privacidade | https://reparauto-site.web.app/privacidade |
| Conta de teste (Acesso para revisão) | demo@reparauto.pt + palavra-passe |

### Content rating (questionário IARC) — respostas

- Violência: Não · Conteúdo sexual: Não · Linguagem imprópria: Não · Substâncias: Não
- Interação entre utilizadores: **Sim** (chat/mensagens)
- Partilha de localização: **Sim** (localidade dos anúncios)
- Compras digitais: Não
- Resultado esperado: **PEGI 3 / Todos**

### Permissões sensíveis a declarar

- `CAMERA` — tirar fotos dos anúncios.
- `POST_NOTIFICATIONS` — notificações de mensagens e anúncios.
- (Localização aproximada apenas se ativar geolocalização nativa.)

---

## 5. Checklist de assets gráficos

Gerar a partir do branding existente (`public/logo.svg`, `public/pwa-icon.svg`) — sugere-se
`@capacitor/assets` para ícones/splash da app.

**Apple (App Store Connect):**
- [ ] Ícone da app 1024×1024 px (PNG, sem transparência, sem cantos)
- [ ] Screenshots iPhone 6.7" (1290×2796) — mín. 3
- [ ] Screenshots iPhone 6.5" (1242×2688) — mín. 3
- [ ] (Opcional) Screenshots iPad 12.9"

**Google (Play Console):**
- [ ] Ícone 512×512 px (PNG 32-bit)
- [ ] Feature graphic 1024×500 px
- [ ] Screenshots de telemóvel (mín. 2, 16:9 ou 9:16; 320–3840 px)

**Sugestão de ecrãs para screenshots:** Início (grelha de carros), Detalhe de um carro,
Mercado de peças, Diretório de oficinas, Publicar anúncio.
