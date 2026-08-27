import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f8f4eb] px-5 text-center"><div><p className="text-4xl">🐾</p><h1 className="mt-4 text-3xl font-black text-emerald-950">Não encontramos este espaço.</h1><p className="mt-3 text-stone-600">Ele pode ter saído do ar. Veja os outros espaços disponíveis.</p><Link className="mt-6 inline-block rounded-xl bg-emerald-950 px-5 py-3 font-bold text-white" href="/espacos">Explorar espaços</Link></div></main>;
}
