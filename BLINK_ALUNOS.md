# AtendeZap na Blink — instalação da sua cópia

Modelo: https://blink.new/project/atendezap-migra-o-ly6fytdy

## Passo a passo

> O projeto modelo não inclui segredos do dono nem credenciais externas. Sem `OWNER_PROJECT_ID` e `OWNER_EMAIL` configurados para a cópia, o bootstrap administrativo falha fechado; nenhum visitante aleatório vira administrador. Não crie conta de teste antes do dono.

1. Entre na sua conta Blink com backend disponível (plano Pro ou superior).
2. Abra o modelo e escolha **Remix**. Não é necessário incluir o histórico da conversa.
3. Cole o prompt abaixo, trocando **SEU_EMAIL_AQUI** pelo e-mail verificado com que entrará no aplicativo.
4. Se aparecer **Adicionar Chaves Secretas**, preencha `OWNER_PROJECT_ID` com o ID DA SUA CÓPIA (último trecho da URL do editor) e `OWNER_EMAIL` com o e-mail verificado do dono. Clique em **Salvar Segredos**. Não copie `OWNER_USER_ID` do modelo nem coloque segredos no código público.
5. Quando a Blink terminar, abra a prévia em uma nova aba. Clique em **Entrar → Entrar com minha conta Blink**. Entre com o mesmo e-mail do prompt e confirme o link enviado por e-mail; confira também o spam.
6. O painel **Master** é sua administração. Em **Nova empresa**, cadastre sua operação de demonstração usando esse mesmo e-mail e deixe a senha vazia, pois seu usuário já existe. Em **Empresas**, use **Entrar como empresa** para acessar o atendimento e CRM.
7. Personalize a marca e configure suas integrações antes de atender clientes. Para colocar no ar em produção, use **Publicar** e confira a hospedagem apresentada pela Blink.

## Prompt para copiar

Ative esta cópia do AtendeZap sem redesenhar nem recriar o sistema. Meu e-mail verificado de administrador é SEU_EMAIL_AQUI. Siga BLINK_ALUNOS.md. O backend completo está em backend/index.ts; publique somente esse artefato, sem dividir funções. Aplique scripts/native/schema.sql e scripts/native/bootstrap.sql ao banco DESTA cópia de forma idempotente. Configure OWNER_PROJECT_ID com o ID deste projeto e OWNER_EMAIL com meu e-mail; não copie OWNER_USER_ID do modelo. Use VITE_BLINK_PROJECT_ID, VITE_BLINK_PUBLISHABLE_KEY e VITE_BLINK_BACKEND_URL desta cópia. Aplique a política de segurança de scripts/native/security-policy.json para bloquear o acesso direto às tabelas de negócio pelo SDK público. Publique o backend, execute npm run build e disponibilize a prévia. Confirme /health com banco conectado e /api/bootstrap configurado após o dono entrar. Não crie usuário de teste, não redesenhe, não gere imagens, não reescreva funções e não ative integrações sem minhas credenciais próprias. Entregue o link de entrada e indique configurações que faltarem. A publicação em produção será feita por mim no botão Publicar.

## Custos observados no teste de 16/09/2026

- Remix: 1 crédito.
- Prompt de instalação: 11,13 créditos, 4min26s de execução. É uma observação deste teste, não um preço garantido para futuras execuções.
- A publicação em produção mostrou hospedagem com 10 mil visitas/mês, primeiro mês grátis e depois 50 créditos/mês. A cópia de teste ficou na prévia, sem ativar essa assinatura.
- Plano, créditos de IA, hospedagem e serviços externos são itens diferentes. Confira os preços e condições apresentados na sua conta.

## O que configurar para usar com clientes

