# Pátio Livre — experiência pronta para solicitação de reserva

## Objetivo

Reposicionar a interface do Pátio Livre como um marketplace pronto para uso, sem mensagens de validação, catálogo ilustrativo, acesso antecipado ou objetivo interno. A ação central será uma solicitação de reserva confirmada por e-mail: ela indica intenção de demanda e abre atendimento, mas não afirma que data, espaço ou endereço foram confirmados.

## Experiência pública

- A home ocupa a primeira janela inteira em desktop e celular, com carrossel de imagens variadas de cães e áreas externas, busca e CTAs de descoberta.
- A página de resultados usa filtros customizados: botões com popover para zona, uso, porte, cães e recursos; nenhum `select` nativo fica visível.
- O catálogo passa a ter pelo menos doze espaços, todos com fotos distintas, atributos, capacidade e selo `Disponível para solicitar`.
- A página de detalhe apresenta foto, informações, recursos e um mapa navegável de localização aproximada.
- A indicação de localização informa somente bairro/zona. O mapa usa um ponto aproximado e texto de que endereço e disponibilidade são confirmados no atendimento.

## Solicitação de reserva e aviso

1. `Reservar este espaço` leva à rota de solicitação pré-preenchida com o espaço e a região.
2. O formulário pede nome, e-mail, telefone opcional, data, período, tipo de uso, porte e quantidade de cães, orçamento opcional e consentimento de marketing opcional.
3. O envio registra uma solicitação pendente e envia magic link. Após o link, a solicitação é confirmada para operação e atendimento.
4. `Quero ser avisado` permanece como CTA secundário: permite interesse por espaço/região semelhante sem escolher data e período; sua linguagem é de acompanhamento de disponibilidade, não de acesso antecipado ou validação.

## Dados e segurança

- A tabela de solicitações ganha `request_kind` (`reservation_request` ou `availability_alert`), `contact_name`, `contact_phone` e `time_slot`.
- A view operacional deve mostrar o tipo de solicitação junto a contato, origem, destino, data, período, cães, orçamento e UTMs, sempre filtrando confirmados.
- A autenticação por magic link e RLS permanecem. O navegador não recebe a chave de serviço.
- O mapa não guarda nem exibe endereço exato; coordenadas aproximadas são dados de apresentação do catálogo.

## Arquitetura e componentes

- `HeroCarousel` apresenta imagens de largura integral, com controles acessíveis e conteúdo legível sobreposto.
- `FilterMenu` substitui os selects nativos por menus de botão, controlados por teclado e responsivos.
- `InteractiveMap` usa Leaflet + OpenStreetMap com marcador de zona aproximada; se os tiles falharem, mantém o contexto em texto sem bloquear a página.
- `ReservationForm` compartilha validação e envio com o interesse de aviso, mas exige data e período somente para `reservation_request`.
- O catálogo local é expandido, com URLs de imagens variadas e coordenadas aproximadas por zona.

## Erros e linguagem

- Nunca usar na UI pública: “validação”, “ilustrativo”, “acesso antecipado”, “novidades”, “demanda” ou “não é uma reserva”.
- Nunca afirmar que uma reserva está confirmada; após magic link, usar `Solicitação confirmada` e orientar que a equipe confirmará disponibilidade e detalhes.
- Link vencido, autenticação inválida e configuração ausente mantêm mensagens claras e orientam o usuário a reenviar a solicitação.

## Testes e aceite

- Testar que a home não contém mensagens de validação e renderiza o carrossel.
- Testar filtros customizados e a preservação dos parâmetros de busca.
- Testar o CTA de reserva, o CTA de aviso e as regras de campos obrigatórios de cada fluxo.
- Testar que o mapa apresenta localização aproximada e controles navegáveis, sem texto ou dados de endereço exato.
- Executar testes, lint, checagem de tipos e build antes de integrar.
