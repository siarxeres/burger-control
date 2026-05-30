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

Geridos pelo admin. Trial Starter de 30 dias com banner de alerta. Recursos têm *gates* por plano (ex.: scan IA bloqueado no Grátis).

---

## Mapa de rotas/telas

### Arquivos HTML (rotas no `vercel.json`)
- `/*` → `public/index.html` — app principal (SPA)
- `/beta` → `public/beta.html` — landing do programa beta com formulário
- `/pricing` → `public/pricing.html` — planos e preços
- `/admin` → `public/admin.html` — painel administrativo

### Telas internas da SPA (`public/index.html`)

**Público / pré-app**
- `#auth-screen` — login / cadastro (Supabase)
- `#onboarding-screen` — seleção de perfil (3 passos) e config inicial

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
4. Sem `profile_type`, exibe onboarding de 3 passos (escolha de perfil)
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

- Autenticação completa (login, cadastro, logout, sessão)
- Onboarding com seleção de perfil (3 passos)
- Dashboard com KPIs e 10 alertas inteligentes
- Lançamento manual de despesas e receitas, incluindo recorrentes
- Scan IA de cupons fiscais com preenchimento automático
- Importação CSV com interpretação por IA (múltiplos formatos)
- Exportação CSV (despesas, receitas, finanças pessoais)
- Centros de custo com distribuição visual
- DRE empresarial e pessoal
- DASN para MEI/ME
- Orçado vs Realizado
- Relatórios IA (resumo executivo, anomalias, tendências, sugestões)
- Finanças pessoais (dashboard, extrato, DRE)
- Sistema de planos com gates + trial Starter de 30 dias
- Integração Asaas (criação de assinatura) + webhook de ativação
- PWA instalável com Service Worker e cache offline
- Dark mode automático e layout responsivo
- Páginas `/pricing` e `/beta`
- Painel `/admin` (estrutura e UI presentes)

---

## Pendências

- **Painel admin** — estrutura criada, funcionalidade incompleta (gestão de usuários, CRUD de planos, config do sistema com WhatsApp/PIX)
- **Múltiplas unidades (Enterprise)** — mencionada no plano, sem implementação visível
- **Notificações email/WhatsApp** — campos de config existem no admin, integração não feita
- **Recuperação de senha** — fluxo de reset não identificado no código
- **2FA / MFA** — não implementado
- **Gestão de equipe/colaboradores** — sem tela de convite ou multi-usuário por empresa
- **Webhooks adicionais do Supabase** — além do pagamento
- **Testes automatizados** — nenhum arquivo de teste encontrado
- **Asaas em produção** — completar o cadastro no Asaas para ativar processamento real

---

## Bugs conhecidos

- **`index.html` duplicado na raiz** — existe um `index.html` na raiz separado de `public/index.html`. O `vercel.json` roteia `/*` para `public/index.html`, mas o arquivo da raiz pode interferir.
- **`pricing.html` duplicado** — existe em `public/pricing.html` e na raiz; risco de dessincronia.
- **Admin sem gate de auth robusto** — `admin.html` tem lógica de auth própria em desenvolvimento; não está claro se a rota `/admin` está protegida no servidor.
- **FIXME em `index.html:2701`** — correção pendente em função de análise de CSV (conteúdo exato não detalhado).
- **Trial expirado não bloqueia totalmente** — `isStarterLimitado` restringe novos lançamentos, mas a consistência do bloqueio pela SPA não foi auditada.

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
