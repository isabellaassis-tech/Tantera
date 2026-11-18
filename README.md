# Atlética Tantera

Protótipo HTML, CSS e JavaScript com servidor local de autenticação para a Área da equipe e Shop público.

## Como rodar

1. Instale Node.js 18 ou superior.
2. No PowerShell, entre na pasta do projeto:

```powershell
cd C:\Users\Inteli\Downloads\tantera-vscode\tantera-vscode
```

3. Configure a primeira conta da presidência somente no ambiente local/seguro e inicie o servidor:

```powershell
$env:TANTERA_ADMIN_NAME="Presidência Tantera"
$env:TANTERA_ADMIN_EMAIL="presidencia@tantera.local"
$env:TANTERA_ADMIN_PASSWORD="123"
node server.js
```

Abra <http://localhost:3000>. O Shop e a Área dos alunos continuam públicos; a Área da equipe exige login.

As variáveis de criação da presidência só são usadas quando `data/tantera-db.json` ainda não existe. A senha `123` é apenas para esta demonstração; troque-a imediatamente em um ambiente real. A senha não é salva no arquivo: o servidor grava apenas hash `scrypt` e salt. Remova os valores de senha do histórico do terminal/arquivo de configuração. Em uma implantação real, use HTTPS, variáveis secretas do provedor e um banco gerenciado.

## Permissões

- Presidência: todas as áreas, aprova/recusa sugestões e gerencia contas.
- Diretor: consulta registros aprovados, cria/edita registros da própria área e aprova/recusa sugestões da própria área.
- Integrante: consulta aprovados e envia sugestões pendentes.

Todas as consultas e alterações internas passam por rotas autenticadas no `server.js`; o navegador não é a fonte de verdade das permissões.

## Dados locais

O banco compartilhado do protótipo fica em `data/tantera-db.json`. As contas, registros e aprovações persistem para qualquer navegador que acesse o mesmo servidor local. As cinco fotos do Shop ficam em `assets/`.
