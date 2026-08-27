import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function InterestPage({ searchParams }: Props) {
  const params = new URLSearchParams({ kind: "availability_alert" });
  for (const [key, value] of Object.entries(await searchParams)) {
    if (value !== undefined && key !== "kind") params.set(key, value);
  }
  redirect(`/reservar?${params.toString()}`);
}
