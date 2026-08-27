# Pátio Livre — desenho do MVP de validação de demanda

## Objetivo e hipótese

O Pátio Livre é uma vitrine de espaços privados para atividades com cães em São Paulo. Nesta primeira versão, o produto não aceita reservas nem promete disponibilidade. O objetivo é validar a hipótese de que tutores querem acesso a locais seguros e privados para passeio, brincadeira, treino ou socialização.

O sinal de demanda de maior valor é um interesse confirmado por e-mail e associado ao contexto de uso: origem do tutor, região desejada, necessidade, cães, data e orçamento.

## Limites do MVP

Inclui descoberta de catálogo, busca, filtros, detalhes aproximados, captura de interesse por espaço ou região, confirmação por magic link, eventos de funil e consulta operacional no Supabase.

Não inclui disponibilidade real, pagamento, calendário, chat, endereço exato, avaliações, criação de anfitriões ou reservas. Todo espaço e imagem do catálogo inicial é ilustrativo, com rótulos visíveis que deixam isto claro.

## Experiência e rotas

- `/`: página inicial com mensagem de validação, busca por bairro/zona e atalhos para usos comuns.
- `/espacos`: resultados com catálogo, busca, filtros claros e contagem de resultados.
- `/espacos/[slug]`: detalhes do espaço ilustrativo, recursos, usos, capacidade e mapa esquemático de área aproximada.
- `/interesse`: formulário de demanda, pré-preenchido a partir de um espaço, busca ou estado vazio.
- `/confirmar`: retorno após o magic link; associa a sessão autenticada ao interesse pendente e apresenta confirmação amigável.

Em telas pequenas, os filtros abrem em painel lateral/modal. Em telas maiores, aparecem como uma coluna lateral. Os cards mostram somente nome ilustrativo, zona/bairro aproximado, usos, um ou dois recursos mais relevantes e capacidade; o detalhe concentra o restante das informações.

Quando não existirem espaços para uma combinação de filtros, a página explica que o catálogo é inicial, mantém a combinação aplicada e oferece um CTA para registrar interesse naquela região e necessidade.

## Dados ilustrativos e localização

O catálogo inicial é uma lista local versionada de espaços fictícios com nomes genéricos, bairro ou zona aproximados e imagens coerentes porém variadas. Nenhum item representa local, endereço, pessoa, disponibilidade ou contato real.

O mapa é um componente visual simples, sem geocodificação precisa: apresenta uma região aproximada de São Paulo e uma mensagem explícita de que o endereço só seria compartilhado em uma eventual etapa futura de disponibilidade. Isso evita expor propriedades privadas e elimina dependência de um provedor externo de mapas no MVP.

## Fluxo de captura e confirmação

1. A pessoa explora, pesquisa ou filtra o catálogo. Eventos anônimos registram a sessão, a origem e as escolhas de filtro.
2. Ela abre um espaço ou seleciona interesse por uma região sem resultados.
3. No formulário, informa e-mail, bairro onde mora em texto livre, bairro/zona onde quer usar, tipo de uso, porte e quantidade de cães, data desejada, orçamento opcional e consentimento de marketing. Origem, UTM, região e filtros são carregados automaticamente quando existirem.
4. O envio cria um interesse com estado `pending_confirmation` e dispara `signInWithOtp` do Supabase Auth, redirecionando o magic link para `/confirmar?interest=<uuid>`.
5. Ao abrir o link, o retorno de autenticação estabelece a sessão. Uma rota protegida valida que o e-mail da sessão é o mesmo do interesse pendente e grava `user_id`, `confirmed_at` e estado `confirmed`.
6. A tela final informa que a pessoa pediu acesso e novidades, sem sugerir que efetuou uma reserva. Ela também registra `interest_confirmed`.

O banco preserva os interesses pendentes apenas como tentativas de confirmação; as consultas de demanda operacional usam exclusivamente interesses confirmados.

## Modelo de dados

### `spaces`

Catálogo ilustrativo opcionalmente sincronizável no Supabase no futuro. A primeira entrega pode servi-lo a partir de dados locais tipados para reduzir complexidade. Campos previstos: `id`, `slug`, `name`, `zone`, `neighborhood_label`, `approximate_map_area`, `allowed_uses`, `dog_sizes`, `max_dogs`, `amenities`, `image_url`, `is_illustrative`.