- WhatsApp: servidor Evolution API, URL e chave no backend; depois conectar o número pelo QR Code na tela Conexão.
- IA: o padrão Gemini usa a integração nativa Blink e consome créditos conforme o uso. OpenAI e Anthropic são alternativas opcionais com chaves próprias na configuração do agente. Não é necessário colar uma chave da Blink no chat ou no frontend.
- Google Agenda, opcional: credenciais OAuth, URL de retorno da SUA cópia e autorização da conta Google.
- Cobrança recorrente, opcional: configurar o gateway e seus webhooks. Nenhuma cobrança real é feita pelo teste de clonagem.
- Campanhas automáticas exigem configuração do processador/fila e `CAMPAIGN_WORKER_SECRET`; não ficam prontas apenas ao conectar WhatsApp.
- `PUBLIC_APP_URL` pode ser configurada no backend com seu domínio público para links de pesquisa e retorno do Google.
- Nunca cole segredos no código público. Use Segredos da Blink e as telas próprias de configuração.

## Notas do modelo

- Frontend SPA: Vite + React + TanStack Router.
- Backend Hono: fontes em server/, único artefato implantável em backend/index.ts. Gerar com `node scripts/native/port-domain.mjs` e `npm run build:backend` após mudar funções originais.
- Banco SQLite independente, com políticas de acesso direto negado. O adaptador sql-adapter restaura nomes de colunas porque o SDK Blink converte resultados SQL para camelCase.
- Administração só é instalada com o projeto correto e e-mail verificado. Não depende de ser a primeira pessoa a abrir a página.
- Alteração de senha deve ser feita pelo titular; não há reset arbitrário de senha por administrador.
- O primeiro teste foi em um projeto novo no mesmo workspace Pro, não em outra conta. Recebeu correções de compatibilidade durante a validação, depois incorporadas ao modelo. Integrações externas não foram testadas com envio ou cobrança reais.

## Validação atual da implantação — 02/10/2026

- `OWNER_PROJECT_ID` e `OWNER_EMAIL` estão configurados nos Secrets desta cópia com o ID atual do projeto e o e-mail verificado informado pelo proprietário.
- O Blink Backend foi reimplantado após a configuração dos Secrets. A validação anterior de `GET /health` respondeu HTTP 200 e confirmou `database: connected` (`native-v1`); confira novamente após mudanças de backend.
- `node --test tests/*.test.mjs`: 40 testes passaram, 0 falharam, incluindo isolamento entre empresas por ID, owner/bootstrap, persistência CRM, onboarding e funções migradas. O Node exibiu o aviso conhecido de que `node:sqlite` é experimental.
- A chamada não autenticada a `/api/bootstrap` respondeu 401, como esperado. O bootstrap autenticado do dono ainda não foi validado nesta cópia.
- O build de produção do site foi executado com `bun run build` e terminou com sucesso.
- A implantação avisou que outros Secrets estão ausentes (`EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, chaves Google, chaves de webhook, entre outros). Configure apenas os que for usar. Nenhuma integração externa foi testada com envio de WhatsApp, e-mail ou cobrança real.

## Resultado da validação histórica da cópia — 16/09/2026

Login do administrador, cadastro da empresa, contato persistido após recarregar, mudança de etapa no Kanban, tela de conversas, configuração manual e uma resposta real da IA Blink foram verificados naquela cópia. Naquela execução, 32 testes automatizados passaram. O modelo permaneceu sem empresas e contatos de teste.

## Integrações verificadas em 16/09/2026 — atualização

As credenciais Evolution e Google fornecidas pelo proprietário foram configuradas como segredos no modelo e na primeira cópia de teste; seus valores não fazem parte do código nem deste guia. A Evolution autenticou e o aplicativo gerou o QR Code. O webhook da instância de teste foi conferido separadamente. Conectar um número ainda exige escanear o QR no celular.

Para os alunos, o Remix não deve ser tratado como transferência de segredos: preencher no backend `EVOLUTION_API_URL` e `EVOLUTION_API_KEY` com os dados recebidos do curso e depois abrir **Conexão → Conectar WhatsApp**.

Google Agenda é opcional e não é a IA Gemini. Para usar a agenda, preencher `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`, cadastrar no cliente OAuth do Google a URL **do backend da própria cópia** seguida de `/api/public/google-callback` e autorizar a conta Google pelo aplicativo. Quem administra o cliente OAuth compartilhado precisa cadastrar cada nova URL de retorno; copiar somente as chaves não conclui essa integração. `PUBLIC_APP_URL` deve corresponder ao endereço em que essa cópia será aberta.
