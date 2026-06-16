# Plano de Testes: Implementação da Monetização ReparAuto

Este documento define a estratégia, cenários e casos de teste para a implantação do plano de monetização e os componentes promocionais.

---

## 🎯 Escopo de Testes

1. **MonetizationCarousel (Página Inicial)**:
   * Rotação automática a cada 6 segundos.
   * Pause-on-hover (pausa quando o rato está por cima).
   * Navegação manual (setas esquerda/direita e pontos indicadores).
   * Redirecionamentos para as páginas corretas do fluxo.
   
2. **FinanciamentoSeguroWidget (Detalhes do Veículo)**:
   * Seleção entre Abas: Financiamento vs. Seguro Auto.
   * Simulador de Crédito: Cálculo correto de prestações mensais baseado na entrada e meses.
   * Simulador de Seguro: Mudança de prêmio anual baseado no tipo de cobertura.
   * Simulação de envio (leads simuladas enviadas aos parceiros).

3. **Cenários do Plano de Monetização B2B/B2C**:
   * Assinatura Premium de Oficinas via Stripe (checkout, selo verificado, prioridade nas buscas).
   * Sistema de Créditos / Pay-Per-Lead (desbloqueio de contacto por €1.50).
   * Priority Access para Stands (notificações 24h antecipadas de intenções de compra).

---

## 📋 Casos de Teste Detalhados

### Caso 1: Componente MonetizationCarousel (UI & UX)
* **Objetivo**: Garantir que o carrossel exibe as informações premium de forma fluida e acessível.
* **Passos**:
  1. Carregar a página inicial.
  2. Verificar se o carrossel inicia no Slide 1 (Oficina Verificada).
  3. Esperar 6 segundos e verificar se desliza automaticamente para o Slide 2 (Acesso Prioritário).
  4. Passar o rato sobre o carrossel. O auto-play deve parar.
  5. Clicar no botão da seta direita. Deve avançar para o próximo slide.
  6. Clicar nos pontos indicadores na parte inferior. Deve saltar para o slide correspondente.
  7. Clicar no CTA de um slide (ex: "Ver Planos Profissionais") e verificar se a rota redireciona para a página correspondente.
* **Resultado Esperado**: Transições suaves, responsividade total, auto-play controlado e links funcionando perfeitamente.

### Caso 2: FinanciamentoSeguroWidget (Simulações)
* **Objetivo**: Validar os cálculos e feedback interativo dos widgets.
* **Passos**:
  1. Aceder a um anúncio de veículo (ex: `/detalhes/id_exemplo`).
  2. Rolar até à secção abaixo dos contactos do vendedor.
  3. No simulador de financiamento, alterar o slider de "Valor de Entrada". O valor da prestação mensal estimada deve recalcular instantaneamente.
  4. Alterar o slider de "Reembolso" (ex: para 60 meses). A prestação mensal deve ser atualizada.
  5. Clicar em "Pedir Pré-Aprovação de Crédito". Deve mostrar o loading e, em seguida, a mensagem de sucesso confirmando o envio.
  6. Mudar para a aba "Seguro Auto".
  7. Alternar o tipo de cobertura de "Terceiros" para "Danos Próprios". O prêmio estimado deve mudar instantaneamente.
  8. Clicar em "Obter Cotações de Seguro Grátis" e verificar a mensagem de sucesso.
* **Resultado Esperado**: Cálculos matemáticos precisos e feedback claro de envio.

### Caso 3: Integração Stripe (Fase 1 - Roadmap)
* **Objetivo**: Testar o webhook de subscrição premium e créditos.
* **Passos**:
  1. Aceder ao perfil da oficina e clicar em "Registar como Oficina Verificada".
  2. Inserir dados mock no formulário do Stripe Elements.
  3. Confirmar pagamento com o cartão de teste do Stripe (`4242...`).
  4. Validar se o status no Firestore muda para `active: true` e a oficina recebe a badge de verificação.
* **Resultado Esperado**: Sucesso no webhook e ativação automática do selo "Oficina Verificada".
