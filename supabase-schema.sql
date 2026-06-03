create extension if not exists pgcrypto;

create table if not exists allowed_technicians (
  re text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  re text primary key references allowed_technicians(re),
  name text not null,
  role text not null default 'tecnico' check (role in ('tecnico', 'administrador')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  technician_re text not null references allowed_technicians(re),
  technician_name text not null,
  type text not null,
  title text not null,
  details text not null,
  status text not null default 'pendente' check (status in ('pendente', 'ok', 'nao_ok')),
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  router_model text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table allowed_technicians enable row level security;
alter table users enable row level security;
alter table requests enable row level security;
alter table scripts enable row level security;

drop policy if exists "Tecnicos consultam scripts" on scripts;
create policy "Tecnicos consultam scripts"
on scripts for select
using (true);

drop policy if exists "Tecnicos criam solicitacoes" on requests;
create policy "Tecnicos criam solicitacoes"
on requests for insert
with check (true);

drop policy if exists "Tecnicos consultam suas solicitacoes" on requests;
create policy "Tecnicos consultam suas solicitacoes"
on requests for select
using (true);

insert into allowed_technicians (re, name) values
('30981', 'ANDERSON PEDRO DE SOUZA'),
('32965', 'FÁBIO APARECIDO ALVES'),
('34322', 'JARY OLIVEIRA'),
('34020', 'JOSÉ DIVINO LEOPOLDINO'),
('30116', 'LUIZ RICARDO ALKIMIN'),
('34892', 'RONALDO CAMPOS LEOPOLDO'),
('30498', 'GUIDO FERREIRA SOBRINHO'),
('30602', 'JOSÉ LUIZ RAIMUNDO'),
('30626', 'JOSIMAR PAULO DE AZEVEDO'),
('33167', 'SÉRGIO HENRIQUE DA SILVA'),
('34298', 'VANDERLEI DOS SANTOS'),
('35383', 'ANDERSON MOREIRA'),
('31369', 'SANTIAGO GUIZALBERTI'),
('30641', 'LEIF ERICKSON'),
('35273', 'RODRIGO SILVA'),
('35476', 'JULIARD TEIXEIRA BARBOSA'),
('32989', 'SILVIO TEIXEIRA DE PAIVA'),
('34854', 'LUCINEI CAMPOS'),
('32626', 'WANDERLEI RODRIGUES SOUZA'),
('30930', 'WILTON DIAS FERNANDES'),
('32590', 'RENILSON SANTANA DE OLIVEIRA'),
('35384', 'JEFERSON ANTUNES')
on conflict (re) do update set name = excluded.name;

insert into scripts (router_model, content) values
('EXEMPLO-ROTEADOR', 'Este é um script de exemplo. Cadastre os scripts reais na tabela scripts do Supabase.')
on conflict do nothing;

create or replace function register_technician(p_re text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  tech allowed_technicians%rowtype;
  existing users%rowtype;
  new_user users%rowtype;
begin
  if p_re !~ '^[0-9]+$' then
    return jsonb_build_object('ok', false, 'message', 'O RE deve conter somente números.');
  end if;

  if length(p_password) <> 8
    or p_password !~ '^[A-Za-z0-9]+$'
    or p_password !~ '[A-Za-z]'
    or p_password !~ '[0-9]' then
    return jsonb_build_object('ok', false, 'message', 'A senha deve ter exatamente 8 caracteres, com letra e número.');
  end if;

  select * into tech from allowed_technicians where re = p_re;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'RE não autorizado para cadastro.');
  end if;

  select * into existing from users where re = p_re;
  if found then
    return jsonb_build_object('ok', false, 'message', 'Este RE já possui cadastro. Faça login.');
  end if;

  insert into users (re, name, role, password_hash)
  values (tech.re, tech.name, 'tecnico', crypt(p_password, gen_salt('bf')))
  returning * into new_user;

  return jsonb_build_object(
    'ok', true,
    'user', jsonb_build_object('re', new_user.re, 'name', new_user.name, 'role', new_user.role)
  );
end;
$$;

create or replace function login_technician(p_re text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  found_user users%rowtype;
begin
  select * into found_user
  from users
  where re = p_re
    and password_hash = crypt(p_password, password_hash);

  if not found then
    return jsonb_build_object('ok', false, 'message', 'RE ou senha inválidos.');
  end if;

  return jsonb_build_object(
    'ok', true,
    'user', jsonb_build_object('re', found_user.re, 'name', found_user.name, 'role', found_user.role)
  );
end;
$$;
