# ReveeFlow

ReveeFlow é um sistema de clareza operacional para criativos, com tarefas, projetos, calendário, timeline, notas, eventos, timer e Flow IA.

## Supabase

O frontend já está configurado para o projeto:

- URL: `https://qfetrnrjpokcocewfujm.supabase.co`
- Publishable key: configurada no `index.html`

Para ativar o salvamento em nuvem:

1. Abra o painel do Supabase.
2. Entre em **SQL Editor**.
3. Cole e execute o conteúdo de `supabase-schema.sql`.
4. Em **Authentication > Providers**, deixe **Email** habilitado.
5. Em **Authentication > URL Configuration**, configure a URL final do site quando ele estiver publicado.

Depois disso, cada usuário deve entrar ou se cadastrar pela tela de login. Os dados ficam salvos por usuário na tabela `reveeflow_workspaces`.

## GitHub

Repositório remoto previsto:

```bash
https://github.com/Daniescatalini/reveeflow.git
```

