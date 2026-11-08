import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { renderWithQuery } from "@/test/utils/render";
import type { SkillRow } from "../schemas/skill";
import { SkillForm } from "./skill-form";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const saved: SkillRow = {
  id: "s1",
  name: "Astro",
  slug: "astro",
  category: "FRONTEND",
  featured: true,
  projectCount: 0,
  experienceCount: 0,
};

async function chooseCategory(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("combobox", { name: "Category" }));
  await user.click(await screen.findByRole("option", { name }));
}

describe("SkillForm", () => {
  it("validates before sending anything", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SkillForm onDone={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add skill" }));

    expect(await screen.findByText("Enter a skill name")).toBeInTheDocument();
    expect(screen.getByText("Choose a category")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveFocus();
  });

  it("creates a skill and calls onDone", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    let body: unknown;
    server.use(
      http.post("*/api/admin/skills", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: saved }, { status: 200 });
      }),
    );
    // jsdom has no origin for relative fetches, MSW matches the path with "*".
    renderWithQuery(<SkillForm onDone={onDone} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText("Name"), "Astro");
    await chooseCategory(user, "Frontend");
    await user.click(screen.getByRole("button", { name: "Add skill" }));

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(body).toEqual({ name: "Astro", category: "FRONTEND", featured: true });
  });

  it("shows a server conflict on the name field", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/api/admin/skills", () =>
        HttpResponse.json(
          {
            error: {
              code: "CONFLICT",
              message: "A skill with this name already exists",
              fieldErrors: { name: ["A skill with this name already exists"] },
            },
          },
          { status: 409 },
        ),
      ),
    );
    renderWithQuery(<SkillForm onDone={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText("Name"), "TypeScript");
    await chooseCategory(user, "Frontend");
    await user.click(screen.getByRole("button", { name: "Add skill" }));

    expect(await screen.findByText("A skill with this name already exists")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
  });

  it("prefills an existing skill for editing", () => {
    renderWithQuery(<SkillForm skill={saved} onDone={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText("Name")).toHaveValue("Astro");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });
});
