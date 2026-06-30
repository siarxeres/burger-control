# Minha Firma

SaaS de gestão financeira inteligente para pequenas empresas. Originado no segmento food service (hamburguerias, restaurantes, lanchonetes), hoje atende segmentos mais amplos de pequenos negócios. Permite lançar despesas e receitas, extrair dados de cupons fiscais via IA, gerar DRE, DASN e relatórios analíticos com insights automáticos.

- **Produção:** https://minhafirma.app
- **Repositório:** `burger-control` (GitHub `siarxeres`) — nome histórico, do tempo em que o projeto era focado em food service; mantido para não quebrar deploy/integrações
- **Caminho local:** `C:\Users\CONSULTORIA\OneDrive\Apps\burger-control`
- **Deploy:** Vercel

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5 + Vanilla JavaScript (SPA, sem framework) |
| Backend | Vercel Serverless Functions (Node.js) |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (email + senha) |
| Hospedagem | Vercel |
| Pagamento | Asaas (PIX, boleto — cartão desativado na UI até implementação completa) |
| IA | Anthropic Claude Sonnet (via `/api/claude.js`) |
| PWA | Service Worker (`sw.js`) + `manifest.json` |
| Estilo | CSS puro no HTML, dark mode via `prefers-color-scheme` |
| Gráficos | Chart.js v4 (via CDN) — gráfico histórico do dashboard |

Sem bundler ou NPM — dependências via CDN (Supabase JS v2, Chart.js v4).

---

## Perfis de usuário

| Perfil | Foco |
|---|---|
| **Financeiro** | Controle de caixa, DRE e orçamento |
| **Fiscal** | DASN e documentos fiscais |
| **Crescimento** | Análise de tendências e relatórios IA |
| **Admin** | Acesso total ao painel administrativo |

---

## Planos e preços

| Plano | Mensal | Anual |
|---|---|---|
| Grátis | R$ 0 | — |
| Starter | R$ 19,90 | R$ 16 |
| Pro | R$ 44,90 | R$ 36 |
| Enterprise | R$ 69,90 | R$ 56 |

Geridos pelo admin. Trial de 30 dias no plano Grátis (acesso total durante a janela; após 30 dias vira Grátis restrito). Planos pagos (Starter/Pro/Enterprise) nunca expiram. Recursos têm *gates* por plano (ex.: scan IA bloqueado no Grátis expirado).

---

## Mapa de rotas/telas

