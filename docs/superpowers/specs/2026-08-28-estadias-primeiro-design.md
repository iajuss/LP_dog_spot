# Pátio Livre — estadias em primeiro lugar

## Objetivo

Reposicionar o Pátio Livre de uma vitrine de locais para uma experiência de cuidado: hospedagem e pernoite são a intenção principal de quem deixa o cão sob os cuidados de outra casa. Lazer permanece como opção complementar para quem procura um local para usar junto com o cão.

O catálogo continua seguindo a convenção atual: dados e imagens de apresentação, sem fotos de pessoas, nomes de anfitriões ou avaliações pessoais inventadas.

## Navegação e experiência pública

1. A primeira janela da home pergunta onde o cão vai ficar bem enquanto o tutor está fora.
2. Três escolhas claras conduzem a resultados pré-filtrados: `Hospedagem`, `Pernoite` e `Lazer`.
3. Hospedagem e pernoite recebem a maior hierarquia visual, os primeiros CTAs e os destaques da página. Lazer continua acessível, mas não orienta a narrativa.
4. A seleção não bloqueia a busca: na página de resultados, o tutor pode combinar ou trocar os filtros normalmente.

## Catálogo flexível de estadias

- Um mesmo espaço pode atender hospedagem, pernoite, creche e lazer. Nenhum tipo de espaço é exclusivo por natureza.
- O modelo existente de `allowedUses` permanece como fonte da compatibilidade. A implementação adicionará metadados opcionais de estadia para comunicar ambiente interno, área externa, rotina de acolhimento e capacidade, sem exigir que todos os registros tenham os mesmos atributos.
- Cards e detalhes de estadia mudam o foco de "usar o espaço" para acolhimento em uma casa: casa/jardim, descanso, ambiente protegido e recursos disponíveis.
- O CTA da página de detalhe passa a solicitar uma estadia quando a intenção for hospedagem ou pernoite; para lazer, mantém a solicitação de uso. Ambos preservam a confirmação por e-mail e nunca prometem disponibilidade.

## Direção visual e conteúdo

- Carrossel, destaques e resultados de estadia usam imagens de casas, jardins residenciais, áreas cobertas e locais de descanso. Campos, parques, chácaras abertas e imagens centradas em lazer deixam de aparecer como a mensagem principal.
- Não serão incluídos rostos, perfis individuais, nomes aparentes de cuidadores, notas ou comentários fictícios. A confiança será comunicada pelos atributos reais do catálogo de apresentação: espaço cercado, área externa, abrigo e capacidade.
- A linguagem pública fala de estadia, pernoite, cuidado e ambiente para o cão. Lazer é apresentado como uso complementar.

## Dados, fluxos e falhas

- A URL continua carregando `uso`, bairro, zona e demais filtros. Hospedagem e pernoite chegam pré-selecionados a partir da home e alimentam o formulário existente.
- Quando não houver resultado, o CTA de interesse mantém a combinação escolhida para registrar a necessidade.
- A confirmação por magic link, RLS, dados operacionais e rastreamento de eventos não mudam. A mudança altera intenção e apresentação, não a política de dados pessoais.
- Ausência de metadados opcionais de estadia não impede a renderização: o card usa somente os sinais disponíveis e preserva layout consistente.

## Arquitetura prevista

- A home ganha um seletor de intenção reutilizável e reordena os destaques por prioridade de estadia.
- O domínio do catálogo recebe tipos e rótulos opcionais para a camada de acolhimento, mantendo compatibilidade com filtros e registros atuais.
- Cards, detalhes e formulário consomem a intenção selecionada para adaptar título, copy e CTA sem duplicar o fluxo de solicitação.
- As imagens e descrições do catálogo são revisadas para alinhar cada experiência de estadia à nova direção visual.

## Testes e aceite

- A home prioriza hospedagem/pernoite e encaminha corretamente as três intenções para a busca.
- Um espaço com múltiplos usos aparece nas intenções compatíveis; espaços sem atributos opcionais continuam renderizando.
- Os cards e detalhes de estadia comunicam acolhimento e mantêm o CTA de solicitação com `uso` correto.
- Filtros, estado vazio, formulário, confirmação e eventos preservam a intenção de estadia.
- Antes de integrar: testes completos, lint, checagem de tipos e build.
