# GTD-Ability Tecnologia

Sistema web inicial para acesso dos técnicos, cadastro por RE autorizado, login, solicitações, busca de scripts e consulta de PDF de códigos de baixa.

## Como abrir no Visual Studio

1. Abra a pasta `app` no Visual Studio ou Visual Studio Code.
2. Edite `config.js` com os dados do seu projeto Supabase.
3. Abra `index.html` no navegador, ou use uma extensão de servidor local.

## Configurar o Supabase

1. Crie um projeto gratuito no Supabase.
2. Abra o SQL Editor.
3. Cole e execute todo o conteúdo do arquivo `supabase-schema.sql`.
4. Em Project Settings > API, copie:
   - Project URL
   - anon public key
5. Preencha o arquivo `config.js`.

Exemplo:

```js
window.GTD_CONFIG = {
  SUPABASE_URL: "https://seu-projeto.supabase.co",
  SUPABASE_ANON_KEY: "sua-chave-anon-publica"
};
```

## Publicar no Render grátis

1. Suba a pasta do projeto para um repositório no GitHub.
2. No Render, crie um novo `Static Site`.
3. Selecione o repositório.
4. Configure:
   - Build Command: deixe vazio
   - Publish Directory: `app`
5. Publique.

## Códigos de baixa

Substitua o arquivo `assets/codigos-baixa.pdf` pelo PDF real com os códigos.

## Scripts

Cadastre os scripts na tabela `scripts` do Supabase. O campo `router_model` é usado na busca e o campo `content` deve conter o texto do script.
