# GTD-Ability Tecnologia

Sistema web inicial para acesso dos tecnicos, cadastro por RE autorizado, login, solicitacoes, busca de scripts e consulta de PDF de codigos de baixa.

## Rodar no computador

1. Abra esta pasta no Visual Studio Code.
2. Rode:

```bash
npm start
```

3. Acesse:

```text
http://localhost:4173
```

## Configurar o Supabase

1. Crie um projeto gratuito no Supabase.
2. Abra o SQL Editor.
3. Cole e execute todo o conteudo do arquivo `supabase-schema.sql`.
4. Em Project Settings > API, copie:
   - Project URL
   - anon public key

## Publicar no Render gratis

Crie um `Web Service` no Render usando Node.

Use estes campos:

- Language: `Node`
- Branch: `main`
- Root Directory: deixe vazio
- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: `Free`

Em `Environment Variables`, adicione:

- `SUPABASE_URL`: Project URL do Supabase, no formato `https://seu-projeto.supabase.co`
- `SUPABASE_ANON_KEY`: chave `anon public` do Supabase

Depois clique em `Deploy Web Service`.

## Codigo de baixa

Substitua o arquivo `assets/codigos-baixa.pdf` pelo PDF real com os codigos.

## Scripts

Cadastre os scripts na tabela `scripts` do Supabase. O campo `router_model` e usado na busca e o campo `content` deve conter o texto do script.
