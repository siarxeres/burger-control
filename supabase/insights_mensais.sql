-- Cache dos insights de IA do Resumo do Mês (feature-insight-ia-resumo-mes).
-- Rodar manualmente no SQL Editor do Supabase antes de fazer merge/deploy.
-- Escrito/lido apenas pela function api/gerar-insight-mes.js via SUPABASE_SERVICE_KEY
-- (que ignora RLS) — sem policies, então o frontend não tem acesso direto à tabela.

create table if not exists public.insights_mensais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mes smallint not null check (mes between 1 and 12),
  ano smallint not null,
  texto text not null,
  fechado boolean not null default false,
  gerado_em timestamptz not null default now(),
  unique (user_id, mes, ano)
);

alter table public.insights_mensais enable row level security;
