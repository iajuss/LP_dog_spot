-- Novas verticais de ocasião: além da visita curta, o cão também pode passar
-- o dia, dormir uma noite ou ficar hospedado. Sem isso o formulário não
-- consegue captar a intenção de quem procura estadia.
--
-- ATENÇÃO: rode este bloco sozinho, antes do restante. O Postgres não aceita
-- usar um valor de enum na mesma transação em que ele foi criado.

alter type public.use_type add value if not exists 'creche';
alter type public.use_type add value if not exists 'pernoite';
alter type public.use_type add value if not exists 'hospedagem';
alter type public.use_type add value if not exists 'evento';
