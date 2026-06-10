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
| Pagamento | Asaas (PIX, boleto, cartão) |
| IA | Anthropic Claude Sonnet (via `/api/claude.js`) |
| PWA | Service Worker (`sw.js`) + `manifest.json` |
| Estilo | CSS puro no HTML, dark mode via `prefers-color-scheme` |

Sem bundler ou NPM — dependências via CDN (Supabase JS v2).

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
3. Opcionalmente marca como recorrente (mensal/quinzenal/semanal/anual)
4. Salva → insere na tabela `despesas`

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
3. Escolhe método (PIX, boleto, cartão) → frontend envia para `/api/asaas`
4. Asaas cria customer + assinatura, retorna `paymentLink`
5. Pagamento confirmado → webhook `/api/webhook-asaas` atualiza `profiles.plano`

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

---

## Pendências

- ⬜ **Sobreposição de email de confirmação de pagamento (decisão pendente)** — hoje o cliente pode receber DOIS emails ao pagar: o do Minha Firma (Resend, branded — preferido) e o do Asaas (padrão, "Avisar quando pagamentos forem confirmados" ligado no cadastro do cliente). Decisão tomada: ficar só com o do Minha Firma. **Gatilho para agir:** após o 1º pagamento real com o email novo confirmar que o fluxo Asaas→webhook→Resend dispara certo, desligar o aviso de pagamento do Asaas (Meus Clientes → Cliente → Notificações → desmarcar "Avisar quando pagamentos forem confirmados" na coluna "Para meu cliente"). Até lá, manter os dois ligados como rede de segurança. Não forçar pagamento só para isso — aguardar ciclo real.
- ⬜ **Captura de lançamentos via WhatsApp (movimento futuro)** — usuário envia foto/áudio/texto e o app lança sozinho, reusando a IA de scan que já existe. Valor alto, mas hoje é paridade competitiva (não diferencial — concorrentes como ZapGastos já fazem), e tem custo/risco altos: API oficial da Meta (paga, burocrática) vs. não-oficiais (risco de banimento). Decisão de arquitetura — planejar antes. Pitch certo no futuro: "entre pelo Zap E tenha DRE/orçamento que os apps-de-Zap não dão".
- ⬜ **Open Finance — integração bancária automática (movimento futuro, baixa prioridade)** — puxaria transações do banco sozinho, sem o usuário baixar/subir CSV. Hoje o import de CSV já cobre a necessidade. Open Finance é regulado pelo Banco Central, exige intermediário autorizado (Belvo, Pluggy, Klavi etc.) com custo recorrente e responsabilidade LGPD pesada. Não recomendado no estágio atual.
- ⬜ 2FA / MFA — não implementado
- ⬜ Múltiplas unidades (Enterprise) — sem implementação visível
- ⬜ Gestão de equipe/colaboradores — sem convite ou multiusuário por empresa
- ⬜ Webhooks adicionais do Supabase — além do de pagamento
- ⬜ Testes automatizados — nenhum

- ⬜ **Aba Receitas — botão de despesa indevido** — a tela de Receitas exibe um botão de "lançar despesa" que não faz sentido ali; avaliar remoção (mesma natureza das redundâncias já corrigidas no dashboard). Frente a tratar.

_**Nota de roadmap (03/06/2026):** análise de concorrentes (ZapGastos, MeusGastos, MoneyMio, Meu Assessor) mostrou que entrada por WhatsApp e Open Finance viraram comuns em apps de finanças **pessoais**, mas nenhum deles entrega a profundidade gerencial/fiscal do Minha Firma (DRE, DASN, centros de custo, orçado vs. realizado, foco em ME além de MEI). Diferencial do produto está na profundidade, não na porta de entrada. Prioridade definida: (1) notificações por email — confirmação de pagamento própria entregue (03/06) e lembretes de vencimento cobertos nativamente pelo Asaas (sem código); (2) WhatsApp e Open Finance como movimentos futuros, quando a base crescer e a conveniência de entrada virar gargalo._

_**Nota (10/06/2026):** existe uma branch `Dev` (`6a0cb62`) no repositório, descoberta durante o merge do dashboard. Investigar seu conteúdo/propósito quando for montar o ambiente de desenvolvimento isolado._

---

## Bugs conhecidos

_Última auditoria de código: 03/06/2026. Em 03/06/2026: investigado o descompasso PIX/boleto anotado no dia anterior — concluído que não é bug (o app envia `billingType` correto; a página de boleto-com-PIX é comportamento padrão do Asaas para assinaturas PIX, ver seção Concluído). Resta em aberto apenas a fragilidade do email como elo único. Bug de telas empilhadas (onboarding + dashboard) e lógica de trial corrigidos em 01/06/2026 — ver seção Concluído. Auditoria de segurança do /admin concluída em 31/05/2026. Em 01/06/2026 também: webhook do Asaas protegido (commit d6cacec); recuperação de senha implementada (commits 2af763d e 8ac482b); config de pagamento manual descontinuada (commit e03ff2d); admin.html alinhado ao modo claro (commit 85e83c8). Em 02/06/2026: bug de onboarding em loop corrigido — coluna `profile_type` criada no Supabase e botão "Pular" removido (commit ef59893); 1º pagamento real Asaas validado de ponta a ponta — fluxo operacional._

Nenhum bug conhecido em aberto no momento.

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
