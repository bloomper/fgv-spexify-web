import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PdfReader } from "@/components/sheet/pdf-reader.client";

const pdf = vi.hoisted(() => ({
  render: vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() })),
  destroy: vi.fn(async () => undefined),
}));

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {},
  getDocument: () => ({
    destroy: pdf.destroy,
    promise: Promise.resolve({
      numPages: 3,
      getPage: async () => ({ getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }), render: pdf.render }),
    }),
  }),
}));

describe("the PDF reader", () => {
  beforeEach(() => {
    pdf.render.mockClear();
    globalThis.fetch = (vi.fn(async () => new Response("%PDF")));
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({})) as unknown as HTMLCanvasElement["getContext"];
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 600 });
  });

  const realFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("draws the pages one at a time, with zoom", async () => {
    render(<PdfReader url="/api/sheet-music/t/f" title="Partitur" />);
    expect(await screen.findByText('page:{"page":1,"pages":3}')).toBeInTheDocument();
    await waitFor(() => expect(pdf.render).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "previousPage" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "nextPage" }));
    fireEvent.click(screen.getByRole("button", { name: "nextPage" }));
    expect(screen.getByText('page:{"page":3,"pages":3}')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "nextPage" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "zoomIn" }));
    fireEvent.click(screen.getByRole("button", { name: "zoomOut" }));
    await waitFor(() => expect(screen.getByRole("img", { name: /pageOf/ })).toBeInTheDocument());
  });

  it("says when the file cannot be read", async () => {
    globalThis.fetch = (vi.fn(async () => new Response("", { status: 403 })));
    render(<PdfReader url="/api/sheet-music/t/f" title="Partitur" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("couldNotLoad");
  });
});
