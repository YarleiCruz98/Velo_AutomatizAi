# Ambiente de Preview com Banco Isolado

## Decisão de arquitetura

Variáveis `VITE_*` são substituídas por valores literais durante o build. Por
isso o pipeline gera dois bundles a partir do mesmo commit:

1. o bundle de preview usa as variáveis `VITE_SUPABASE_*` de Preview;
2. os testes E2E validam esse deploy e usam exclusivamente o banco de preview;
3. o bundle de produção é compilado novamente com as variáveis de Production;
4. somente o segundo bundle é publicado no domínio de produção.

O workflow não promove diretamente o artefato compilado para preview. Essa
escolha torna explícito no pipeline qual conjunto de variáveis foi usado em
cada bundle e evita depender de mudanças de comportamento do comando
`vercel promote`.

## Fluxo

```text
Unit Tests
    -> Sync Supabase Preview
    -> Build and Deploy Preview
    -> Verify Preview bundle
    -> Playwright E2E on Preview
    -> Optional Sync Supabase Production
    -> Build Production
    -> Verify Production bundle
    -> Deploy Production
```

## 1. Projetos Supabase

São necessários dois projetos diferentes:

| Ambiente | Finalidade |
|---|---|
| Production | Dados reais da aplicação |
| Preview | Massa criada, alterada e removida pelos testes E2E |

Crie o projeto de preview no Supabase, por exemplo `velo-sprint-preview`.
Depois aplique os arquivos versionados no repositório:

```bash
yarn supabase login
yarn supabase db push --db-url "$PREVIEW_DATABASE_URL" --yes
yarn supabase functions deploy --project-ref "$SUPABASE_PROJECT_REF_PREVIEW"
```

O uso explícito de `--db-url` e `--project-ref` reduz o risco de executar o
comando no último projeto salvo em `supabase/.temp`. Esse diretório não é
versionado.

### Conferência das policies de RLS

Execute a consulta abaixo nos dois projetos e compare os resultados:

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
order by schemaname, tablename, policyname;
```

As policies são criadas pelas migrações em `supabase/migrations`. Não recrie
tabelas ou policies manualmente pela interface.

## 2. Variáveis na Vercel

Configure as mesmas três variáveis nos dois ambientes da Vercel, com valores
do respectivo projeto Supabase:

| Variável | Preview | Production |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do Supabase Preview | URL do Supabase Production |
| `VITE_SUPABASE_PROJECT_ID` | Ref do projeto Preview | Ref do projeto Production |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key do Preview | Publishable key de Production |

Nunca use `service_role` em uma variável `VITE_*`. Tudo que possui esse
prefixo fica disponível no código JavaScript enviado ao navegador.

Depois de alterar uma variável, gere um novo deployment. Builds existentes
continuam com os valores que foram compilados anteriormente.

## 3. Configuração no GitHub

### Repository secrets

| Secret | Uso |
|---|---|
| `VERCEL_TOKEN` | Autenticação da Vercel CLI |
| `VERCEL_ORG_ID` | Organização/time da Vercel |
| `VERCEL_PROJECT_ID` | Projeto da aplicação na Vercel |
| `PREVIEW_DATABASE_URL` | Conexão PostgreSQL exclusiva do Preview |
| `SUPABASE_ACCESS_TOKEN` | Deploy das Edge Functions |
| `TD_TOKEN` | Publicação opcional no TestDino |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Acesso automatizado a preview protegida, se habilitado |

Os próximos secrets só são necessários quando a sincronização automática de
produção estiver habilitada:

| Secret | Uso |
|---|---|
| `PRODUCTION_DATABASE_URL` | Aplicação das migrações em Production |

### Repository variables

| Variable | Exemplo/uso |
|---|---|
| `SUPABASE_PROJECT_REF_PREVIEW` | Ref do projeto de preview |
| `SUPABASE_PROJECT_REF_PRODUCTION` | Ref do projeto de produção |
| `SUPABASE_URL_PREVIEW` | URL pública do Supabase Preview |
| `SUPABASE_URL_PRODUCTION` | URL pública do Supabase Production |
| `ENABLE_PRODUCTION_DB_SYNC` | Defina como `true` somente se o sync automático for desejado |

Crie também um GitHub Environment chamado `production`. Recomenda-se exigir
aprovação manual nesse Environment antes dos jobs que alteram banco ou
publicam a aplicação em produção.

## 4. Travas de segurança

O pipeline possui duas camadas de proteção:

- depois de cada build, procura no bundle a URL esperada do Supabase e rejeita
  a URL do ambiente oposto;
- os helpers de banco do Playwright exigem que `DATABASE_URL` contenha a ref
  do projeto Preview e rejeitam qualquer URL que contenha a ref de Production.

Os testes dessas regras estão em
`playwright/support/database/databaseSafety.test.ts`.

## 5. Evidências para os critérios de aceitação

Após configurar os serviços, execute o workflow e registre:

1. os dois projetos distintos no dashboard do Supabase;
2. o job `Sync Supabase Preview` concluído;
3. os jobs de verificação dos bundles concluídos;
4. os testes Playwright concluídos contra a URL gerada pelo Preview;
5. o pedido de teste presente na tabela `orders` do Preview;
6. o mesmo número de pedido ausente na tabela `orders` de Production;
7. a aplicação publicada em Production criando e consultando pedidos no banco
   de Production.

Nenhum valor real de token, senha, URL de conexão ou chave privilegiada deve
ser adicionado ao repositório.
