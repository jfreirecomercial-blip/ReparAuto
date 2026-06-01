# App nativa Android/iOS (Capacitor) — Setup

A app móvel partilha a **mesma codebase** do site. É um shell nativo Capacitor que
carrega um **export estático** do Next.js (`out/`) e usa plugins nativos para câmara,
notificações push e autenticação (Google/Apple). Código web/SSR do site mantém-se
inalterado — o modo export só é ativado pela env var `BUILD_TARGET=app`.

## O que já está no repositório

- `capacitor.config.ts` — configuração do shell (appId `pt.reparauto.app`, `webDir: out`).
- `next.config.ts` — `output: 'export'` + `images.unoptimized` quando `BUILD_TARGET=app`.
- Scripts em `package.json`: `build:app`, `cap:sync`, `cap:android`, `cap:ios`.
- Camada nativa partilhada em `src/lib/native/`:
  - `platform.ts` — deteção de plataforma (`isNativePlatform()`).
  - `camera.ts` — câmara/galeria nativas → devolve `File` (pipeline de upload reutilizado).
  - `push.ts` — token FCM (Android/iOS) gravado em `users/{uid}.fcmToken`.
- Integrações por trás de `isNativePlatform()`:
  - `src/lib/auth.ts` — Google nativo, **Sign in with Apple**, eliminação de conta.
  - `src/lib/fcm.ts` — delega push para a camada nativa.
  - `src/components/anunciar/FotosEditor.tsx` — botão "Tirar Foto".
  - `src/components/perfil/ProfileLoggedIn.tsx` — "Eliminar conta permanentemente".
- Rotas dinâmicas com `generateStaticParams` (pré-render para o export).

## Pré-requisitos (máquina de desenvolvimento)

- Node 20+, e acesso de rede a `firestore.googleapis.com` (o build pré-renderiza os
  anúncios públicos).
- **Android**: Android Studio + SDK.
- **iOS**: macOS + Xcode + CocoaPods (`sudo gem install cocoapods`).

## Gerar os projetos nativos (uma só vez)

> As pastas `android/` e `ios/` **não** existem ainda no repo porque exigem o Android SDK /
> macOS para serem geradas. Corra estes comandos numa máquina de dev e faça commit do
> resultado.

```sh
npm install
npm run build:app            # gera out/
npx cap add android          # cria android/
npx cap add ios              # cria ios/  (apenas em macOS)
npx cap sync
```

## Configurar Firebase (FCM / APNs / Auth)

1. **Android** — Firebase Console → Definições → app Android `pt.reparauto.app` →
   transferir `google-services.json` para `android/app/google-services.json`.
2. **iOS** — adicionar app iOS `pt.reparauto.app` → transferir `GoogleService-Info.plist`
   para `ios/App/App/GoogleService-Info.plist`.
3. **APNs (iOS)** — no Apple Developer, criar a APNs Auth Key e carregá-la no Firebase
   Console (Cloud Messaging). Ativar a capability **Push Notifications** no target Xcode.
4. **Google Sign-In** — adicionar o SHA-1/SHA-256 (Android) no Firebase; o
   `google-services.json` traz o client OAuth. Em iOS, adicionar o `REVERSED_CLIENT_ID`
   como URL scheme.
5. **Sign in with Apple** — ativar o provider Apple no Firebase Authentication; no Apple
   Developer criar o Service ID/Key; ativar a capability **Sign in with Apple** no Xcode.

## Permissões nativas

- **iOS** (`Info.plist`): ver os textos pt-PT em `docs/lojas-submissao.md` §3
  (câmara, fotos, localização).
- **Android** (`AndroidManifest.xml`): `CAMERA`, `POST_NOTIFICATIONS`
  (Android 13+ pede em runtime, já tratado pelo plugin).

## Ícones e splash

```sh
npm i -D @capacitor/assets
npx capacitor-assets generate   # a partir de resources/ (logo 1024² + splash)
```

## Correr / depurar

```sh
npm run cap:android   # build:app + cap sync + abre Android Studio
npm run cap:ios       # build:app + cap sync + abre Xcode
```

A partir do Android Studio / Xcode, correr no emulador/simulador ou dispositivo.

## Smoke test (ver `docs/` e plano)

- Navegação Início → Detalhes → Peças → Oficinas → Perfil (UI igual à web móvel).
- Login Email / Google / **Apple**.
- **Eliminar conta** (Perfil) — remove dados e termina sessão.
- Publicar anúncio com a **câmara nativa** → upload para Storage.
- Permissão de notificações → token em `users/{uid}` → push de teste pela consola Firebase.

## Eliminação de conta — nota de produção

A eliminação está implementada do lado do cliente (`deleteUserData` + `deleteUser`):
funciona quando a sessão é recente. O Firebase exige *recent login* para `deleteUser`;
se a sessão for antiga, lança `auth/requires-recent-login` — a UI pede para voltar a
iniciar sessão e tentar de novo (os dados Firestore/Storage são apagados primeiro porque
as regras exigem o utilizador autenticado).

Para robustez e atomicidade em produção recomenda-se mover a limpeza para uma
**Cloud Function callable** (apaga dados como admin, independentemente das regras) e,
para **Sign in with Apple**, revogar o token Apple com
`FirebaseAuthentication.revokeAccessToken(...)` no momento da eliminação (requisito da
Apple para contas criadas com Apple). Ver:
- https://firebase.google.com/docs/auth/web/apple (revogação de token)
- https://cloud.google.com/firestore/docs/solutions/delete-collections (eliminação via função)

## Fluxo de atualização

Sempre que o site/UI muda, basta `npm run cap:sync` (rebuild do `out/` + cópia para os
projetos nativos) e voltar a gerar os binários — a UI é a mesma codebase.