### Arquivos HTML (rotas no `vercel.json`)
- `/*` → `public/index.html` — app principal (SPA)
- `/beta` → `public/beta.html` — landing do programa beta com formulário
- `/pricing` → `public/pricing.html` — planos e preços
- `/admin` → `public/admin.html` — painel administrativo (acesso: https://minhafirma.app/admin — login próprio)
- `/obrigado` → `public/obrigado.html` — página de confirmação pós-pagamento (destino do link de retorno do Asaas)

### Telas internas da SPA (`public/index.html`)

**Público / pré-app**
- `#auth-screen` — login / cadastro (Supabase)
- `#onboarding-screen` — onboarding de 2 passos: passo 1 escolhe o foco (Financeiro / Fiscal / Crescimento), passo 2 confirma o perfil e exibe checklist de boas-vindas

**Seção Empresa (modo padrão)**
- `dashboard` — KPIs do mês, alertas inteligentes, últimos lançamentos
- `lancar` — Lançar Despesa (3 abas: scan IA, manual, importação CSV)
- `despesas` — tabela com filtros por CC, categoria, status, usuário
- `receitas` — lançamento e listagem de receitas
- `centros` — centros de custo, distribuição de gastos por CC e categoria
- `relatorio` — Relatórios IA (resumo executivo, anomalias, tendências, sugestões, DRE via IA)
- `dre` — Demonstrativo de Resultado do Exercício por período
- `dasn` — Declaração Anual para MEI/ME
- `orcamento` — Orçado vs Realizado por CC e categoria

**Seção Pessoal (toggle no topbar)**
- `pessoal-dashboard` — resumo das finanças pessoais
- `pessoal-lancar` — lançar despesa ou receita pessoal
- `pessoal-extrato` — listagem filtrada de lançamentos pessoais
- `pessoal-dre` — DRE aplicado às finanças pessoais

---

## Fluxos principais

### Cadastro e onboarding
1. Acessa o app → `#auth-screen`
2. Email + senha → Criar conta
3. Supabase cria o usuário; sistema cria `profile` com `role = 'operador'` e plano `gratis`
4. Sem `profile_type`, exibe onboarding de 2 passos: passo 1 = escolha de foco; passo 2 = confirmação do perfil
5. Ao concluir, carrega os dados e exibe o dashboard

### Lançar despesa (manual)
1. "+ Lançar" no topbar ou navega para Lançar Despesa → aba Preencher manualmente
2. Informa fornecedor, CNPJ, centro de custo, categoria, valor, data, tipo, forma de pagamento
3. Salva → insere na tabela `despesas`

### Lançar despesa via scan IA
1. Aba Escanear documento → upload/foto do cupom fiscal
2. JS envia imagem em base64 para `/api/claude`
3. Claude retorna JSON (fornecedor, CNPJ, valor, data, tipo)
4. `fillFormFromAI()` preenche o formulário; usuário revisa e confirma

### Importação CSV
1. Aba Importar CSV → upload/arrasta arquivo (CSV, TXT, XLS, XLSX)
2. IA interpreta o formato (WI2, SAP, Totvs, Omie, bancos)
3. Preview com checkbox por linha; usuário confirma e insere em lote

### Upgrade de plano
1. Recurso bloqueado dispara `alertPlano()` com CTA de upgrade
2. `/pricing` → escolhe plano + ciclo (mensal/anual)
3. Escolhe método (PIX ou Boleto — cartão desativado na UI) → frontend envia para `/api/asaas`
4. Asaas cria customer + assinatura, retorna `paymentLink`
5. Cliente paga no link do Asaas → redirecionado para `/obrigado`
6. Webhook `/api/webhook-asaas` recebe `PAYMENT_CONFIRMED` → atualiza `profiles.plano`
7. App detecta a mudança via Supabase Realtime (`postgres_changes` em `profiles`) → chama `loadPlanos()` + `initApp()` + exibe toast; sem reload manual

---

## Concluído

- ✅ Autenticação completa (login, cadastro, logout, sessão)
- ✅ Onboarding com seleção de perfil (2 passos)
- ✅ Dashboard com KPIs e alertas inteligentes (visual redesenhado — ver item de 10/06/2026)
- ✅ Lançamento manual de despesas e receitas, incluindo recorrentes
- ✅ Scan IA de cupons fiscais com preenchimento automático
- ✅ Importação CSV com interpretação por IA (múltiplos formatos)
- ✅ Exportação CSV (despesas, receitas, finanças pessoais)
- ✅ Centros de custo com distribuição visual
- ✅ DRE empresarial e pessoal
- ✅ DASN para MEI/ME
- ✅ Orçado vs Realizado
- ✅ Relatórios IA (resumo executivo, anomalias, tendências, sugestões)
- ✅ Finanças pessoais (dashboard, extrato, DRE)
- ✅ Sistema de planos com gates + trial de 30 dias no plano Grátis
- ✅ Integração Asaas (criação de assinatura) + webhook de ativação
- ✅ PWA instalável com Service Worker e cache offline
- ✅ Dark mode automático e layout responsivo
- ✅ Páginas /pricing e /beta
- ✅ Painel /admin funcional e autenticado — usa Supabase Auth real (`signInWithPassword`) + verificação de papel via RPC `get_my_role`; sem credenciais de admin embutidas no código; gestão de usuários, CRUD de planos e centros de custo gravando no Supabase
- ✅ Proteção do /admin auditada (31/05/2026) — dados protegidos por RLS no Supabase (todas as tabelas sensíveis com policy por dono ou por papel admin via `get_my_role`); casca do painel protegida no cliente (redireciona/exige login antes de exibir). Não é mais um item crítico.
- ✅ Brecha do trial corrigida: guard `podeLancar()` em todos os 5 pontos de lançamento (despesa empresarial, receita, despesa pessoal, orçamento, importação CSV/IA)
- ✅ Arquivos duplicados/obsoletos removidos da raiz (index.html vazio e pricing.html antigo "Food Control"); produção servida só de public/
- ✅ Bug de onboarding e dashboard aparecendo juntos após login corrigido (01/06/2026) — `loadProfile()` retorna flag; `doLogin()` e IIFE de sessão só chamam `initApp()` quando onboarding não foi acionado; `initApp()` garante `onboarding-screen` oculto. Telas agora mutuamente exclusivas.
- ✅ Lógica de trial corrigida e em produção (01/06/2026) — trial de 30 dias pertence ao plano Grátis (acesso total na janela; após 30 dias vira Grátis restrito); planos pagos (Starter/Pro/Enterprise) nunca expiram; banner e bloqueio usam a mesma base de datas (`created_at`).
- ✅ Webhook do Asaas protegido (01/06/2026) — `webhook-asaas.js` agora valida o header `asaas-access-token` (comparação segura via `crypto.timingSafeEqual`); rejeita com 401 qualquer chamada sem o token correto. Token configurado no Asaas (produção) e na Vercel (`ASAAS_WEBHOOK_TOKEN`, Production). Tranca testada: chamada sem token retorna 401. Commit `d6cacec`.
- ✅ Recuperação de senha (01/06/2026) — fluxo "Esqueci minha senha" via Supabase Auth, testado de ponta a ponta em produção. Link na tela de login abre accordion com campo de email → `resetPasswordForEmail` com toast neutro (não revela se o email existe) → email do Supabase → tela `#reset-password-screen` (mutuamente exclusiva, protegida pela flag `emRecuperacaoSenha` contra a corrida entre `PASSWORD_RECOVERY` e `SIGNED_IN`) → `updateUser` → app. Redirect URL `https://minhafirma.app/**` adicionada no Supabase (Site URL já era `https://minhafirma.app`). Commits `2af763d` (feature) e `8ac482b` (fix da corrida). Email usa o remetente padrão do Supabase (sujeito a rate limit; migrar para SMTP próprio quando o volume exigir).
- ✅ Config de pagamento manual descontinuada do admin (01/06/2026) — removidos os blocos "WhatsApp de Suporte" e "Dados de Pagamento/PIX" da tela Configurações do painel admin (resquício do fluxo manual da v1: cliente fazia PIX e enviava comprovante por WhatsApp). Asaas é o único meio de pagamento. Mantido o bloco "Dados da Empresa" (tabela `configs` não consumida em nenhum fluxo do usuário; não persiste ainda). Commit `e03ff2d`.
- ✅ Admin alinhado à identidade visual (01/06/2026) — `admin.html` forçado para modo claro (`color-scheme: light`, ignora `prefers-color-scheme`); tema próprio antigo (accent roxo `#6c63ff`, fundos escuros `#0f1117`/`#1a1d27`) substituído pela paleta oficial (accent laranja `#d85a30`, fundos claros, textos escuros); cores de status e badges recalculados para fundo claro. Commit `85e83c8`.
- ✅ Bug de onboarding em loop corrigido (02/06/2026) — causa raiz: coluna `profile_type` não existia na tabela `profiles` do Supabase; app lia sempre `null` → mandava todos ao onboarding; `UPDATE` ao concluir não tinha efeito → ninguém terminava o fluxo. Correção em três partes: (1) coluna `profile_type TEXT` criada manualmente no Supabase (aceita `'financeiro'`, `'fiscal'`, `'crescimento'`); (2) botão "Pular por agora" removido e `obPular()` excluída — onboarding agora obrigatório, única saída é `obFinalizar()` que grava o campo; (3) contas existentes com `profile_type` nulo preenchem o campo ao passar pelo onboarding uma vez. Validado em produção. Commit `ef59893`. **Atenção:** o schema do banco não é versionado no repositório — a coluna existe apenas no Supabase de produção; recriar o banco exige aplicar o `ALTER TABLE` manualmente.
- ✅ Asaas — fluxo de pagamento real validado de ponta a ponta (02/06/2026) — 1º pagamento real (PIX, R$ 19,90, plano Starter) processado pela conta CONECTADOSCPA. Webhook `PAYMENT_RECEIVED`/`PAYMENT_CONFIRMED` recebido em `/api/webhook-asaas` com resposta 200 (confirmado nos Logs de Webhooks do Asaas); `profiles.plano` atualizado de `gratis` para `starter` automaticamente, sem intervenção no admin. Elo Asaas↔perfil via `externalReference = "planoId|email"` operacional.
- ✅ **Asaas — descompasso PIX/boleto investigado e esclarecido (03/06/2026)** — não é bug. O app envia o método corretamente (`metodo: checkoutState.metodo` no frontend → traduzido fielmente para `billingType` em `/api/asaas`). O "boleto" observado é comportamento padrão do Asaas para assinaturas PIX: a página de pagamento (`invoiceUrl`) tem aparência de boleto mas traz o QR Code PIX embutido — por isso foi possível pagar via PIX. Fluxo funciona como esperado; o atrito é apenas cosmético (nomenclatura do Asaas). Melhoria futura de UX, se clientes estranharem: buscar o QR Code PIX puro via API do Asaas e exibir direto no app em vez de redirecionar para a página deles (mexe em pagamento — planejar antes).
- ✅ **Notificações por email — confirmação de pagamento (03/06/2026)** — quando um pagamento é confirmado, o cliente recebe automaticamente um email de confirmação ("seu plano X está ativo"). Implementado com **Resend** (serviço de email transacional). Domínio `minhafirma.app` verificado na Resend (via DNS no GoDaddy); remetente `nao-responda@minhafirma.app`. A função vive em `api/_lib/email.js` e é chamada no fim do `webhook-asaas.js`, dentro de `try/catch` — se o email falhar, o webhook ainda retorna 200 e o pagamento não é afetado. Chave `RESEND_API_KEY` nas variáveis de ambiente da Vercel (Production). Testado de ponta a ponta: email chega na caixa de entrada com a identidade visual do app. Commits `9bcb0ba` (integração) e `fe91530` (remetente do domínio).
- ✅ **Lembretes de vencimento — cobertos nativamente pelo Asaas (03/06/2026)** — descoberto que não precisa de código próprio (nem agendador/cron, como se pensava). O Asaas tem régua de notificações automáticas por email ao cliente, já ativas por padrão no cadastro de cada cliente (Meus Clientes → Cliente → seção Notificações): aviso 10 dias antes do vencimento, aviso no dia, aviso de atraso (a cada 7 dias) e confirmação de pagamento. Prazos ajustáveis no painel. Nenhuma ação de código necessária.
- ✅ **`asaas_customer_id` — elo robusto Asaas↔perfil (09/06/2026)** — resolvida a fragilidade do email como elo único (se o cliente trocasse o email, pagamentos futuros não achariam o perfil). Três partes: (1) coluna `asaas_customer_id TEXT` criada na tabela `profiles` do Supabase (`ALTER TABLE`, aplicada manualmente — schema não versionado); (2) `api/asaas.js` salva o `customerId` (`cus_...`) no perfil após criar a assinatura, dentro de `try/catch` que não interrompe o fluxo; (3) `api/webhook-asaas.js` localiza o perfil primeiro por `asaas_customer_id` (lido de `payload.payment.customer`) e usa o email como fallback — lógica de email intacta como reserva. Mudança aditiva e segura por construção. Commit `ff702f0`. **Validação final pendente:** confirmar no 1º pagamento real que a Peça 2 grava o ID e a Peça 3 o usa — não forçado, aguardando ciclo natural.
- ✅ **Dashboard redesenhado — visual "vitrine" (10/06/2026)** — redesenho visual completo do dashboard (`#page-dashboard`) no estilo cards com respiro, mantendo a identidade (laranja `#d85a30`), responsivo e com dark mode. Lógica de dados intacta — só o visual mudou. Mudanças: saudação dinâmica no topo; KPIs como cards (ícone + rótulo + valor + subtexto); alertas agora colapsáveis (linha-resumo "N diagnósticos precisam da sua atenção" que expande); barras por CC arredondadas; ações rápidas como lista de cards; últimos lançamentos como lista com respiro. Removidos 2 itens redundantes das ações rápidas ("Lançar despesa ou receita" — duplicava o botão do topbar; "Ver resumo completo" — duplicava a aba Centros de Custo) e o botão "+ Lançar" duplicado no header. Banner de destaque "Diagnóstico 360°" desativado (tabela `destaques`, `ativo = false`) até a funcionalidade existir. CSS isolado com prefixo `dash-*` (zero impacto em outras telas). Desenvolvido na branch `redesign-dashboard` com preview na Vercel, validado no desktop e mobile, merge na `main` commit `47cd7cf`.
- ✅ **Dashboard — cards de Receitas, Despesas e CC expansíveis (10/06/2026)** — segunda rodada de melhorias nos KPIs do dashboard, na branch `dashboard-cards-receitas-despesas`, merge na `main` commit `5ff0db2`. Mudanças: (1) banner de perfil deixou de repetir o valor do resultado (que já está no KPI) — mantém só a mensagem de ação, ajustado por perfil (financeiro/fiscal/crescimento); (2) card "Resultado do Mês" enxuto — só o valor, sem o subtexto Rec/Desp; (3) dois cards novos expansíveis: Receitas (total + detalhe por categoria ao expandir) e Despesas (total + detalhe por categoria); (4) card "Maior CC" também tornado expansível — recolhido mostra o maior CC, expandido mostra o ranking de todos os CCs do mês (reaproveita o mesmo `byCC`/`despMes` do bloco de barras; trata o caso de CC único com a mensagem "Apenas um CC este mês"). Todos os cards filtram apenas o mês corrente (`despMes`/`recMes`, mesma base dos demais KPIs — confirmado por auditoria de código). Receitas agrupam pelo campo `categoria` (obrigatório no lançamento; "canal" pode ser vazio em registros antigos). Expansão cresce em altura (1 coluna), com `align-items:start` no grid para não esticar vizinhos. 11 classes novas `dash-kpi-*`. Ordem final: Resultado · Receitas · Despesas · Maior CC · Extraídos pela IA · Pendentes. Validado no desktop e mobile.
- ✅ **Card "RESULTADO" da tela Receitas — base de cálculo corrigida para mês atual (24/06/2026)** — branch `fix-resultado-receitas`, merge --no-ff na `main`, commit `b776fa6` (merge `139d3b2`). O card calculava `total histórico de receitas − todas as despesas (todos os meses, sem excluir Rejeitados)`, divergindo do dashboard e do card lateral que usam mês atual. Resultado: valores incoerentes (ex.: −4.189 no card vs −2.267 nos outros). Corrigido para a mesma base: `totalMes` (receitas do mês, já existia) − `totalDespMes` (novo: despesas do mês, excluindo `status === 'Rejeitado'`). Os três pontos que exibem "resultado" agora sempre batem. **Padrão do projeto estabelecido:** receita/despesa do mês = filtrar por mês atual e excluir `status === 'Rejeitado'`.
- ✅ **Formulário "Nova Receita" — atrito reduzido a 1 campo obrigatório (24/06/2026)** — branch `receita-menos-atrito`, merge --no-ff na `main`, commit `444fd9d`. Antes o formulário exigia Descrição, Categoria, Tipo de Receita e Valor (4 campos), bloqueando o lançamento — diagnóstico de ativação indicou 0 receitas lançadas entre usuários de teste. Agora só Valor é obrigatório (Data já vem preenchida); Descrição, Categoria e Tipo viraram opcionais. Como o banco exige `descricao` e `categoria` (NOT NULL), o schema não foi alterado — o código aplica defaults antes do insert: descrição vazia → `"Receita"`, categoria vazia → `"Não categorizado"`. Asteriscos visuais removidos dos campos opcionais. Objetivo: deixar o usuário registrar a receita rápido para a conta do lucro fechar.
- ✅ **Dashboard — cards de Resultado tratam estado "sem receita" sem falso prejuízo (24/06/2026)** — branch `fix-card-resultado-sem-receita`, merge --no-ff na `main`, commit `b7d7636`. Antes, quando o usuário tinha despesas mas nenhuma receita lançada no mês, ambos os cards de "Resultado do Mês" (card grande do dashboard e card lateral da sidebar/`updateFooter`) exibiam o resultado negativo em vermelho — falso alarme, pois o negativo decorria da ausência de lançamento, não de prejuízo real. Correção (só exibição, nenhum cálculo alterado): guarda `totalRec === 0` em ambos os cards, replicando o padrão que o card "Lucratividade" já usava. Sem receita: exibe total de despesas em cor neutra + mensagem "Falta lançar receitas pra saber se sobrou" (card grande) / "Falta lançar receitas" (lateral), em linguagem de ME. Com receita lançada: comportamento inalterado (verde/vermelho real). Validado em preview da Vercel antes do merge. Melhoria de ativação: o app deixa de assustar quem ainda não completou o cadastro de receitas no mês.
- ✅ **Funil de venda self-service fechado de ponta a ponta (23/06/2026)** — branch `funil-venda`, merge na `main`. **T1:** botão de Cartão de Crédito oculto na UI do checkout (`display:none`), só PIX e Boleto ativos; código de cartão preservado no backend para reativar com tokenização no futuro. **T2:** criada `public/obrigado.html` (confirmação pós-pagamento) + rota `/obrigado` no `vercel.json`; adicionado `callback { successUrl: 'https://minhafirma.app/obrigado', autoRedirect: true }` no payload de criação de assinatura em `api/asaas.js` — o Asaas redireciona o cliente automaticamente sem configuração manual no painel; domínio `minhafirma.app` confirmado nos dados comerciais da conta Asaas (o Asaas valida mesmo domínio). **T3:** Supabase Realtime subscribe em `profiles.plano` no `index.html` — `setupRealtimePlano()` cria canal `postgres_changes` filtrado por `id` do usuário; ao receber `UPDATE` com plano diferente, chama `loadPlanos()` + `initApp()` + toast de boas-vindas sem reload; canal destruído no logout; Realtime habilitado na tabela `profiles` via `alter publication supabase_realtime add table profiles`. **Teste real end-to-end validado:** conta UDSHOP pagou Plano Pro (R$ 44,90) via PIX → redirecionou para `/obrigado` → plano liberado para Pro no app (Realtime + toast) → R$ 44,90 (menos taxa) creditado na conta Asaas.
- ✅ **Correção de planos concedidos por engano + diagnóstico do "bug de trial" (24/06/2026)** — investigação revelou que a `checkTrialExpirado()` (`index.html` ~1249) **não tem bug de lógica**: calcula por `created_at` em tempo real, rebaixa só visualmente via gates, nunca escreve no banco, e retorna `false` imediatamente para planos pagos. O problema real: ~14 usuários estavam com `plano = 'starter'/'pro'/'enterprise'` no banco sem terem pago — concedidos manualmente pelo modal "Editar Usuário" do admin (`admin.html` / `salvarUsuario` ~797), que faz `UPDATE` direto em `profiles.plano` sem verificar pagamento. Como viraram "pago", a regra "plano pago nunca expira" os protegia indefinidamente. **Corrigido via SQL no Supabase** (`UPDATE profiles SET plano='gratis' WHERE plano IN ('starter','pro','enterprise') AND email NOT IN (Gustavo Néri, conta admin)`). Estado confirmado pós-correção: enterprise=1 (Gustavo Néri), starter=1 (conta admin), gratis=19, pro=0. UDSHOP e CONECTADOSCPA (pagantes de teste no Asaas) também rebaixados. Dados de lançamento preservados — rebaixar plano altera só gates, não apaga dados. **Mapa completo de escritas em `profiles.plano`:** (1) signup → sempre `'gratis'`; (2) `admin salvarUsuario` → qualquer plano, sem trava — origem do problema; (3) `webhook-asaas` → pagamento confirmado.
- ✅ **Dashboard — card Lucratividade + gráfico histórico (11/06/2026)** — na branch `dashboard-graficos`, commit `8ec6783`. Mudanças: (1) card "Extraídos pela IA" substituído por Lucratividade (margem líquida = (recMes − despMes) / recMes × 100, reusando as variáveis já existentes; edge case tratado: receita zero exibe "—" / "Sem receitas no mês", nunca NaN); ordem final dos KPIs: Resultado · Receitas · Despesas · Maior CC · Lucratividade · Pendentes. (2) Bloco novo de gráfico histórico abaixo dos cards (Chart.js v4 via CDN): receitas e despesas em barras, lucro em linha; leitura apenas (consulta de receitas/despesas agregadas por mês, sem escrita). (3) Régua de meses dinâmica: o eixo parte do mês de criação da conta (`currentProfile.created_at`) até o mês atual, inclusive, com teto de 12 meses e fallback seguro (11 meses atrás) se o perfil não carregar — elimina os meses zerados anteriores ao cadastro. Ajustes de exibição: altura fixa (320px desktop / 260px mobile via `maintainAspectRatio:false`), linha de lucro reta (`tension:0`) e eixo Y com folga para negativos (`grace:'10%'`). CSS isolado com prefixo `dash-*`. Validado no desktop e mobile. Sem mudança de schema (só leitura).
- ✅ **Tradução de linguagem técnica → linguagem do ME — Rodada 1 / alta visibilidade (24/06/2026)** — branch `traducao-linguagem-r1`, merge --no-ff na `main`, commit `7949024`. Princípio: o dono de ME não entende jargão de contador; o app passa a falar a língua dele para gerar reconhecimento. Traduções nos pontos de alta visibilidade (`public/index.html` apenas — `pricing.html`, `beta.html` e `admin.html` fora do escopo): menu "Centros de Custo" → "Meus gastos"; card "Maior CC" → "Maior gasto"; seção "Despesas por Centro de Custo" → "Pra onde foi o meu dinheiro"; menu "DRE" → "Resumo do mês"; "DRE Pessoal" → "Resumo pessoal"; "Ver DRE completo" → "Ver resumo completo" (sidebar pago + grátis + CTA do dashboard); "DRE via IA" → "Resumo com IA"; alerta "Pró-labore não lançado este mês!" → "Você ainda não registrou seu salário este mês" (subtexto também reescrito em linguagem do ME); CTA "Lançar pró-labore de [mês]" → "Lançar seu salário de [mês]" (3 ocorrências, variável do mês preservada). Regra de segurança seguida: traduzido só texto de exibição — valores que viram dado (opção "Pró-labore" no select de categoria, comparações `categoria === 'Pró-labore'`, nomes de CC salvos, IDs de elemento, `onclick` com `showPage`) **não foram tocados**. DASN mantido com rótulo "Declaração Anual" — exceção deliberada por ser nome oficial de obrigação fiscal real. 14 trocas de texto, zero lógica/dado alterado. Validado em preview Vercel antes do merge.
- ✅ **Tradução de linguagem técnica → ME — Rodada 2 / baixa visibilidade (25/06/2026)** — branch `traducao-linguagem-r2`, merge --no-ff na `main`, commit `66167af`. Fechou a coerência dos pontos internos que ainda brigavam com o menu traduzido na R1. **Centro de Custo → "Tipo de gasto":** título de tela no topbar (`"Centros de Custo"` → `"Meus gastos"`), cabeçalho da tabela de despesas (`"CC"` → `"Tipo de gasto"`), tabela de detalhamento por CC, aba e filtro do Orçado vs Realizado, label de campo nos formulários de lançamento/edição de despesa e orçamento, coluna do preview de importação CSV. **DRE → "Resumo":** título de tela no topbar (`"DRE — Demonstrativo de Resultado"` → `"Resumo do mês"`), heading interno → `"Resumo financeiro"` (neutro, porque o período pode ser mês/trimestre/ano), botão `"Gerar DRE"` → `"Gerar resumo"`, toasts de exportação e estado vazio. **Resultado Líquido → "Quanto sobrou".** Exceções mantidas: primeira linha do CSV exportado mantém `"DRE — Demonstrativo de Resultado"` (referência para o contador); `"Declaração Anual"` preservado. Salvaguarda de dado confirmada: labels traduzidos sem tocar nos `<select>` (valores de CC), comparações `tipo==='cc'`, IDs ou `showPage`. 21 substituições, zero lógica/dado alterado. Validado em preview Vercel antes do merge. **R1 + R2 fecham a tradução de navegação e rótulos em todo `public/index.html`.**
- ✅ **Orçamento como porta de entrada — liberado para todos os planos + fluxo de ativação (26/06/2026)** — branch `orcamento-porta-de-entrada`, merge --no-ff na `main`, commit `90a726f`.
- ✅ **Etapa B — recorrência removida de Lançar Despesa (27/06/2026)** — branch `remove-recorrencia-despesa`, merge --no-ff na `main`, commit `c68a8c6` → merge `eee657e`. Removidos: select `#f-recorrente`, div `#f-recorrencia-fim-group`, `toggleRecorrencia()`, `gerarDatasRecorrentes()`, campos `recorrente`/`frequencia`/`recorrencia_fim` do objeto de insert, bloco de batch insert de filhos com `recorrencia_pai`, badge 🔄 na listagem (código morto). Colunas do banco preservadas (schema não alterado). Finanças Pessoais (`p-recorrente`) intocadas — confirmado por diff. Remoção segura: zero registros com `recorrente=true` no banco. A recorrência vive agora exclusivamente no orçamento (Etapa A).
- ✅ **Recorrência mensal no orçamento + fix de navegação por mês/ano (26/06/2026)** — branch `recorrencia-no-orcamento`, merge --no-ff na `main`, commits `a6ffeec` (recorrência) + `c837a90` (fix nav) → merge `1de45c3`. **Recorrência:** modal "Definir Orçamento" ganhou checkbox "Repetir mensalmente" com contador 1–12 (default 12), preview em tempo real ("Serão criados N itens orçados, de [mês] a [mês]", N=total com virada de ano correta). Ao salvar, cria N linhas em `orcamentos` (uma por mês consecutivo), verificando o array em memória para pular meses que já têm orçamento (sem sobrescrever ajuste manual). Toast informa quantos meses criados e quantos já existiam. Aparece apenas em novos orçamentos mensais (oculto na edição e no modo anual). **Fix de navegação:** botão 🔄 Atualizar chamava `showPage()` → `initOrcamento()`, que sempre resetava `orc-mes` e `orc-ano` para o período atual, apagando a escolha do usuário. Corrigido para `loadOrcamentos().then(renderOrcamento)`: recarrega só os dados sem reinicializar os selects. Bug pré-existente revelado pela recorrência, que pela primeira vez criou dados em meses/anos futuros. Validado de ponta a ponta: 12 meses criados (jun/2026–mai/2027), navegação e virada de ano (jan/2027) confirmadas. **Nota:** a recorrência foi removida de Lançar Despesa na Etapa B (merge `eee657e`) — a recorrência vive agora exclusivamente no orçamento. O módulo "Orçado vs Realizado" deixou de ser exclusivo do Enterprise e virou a primeira tela do app. **Gate removido nas duas pontas:** item de menu visível para todos os planos (`initApp`) e bloqueio com `alertPlano`+redirect removido de `initOrcamento`. Conta Grátis agora acessa o orçamento normalmente. **Desvio não-bloqueante:** após o onboarding (`obFinalizar`) e no login (`doLogin` + IIFE de sessão), o usuário **sem** orçamento é levado à tela de orçamento com a mensagem "Comece montando seu orçamento — É assim que o app descobre quanto você precisa faturar por dia pra não ter prejuízo" + botão "Montar meu orçamento" + link de saída "Explorar o app primeiro" (leva ao dashboard, navegação livre — telas gerenciais ficam vazias sem dados, filosofia "professor, não fiscal"). Usuário que **já tem** orçamento vai direto ao dashboard. Função `temOrcamento()` criada para a detecção, consultando a tabela `orcamentos` por `user_id`. **Bug corrigido no mesmo trabalho:** `temOrcamento()` ignorava o `error` da consulta e, em caso de borda (timing de sessão no login), assumia "sem orçamento" e desviava quem já tinha orçamento. Correção: trata o `error` — consulta OK + tem registro → não desvia; consulta OK + zero registros → desvia (correto p/ quem não tem); consulta com erro → não desvia + loga (na dúvida, não prende o usuário). **RLS da tabela `orcamentos` investigado e confirmado saudável** (RLS habilitado, policy "Users can manage own orcamentos" cmd=ALL com `auth.uid() = user_id`, role `authenticated` com SELECT) — nunca houve problema de permissão; descartado. Validado em produção com conta Grátis. **Padrão frágil registrado p/ futuro:** o mesmo "ignora `error` da query e assume vazio" existe em `loadOrcamentos()` (~4051) e possivelmente em outros pontos — revisar como melhoria técnica.
- ✅ **Edição de orçamento travada por cota — corrigida (27/06/2026)** — branch `fix-editar-orcamento-cota`, merge --no-ff na `main`, commit de merge `a149f1f`. Em produção. **Problema:** em `salvarOrcamento()`, a verificação `podeLancar()` ficava antes da decisão entre UPDATE (editar orçamento existente) e INSERT (criar novo), bloqueando indevidamente a edição de um orçamento já criado quando a cota de lançamentos do mês estava esgotada. Editar não cria registro novo, logo não deveria consumir cota. **Correção:** `podeLancar()` removida da posição inicial e reinserida apenas nos dois caminhos de criação (INSERT simples e loop de recorrência); o caminho de UPDATE passa livre. Mudança restrita a `salvarOrcamento()`. **Achado registrado p/ futuro:** `podeLancar()` conta despesas do usuário sem filtro de mês, apesar da mensagem dizer "lançamentos/mês" — na prática é limite total acumulado, não mensal. Pré-existente, fica no radar. Aceita sem teste em produção (baixo risco): a correção é uma mudança pequena e revisada (mover `podeLancar()` para os caminhos de criação); pior caso de erro seria um usuário Grátis no limite não conseguir editar — sem perda de dado nem quebra do app. Validação dispensada por desproporção de esforço (exigiria conta Grátis com cota esgotada). Reavaliar só se surgir relato real.
- ✅ **Service Worker / manifest servidos com MIME errado — corrigido (27/06/2026)** — commit `4b45262`, em produção. **Problema (latente desde maio):** a regra catch-all do `vercel.json` (`/(.*) → /index.html`) capturava também `/sw.js` e `/manifest.json`, fazendo a Vercel servir HTML no lugar do JS/JSON real. O navegador recebia `<!DOCTYPE html>` onde esperava script e disparava "Uncaught SyntaxError" + "unsupported MIME type", quebrando o registro do Service Worker. Ficava invisível para usuários com o SW já em cache; aparecia para usuários novos / janela anônima / após limpar o SW. **Correção:** duas rotas explícitas (`/sw.js` e `/manifest.json` → arquivos reais) inseridas antes do catch-all no `vercel.json`. Confirmado em produção: ambos agora vêm com `Content-Type` correto e o SW registra OK.
- ✅ **Editar orçamento — corrigido (28/06/2026)** — branch `fix-editar-orcamento-uuid`, merge --no-ff na `main`, commit `4ac60d4`, merge `93b9a5a`. Em produção. **Causa raiz:** o `id` da tabela `orcamentos` é um UUID (padrão do Supabase para tabelas novas), e era interpolado sem aspas nos `onclick` da tela Orçado vs Realizado (`openModalOrcamento`, `salvarOrcamento`, `excluirOrcamento`). Um UUID sem aspas (ex.: `139d3b2a-...`) não é JS válido → SyntaxError em runtime ao clicar no lápis ✏️ → o modal nunca abria. Por isso o `node --check` nunca pegava (o erro nasce do dado, não do código), o erro mudava de coluna a cada linha (cada UUID é diferente), e o "+ Orçar" funcionava (passava `null`, válido) enquanto o ✏️ falhava (passava UUID). Não tinha relação com o Service Worker (corrigido em `4b45262`): eram dois bugs distintos sobrepostos. **Correção:** envolver o `orcId` em aspas nos três `onclick`, fazendo-o chegar como string — confirmado que `salvarOrcamento` (decisão UPDATE vs INSERT via `orcId !== 'null'`), as queries `.eq('id', orcId)` e os `.find`/`.filter` por `id` tratam string corretamente. **Bug mobile (mesma tela, corrigido junto):** a tabela de orçamento não tinha `overflow-x:auto` (que as tabelas de Despesas/Receitas têm), escondendo a coluna do lápis em telas estreitas; adicionado `style="overflow-x:auto"` ao `table-wrap`.
- ✅ **Assinaturas de teste no Asaas encerradas (29/06/2026)** — Confirmado em 29/06/2026 no painel do Asaas (Cobranças → Assinaturas): nenhuma assinatura recorrente ativa — tela de Assinaturas vazia. Cobranças antigas (UDSHOP, CONECTADOSCPA) já liquidadas; sem recorrência futura. Item encerrado.
- ✅ **Editar orçamento no mobile — coluna de ações corrigida (29/06/2026)** — branch `fix-orcamento-mobile-scroll`, merge --no-ff na `main`, commit `4c95e8d`, merge `e78166d`. Em produção. **Problema:** após corrigir o bug do UUID (desktop), a coluna do lápis ✏️ ainda não aparecia no celular. O `overflow-x:auto` adicionado antes não bastava: a tabela de orçamento tem colunas numéricas curtas e quase cabia no viewport mobile, então o scroll horizontal nunca ativava, e o browser comprimia a última coluna (ações) a zero. **Correção (2 linhas):** `min-width:600px` na `<table>` (garante que a tabela sempre transborde no mobile, ativando o scroll do wrapper) + `width:80px` no `<th>` vazio da coluna de ações (reserva espaço pro botão). Replica o que as tabelas de Despesas/Receitas conseguem organicamente por terem colunas de texto largas. Validado no celular real. Bug de editar orçamento agora fechado nas duas pontas (desktop UUID + mobile scroll).
- ✅ **Card "Fluxo de Caixa" no dashboard (29/06/2026)** — branch `feat-card-fluxo-caixa`, merge --no-ff na `main`, commit `991a91e`, merge `91df12e`. Em produção. Primeira peça do Fluxo de Caixa Realizado (próximo pedaço do mapa do produto). Card novo no dashboard, logo após "Resultado do Mês", mostrando o caixa do mês atual em três linhas: Entrou (receitas, verde), Saiu (despesas, vermelho), Saldo (entrou − saiu, verde/vermelho). Reaproveita as variáveis `totalRec`/`totalDesp`/`resultado` já calculadas para o card de Resultado — mesma base (mês atual, exclui rejeitados), sem query nova nem schema. Só empresa (não pessoal); sem saldo inicial (parte do que foi lançado). 8 linhas, zero CSS novo (classes `dash-*` existentes), responsivo. **Decisão de produto registrada:** por ora o Saldo do Fluxo de Caixa bate com o Resultado do Mês (mesmo número) — diferenciados pela forma (Resultado = um número; Fluxo de Caixa = entrou/saiu/saldo); os dois divergirão de verdade quando o app distinguir data de competência vs. pagamento (ver frente futura registrada em Pendências). **Pendente:** segunda peça — página de detalhe com extrato dia a dia.

---

## Pendências

- ⬜ **Downgrade automático por inadimplência (frente a construir)** — hoje o webhook do Asaas (`webhook-asaas.js`) só **sobe** o plano ao confirmar pagamento; não há mecanismo que **desça** quando o cliente para de pagar. Regra desejada: "cliente que não paga por ~1 mês volta automaticamente para Grátis, sem perder os dados lançados (poderá voltar a pagar e reencontrar tudo)". Implementação: reagir a eventos de cancelamento/atraso do Asaas (ex.: `PAYMENT_OVERDUE`, `SUBSCRIPTION_DELETED`) e setar `plano='gratis'`. Mexe em pagamento e dado de usuário — tratar como workstream próprio com autorização explícita. O teste de reversão das contas UDSHOP/CONECTADOSCPA fica para quando esse mecanismo existir (foram rebaixadas manualmente em 24/06/2026).
- ⬜ **Etapa 2 do orçamento — versão limitada no Grátis vs completa no pago (frente estratégica, junto do redesenho de planos)** — a Etapa 1 liberou o orçamento completo e igual para todos os planos. Como isso tirou um diferencial do Enterprise, a Etapa 2 deve definir uma versão **limitada** do orçamento no Grátis (prova o conceito) e completa nos pagos (poder total) — meio-termo para manter a porta de entrada universal sem perder o orçamento como diferencial. Decisão do **limite** (quantas categorias? quantos meses? algum recurso só no pago?) ainda não tomada — não definir no impulso; tratar junto do **redesenho de planos** (fronteira grátis vs pago) e idealmente após observação de ativação ao vivo. Avaliar também se o limite de 10 lançamentos do Grátis atrita com a estratégia de ativação.

- ⬜ **Trial baseado em `created_at` é frágil (melhoria futura)** — a janela de 30 dias do trial usa `currentProfile.created_at`, que pode mudar (upsert no signup, trigger do Supabase, edição manual) e reabrir o trial sem querer. Ideal: criar campo dedicado `trial_started_at` em `profiles` que é gravado uma única vez no signup e nunca atualizado. Mudança de schema + lógica simples — planejar como workstream separado.

- ⬜ **Furos menores do funil ainda abertos** — (a) **E-mail duplicado:** cliente recebe dois emails ao pagar (Asaas nativo + Resend branded) — confirmado ao vivo no teste de 23/06/2026; desligar o aviso do Asaas em Meus Clientes → Cliente → Notificações → desmarcar "Avisar quando pagamentos forem confirmados". (b) **Sem tela de cancelamento no app:** hoje o cliente só cancela a assinatura pelo painel do Asaas, não há fluxo self-service no app. (c) **`doSignup` não salva `plano='gratis'` no DB:** campo fica `NULL`, tratado por fallback `|| 'gratis'` em todo o código — funciona mas é frágil; corrigir no `upsert` do signup. (d) **Cartão de crédito real (tokenização):** adiado; priorizar quando houver demanda real de clientes.

- ⬜ **Sobreposição de email de confirmação de pagamento** — ver item "Furos menores do funil" acima (furo a). Decisão tomada: ficar só com o email Resend (branded). Gatilho: desligar o aviso nativo do Asaas nas configurações do cliente.
- ⬜ **Captura de lançamentos via WhatsApp (movimento futuro)** — usuário envia foto/áudio/texto e o app lança sozinho, reusando a IA de scan que já existe. Valor alto, mas hoje é paridade competitiva (não diferencial — concorrentes como ZapGastos já fazem), e tem custo/risco altos: API oficial da Meta (paga, burocrática) vs. não-oficiais (risco de banimento). Decisão de arquitetura — planejar antes. Pitch certo no futuro: "entre pelo Zap E tenha DRE/orçamento que os apps-de-Zap não dão".
- ⬜ **Open Finance — integração bancária automática (movimento futuro, baixa prioridade)** — puxaria transações do banco sozinho, sem o usuário baixar/subir CSV. Hoje o import de CSV já cobre a necessidade. Open Finance é regulado pelo Banco Central, exige intermediário autorizado (Belvo, Pluggy, Klavi etc.) com custo recorrente e responsabilidade LGPD pesada. Não recomendado no estágio atual.
- ⬜ 2FA / MFA — não implementado
- ⬜ Múltiplas unidades (Enterprise) — sem implementação visível
- ⬜ Gestão de equipe/colaboradores — sem convite ou multiusuário por empresa
- ⬜ Webhooks adicionais do Supabase — além do de pagamento
- ⬜ Testes automatizados — nenhum

- ⬜ **Aba Receitas — botão de despesa indevido** — a tela de Receitas exibe um botão de "lançar despesa" que não faz sentido ali; avaliar remoção (mesma natureza das redundâncias já corrigidas no dashboard). Frente a tratar.
- ⬜ **Tradução de linguagem — Rodada 3 / conteúdo dos relatórios (futuro)** — as R1/R2 traduziram navegação e rótulos, mas o conteúdo interno dos relatórios continua em jargão pesado de contador. Ex.: dentro de "Resumo financeiro" (ex-DRE) as linhas dizem `"CUSTOS DE PRODUÇÃO (CMV)"`, `"MARGEM DE CONTRIBUIÇÃO"`, `"RESULTADO OPERACIONAL (EBITDA)"` — incompreensíveis para o ME. Hoje o título promete linguagem simples mas o corpo entrega jargão. Tratar o conteúdo de relatórios (Resumo financeiro/DRE, possivelmente DASN e Relatórios IA). Mesma regra: só exibição, nunca valores de dado.
- ⬜ **Dashboard — possível redundância card "Maior CC" × bloco "Despesas por Centro de Custo"** — com o card Maior CC agora expansível (ranking de CCs), o bloco de barras abaixo passou a mostrar informação semelhante. Avaliar, com uma conta de dados variados, se mantém os dois ou remove as barras. Não decidido (conta de teste só tinha 1 CC no mês, não deu para julgar).
- ⬜ **Descrição comercial da conta Asaas desatualizada** — o campo "Descrição" nos dados comerciais da conta Asaas está como "Aplicativo Descont.aí" (nome antigo). Corrigir para "Minha Firma" no painel do Asaas → Minha conta → Dados comerciais. Cosmético, sem impacto funcional.

- ⬜ **Dashboard — fundo de tela cinza claro a reavaliar** — o fundo geral do dashboard (área cinza-clara atrás dos cards e do gráfico) pode ficar mais escuro para dar mais impacto visual. É o fundo de página padrão, definido fora do bloco `dash-*`; mexer afeta o dashboard inteiro e possivelmente outras telas que compartilham o mesmo fundo. Tratar como frente própria (não misturar com ajustes pontuais), avaliando o efeito colateral em outras telas antes de aplicar.

- ⬜ **Distinguir caixa de competência — frente futura grande (surgida em 29/06/2026)** — hoje o app trata toda receita como entrada de caixa e toda despesa como saída no mesmo momento do lançamento, então "Fluxo de Caixa" e "Resultado do Mês" dão o mesmo número. Conceitualmente deveriam divergir: venda fiada conta no resultado hoje mas entra no caixa depois; compra à vista sai do caixa hoje mas vira custo só quando vendida. Essa distinção (data de competência vs. data de pagamento) é o que materializa o princípio central "caixa ≠ lucro" com números reais, não só com texto. Frente grande (envolve datas de pagamento, fiado, contas a receber/pagar) — tratar muito depois, após o Fluxo de Caixa realizado básico estar rodando. Por ora os dois cards coexistem diferenciados pela forma (Resultado = um número; Fluxo de Caixa = entrou/saiu/saldo), aceitando que o saldo bate com o resultado até essa distinção existir.

_**Nota de roadmap (03/06/2026):** análise de concorrentes (ZapGastos, MeusGastos, MoneyMio, Meu Assessor) mostrou que entrada por WhatsApp e Open Finance viraram comuns em apps de finanças **pessoais**, mas nenhum deles entrega a profundidade gerencial/fiscal do Minha Firma (DRE, DASN, centros de custo, orçado vs. realizado, foco em ME além de MEI). Diferencial do produto está na profundidade, não na porta de entrada. Prioridade definida: (1) notificações por email — confirmação de pagamento própria entregue (03/06) e lembretes de vencimento cobertos nativamente pelo Asaas (sem código); (2) WhatsApp e Open Finance como movimentos futuros, quando a base crescer e a conveniência de entrada virar gargalo._

_**Nota (10/06/2026):** existe uma branch `Dev` (`6a0cb62`) no repositório, descoberta durante o merge do dashboard. Investigar seu conteúdo/propósito quando for montar o ambiente de desenvolvimento isolado._

---

## Bugs conhecidos

_Última auditoria de código: 03/06/2026. Em 03/06/2026: investigado o descompasso PIX/boleto anotado no dia anterior — concluído que não é bug (o app envia `billingType` correto; a página de boleto-com-PIX é comportamento padrão do Asaas para assinaturas PIX, ver seção Concluído). Resta em aberto apenas a fragilidade do email como elo único. Bug de telas empilhadas (onboarding + dashboard) e lógica de trial corrigidos em 01/06/2026 — ver seção Concluído. Auditoria de segurança do /admin concluída em 31/05/2026. Em 01/06/2026 também: webhook do Asaas protegido (commit d6cacec); recuperação de senha implementada (commits 2af763d e 8ac482b); config de pagamento manual descontinuada (commit e03ff2d); admin.html alinhado ao modo claro (commit 85e83c8). Em 02/06/2026: bug de onboarding em loop corrigido — coluna `profile_type` criada no Supabase e botão "Pular" removido (commit ef59893); 1º pagamento real Asaas validado de ponta a ponta — fluxo operacional._

Nenhum bug em aberto no momento (28/06/2026). Bug de edição de orçamento corrigido em `4ac60d4` — ver seção Concluído.

---

## Armadilhas técnicas

- **UUID em `onclick` quebra em runtime (Supabase tabelas novas):** ids de tabelas criadas pelo dashboard do Supabase são `uuid` (texto), não inteiros. Ao interpolar um id em `onclick="funcao(${id})"`, sempre usar aspas: `onclick="funcao('${id}')"`. Sem aspas, o UUID (ex.: `139d3b2a-f5c4-...`) vira JS inválido → SyntaxError em runtime que o `node --check` nunca pega (o erro nasce do dado, não do código-fonte). Tabelas antigas do projeto (`despesas`, `receitas`) têm `id` inteiro e funcionam sem aspas — não copiar esse padrão para tabelas com UUID. Ver commit `4ac60d4`.

---

## Convenções de UI

**Paleta**
- Accent principal: `#d85a30` (laranja — botões primários, links, destaques)
- Verde `#3b6d11` (aprovado / positivo)
- Vermelho `#a32d2d` (rejeitado / crítico)
- Amarelo `#854f0b` (pendente / aviso)
- Dark mode automático via `prefers-color-scheme: dark`

**Componentes (classes CSS)**
- Botões: `.btn`, `.btn-primary`, `.btn-danger`, `.btn-sm`, `.btn-xs`
- `.card` (container padrão), `.metric` (KPI com valor grande)
- Badges: `.badge`, `.badge-ai`, `.badge-admin`, `.badge-op`
- Alertas inline: `.alert`, `.alert-info`, `.alert-warn`, `.alert-success`
- `.modal` com overlay, `.toast`, `.tabs`, `.table-wrap`

**Layout**
- Sidebar fixa (desktop) / drawer com overlay (mobile, breakpoint 768px)
- Topbar com título dinâmico + toggle Empresa/Pessoal + ação rápida
- Grid `repeat(auto-fit, minmax(...))` para cards responsivos
- Ícones SVG inline (sem biblioteca externa); tipografia do sistema

---

## Notas para manter este doc útil

Este README é a fonte de verdade do projeto. Sempre que algo mudar — nova tela, bug resolvido, integração concluída — atualize aqui junto com o código. O mesmo arquivo pode ser anexado a um Projeto no Claude para dar contexto sem precisar reexplicar.
