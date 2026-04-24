# 🍔 Burger Control — Instruções de Deploy

## O que você vai precisar
- Conta gratuita no **GitHub** (github.com)
- Conta gratuita no **Vercel** (vercel.com)
- Sua **chave de API** da Anthropic (console.anthropic.com)

---

## PASSO 1 — Criar repositório no GitHub

1. Acesse **github.com** e faça login
2. Clique em **"New repository"** (botão verde)
3. Dê o nome: `burger-control`
4. Deixe como **Public** e clique em **"Create repository"**
5. Na próxima tela, clique em **"uploading an existing file"**
6. Arraste os seguintes arquivos/pastas para a área de upload:
   - Pasta `api/` (com o arquivo `claude.js` dentro)
   - Pasta `public/` (com o arquivo `index.html` dentro)
   - Arquivo `vercel.json`
7. Clique em **"Commit changes"**

---

## PASSO 2 — Fazer deploy no Vercel

1. Acesse **vercel.com** e clique em **"Sign Up"**
2. Escolha **"Continue with GitHub"** — isso conecta as duas contas
3. Clique em **"Add New Project"**
4. Selecione o repositório **burger-control** e clique em **"Import"**
5. Não mude nada nas configurações — clique direto em **"Deploy"**
6. Aguarde ~1 minuto. O deploy vai falhar na parte da IA (normal por enquanto)

---

## PASSO 3 — Configurar a chave da API (IMPORTANTE)

1. No painel do seu projeto no Vercel, clique em **"Settings"**
2. No menu lateral, clique em **"Environment Variables"**
3. Preencha:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** sua chave (começa com `sk-ant-...`)
4. Clique em **"Save"**
5. Vá em **"Deployments"** e clique em **"Redeploy"** no deploy mais recente
6. Após o redeploy, seu app estará 100% funcional!

---

## PASSO 4 — Acessar o app

Após o deploy, o Vercel vai gerar um link como:
```
https://burger-control-seunome.vercel.app
```

Você pode acessar esse link de qualquer navegador, celular ou computador.

---

## Onde obter a chave da Anthropic

1. Acesse **console.anthropic.com**
2. Faça login ou crie uma conta
3. Clique em **"API Keys"** no menu lateral
4. Clique em **"Create Key"**, dê um nome e copie a chave gerada
5. ⚠️ Guarde a chave em lugar seguro — ela só aparece uma vez!

---

## Dúvidas frequentes

**Os dados ficam salvos?**
Sim, os lançamentos ficam salvos no navegador (localStorage). Cada usuário tem seus próprios dados no dispositivo que usar.

**O app funciona no celular?**
Sim, o layout é responsivo e funciona em qualquer dispositivo.

**Posso usar um domínio próprio?**
Sim! No painel do Vercel, vá em Settings > Domains e adicione seu domínio.

**Quanto custa?**
O plano gratuito do Vercel é suficiente para uso normal. A API da Anthropic cobra por uso (veja preços em anthropic.com/pricing).
