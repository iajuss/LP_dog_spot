import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { ConfirmationStatus } from "./confirmation-status";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubConfirmResponse(body: Record<string, unknown>) {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => body }) as unknown as Response));
}

test("uma solicitação confirmada não promete disponibilidade", async () => {
  stubConfirmResponse({ confirmed: true, requestKind: "reservation_request" });

  render(<ConfirmationStatus interest="abc" />);

  await waitFor(() => expect(screen.getByRole("heading", { name: /solicitação confirmada/i })).toBeInTheDocument());
  expect(screen.getByText(/confirmar a disponibilidade/i)).toBeInTheDocument();
});

test("um aviso confirmado explica que avisaremos quando houver espaço", async () => {
  stubConfirmResponse({ confirmed: true, requestKind: "availability_alert" });

  render(<ConfirmationStatus interest="abc" />);

  await waitFor(() => expect(screen.getByRole("heading", { name: /aviso confirmado/i })).toBeInTheDocument());
});
