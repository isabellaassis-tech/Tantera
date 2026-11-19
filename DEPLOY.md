# Deploy gratuito: Render + Neon

## 1. Criar o banco Neon

Crie um projeto PostgreSQL no Neon e copie a connection string pooled. Ela deve ficar apenas como segredo no Render ou em um arquivo `.env` local que nunca seja commitado.

O servidor cria a tabela `tantera_app_state` automaticamente. Contas, registros, pedidos, lotes, estoque, mensagens, aprovações e comprovantes ficam no PostgreSQL. O comprovante não aparece nas rotas públicas; somente Presidência e Financeiro acessam as rotas internas autorizadas.

## 2. Migrar os dados locais uma vez

Com o arquivo local ainda presente, execute no PowerShell:

```powershell
$env:DATABASE_URL="postgresql://..."
$env:DATABASE_SSL="true"
$env:MIGRATE_LOCAL_DB="true"
npm start
```

Quando aparecer `Persistência PostgreSQL ativa (Neon)`, a base local foi copiada para o banco. O arquivo `data/tantera-db.json` é ignorado pelo Git e não deve ser enviado ao repositório.

Para começar sem os dados locais, use `MIGRATE_LOCAL_DB="false"`. O servidor criará os dados de demonstração e a conta configurada pelas variáveis.

## 3. Criar a primeira Presidência

No Render, configure como secrets:

- `DATABASE_URL`: connection string do Neon.
- `DATABASE_SSL`: `true`.
- `TANTERA_ADMIN_NAME`: nome da presidência.
- `TANTERA_ADMIN_EMAIL`: e-mail da conta inicial.
- `TANTERA_ADMIN_PASSWORD`: senha forte temporária.
- `MIGRATE_LOCAL_DB`: `false` depois da migração inicial.

A conta é criada somente se o e-mail ainda não existir. Depois do primeiro acesso, troque a senha e remova `TANTERA_ADMIN_PASSWORD` das variáveis do serviço.

## 4. Criar o Web Service no Render

- Repositório: `isabellaassis-tech/Tantera`.
- Branch: `main`.
- Build command: `npm ci`.
- Start command: `npm start`.
- Health check: `/api/auth/me`.
- Ative deploy automático para novos pushes.

O arquivo `render.yaml` já deixa esses valores preparados. O Render oferece Web Service gratuito, mas ele pode dormir após inatividade; o primeiro acesso depois disso pode demorar. O Neon é a fonte permanente dos dados.

## 5. Atualizações futuras

```powershell
git add .
git commit -m "Descreva a alteração"
git push origin main
```

O Render fará um novo deploy automaticamente. Não faça commit de `.env`, `data/*.json`, comprovantes, tokens ou senhas.
