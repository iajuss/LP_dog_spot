import Link from "next/link";
import { ConfirmationStatus } from "@/components/confirmation-status";
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) { const { interest } = await searchParams; return <main className="grid min-h-screen place-items-center bg-[#f8f4eb] px-5"><section className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm"><Link className="text-xl font-black text-emerald-950" href="/">Pátio Livre</Link><div className="mt-10"><ConfirmationStatus interest={interest} /></div></section></main>; }