### `interest_leads`

Cada tentativa de interesse. Campos: `id`, `status`, `contact_email`, `user_id`, `space_slug`, `source_kind`, `home_neighborhood`, `desired_neighborhood`, `desired_zone`, `use_type`, `dog_size`, `dog_count`, `desired_date`, `budget_cents`, `marketing_consent`, `utm_source`, `utm_medium`, `utm_campaign`, `landing_path`, `anonymous_session_id`, `confirmed_at`, `created_at`.

`status` é `pending_confirmation` ou `confirmed`. Campos de contato e identificação não são expostos ao cliente depois da criação. O dado de orçamento é opcional e normalizado em centavos.

### `funnel_events`

Eventos analíticos sem texto pessoal livre: `id`, `anonymous_session_id`, `event_name`, `payload`, `landing_path`, UTMs e `created_at`. Eventos do MVP: `search_started`, `filters_changed`, `space_viewed`, `region_interest_clicked`, `interest_submitted`, `interest_confirmed`.

### `demand_overview`

View do Supabase sobre `interest_leads` confirmados que deixa clara a demanda para operação: contato, bairro de origem, bairro/zona desejados, uso, porte e quantidade de cães, data, orçamento, consentimento, origem/UTMs e momento de confirmação. O acesso será restrito a papéis administrativos no Supabase.

## Segurança e privacidade

- RLS bloqueia leitura pública de leads e eventos identificáveis.
- Uma função/rota de servidor é a única via para criar interesse pendente e confirmar o vínculo e-mail/sessão.
- O navegador nunca recebe chaves de serviço do Supabase.
- O formulário explica o propósito da coleta e deixa o consentimento de marketing opcional e desmarcado.
- Textos de e-mail e de interface estão em português claro e afirmam que se trata de acesso antecipado/novidades, não de reserva.
- Variáveis esperadas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (somente servidor), documentadas em `.env.example` sem valores sensíveis.

## Arquitetura técnica

- Next.js com App Router, TypeScript e Tailwind CSS.
- Componentes de interface focados em mobile: barra de busca, painel de filtros, card de espaço, estado vazio, mapa aproximado, formulário e tela de confirmação.
- Funções puras para normalizar filtros, construir a combinação de demanda e validar campos; testadas isoladamente.
- Rotas de servidor para criação e confirmação de interesse; repositório Supabase com interface que permite testar o fluxo sem credenciais reais.
- Schemas SQL versionados em `supabase/migrations`, incluindo tipos, tabelas, índices, RLS e a view operacional.
- Deploy na Vercel após configurar as mesmas variáveis de ambiente e a URL de redirecionamento autorizada do Supabase Auth.

## Estados de erro

- Formulário inválido: mensagens por campo, sem apagar o preenchimento.
- E-mail magic link não enviado: mensagem para tentar novamente; o lead continua pendente e pode receber novo link.
- Link inválido, vencido ou sessão diferente: orientação para solicitar um novo link, sem revelar dados de outro contato.
- Supabase indisponível: mensagem genérica, evento de falha sem PII e nenhuma falsa confirmação.
- Catálogo sem resultado: CTA contextual de interesse regional, nunca uma tela sem saída.

## Estratégia de testes

Antes da implementação, escrever testes que falham para:

- serialização e aplicação de filtros;
- construção do payload de interesse, inclusive UTMs;
- validação de campos obrigatórios e orçamento opcional;
- modelo de estado de interesse, em especial a transição para confirmado somente quando e-mail e sessão correspondem;
- renderização do estado vazio e do CTA contextual;
- contratos das rotas de criação/confirmação usando um repositório Supabase falso.

Depois, executar testes unitários, lint, checagem de tipos e build de produção. A migração SQL será revisada para verificar RLS e a view de demanda.

## Critério de sucesso

Um visitante consegue encontrar ou simular a busca de um espaço, registrar interesse com o contexto completo, confirmar o e-mail por magic link e aparecer em `demand_overview` como lead confirmado. A equipe consegue medir os eventos e identificar concentração de demanda por origem, destino, necessidade e perfil dos cães sem prometer uma reserva ou expor endereço privado.
