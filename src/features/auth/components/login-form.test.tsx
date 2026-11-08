import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const loginAction = vi.hoisted(() => vi.fn());
vi.mock("../server/actions", () => ({ loginAction }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("callbackUrl=/admin/projects"),
}));

describe("LoginForm", () => {
  beforeEach(() => loginAction.mockReset());

  it("shows field errors and does not submit invalid input", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(loginAction).not.toHaveBeenCalled();
  });

  it("submits normalized credentials with the callback URL", async () => {
    const user = userEvent.setup();
    loginAction.mockResolvedValue(undefined);
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "  Demo@Folio-CMS.dev ");
    await user.type(screen.getByLabelText("Password"), "demo-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(loginAction).toHaveBeenCalledWith(
      { email: "demo@folio-cms.dev", password: "demo-password" },
      "/admin/projects",
    );
  });

  it("shows the server error when credentials are wrong", async () => {
    const user = userEvent.setup();
    loginAction.mockResolvedValue({ error: "That email and password do not match." });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "demo@folio-cms.dev");
    await user.type(screen.getByLabelText("Password"), "nope");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("That email and password do not match.")).toBeInTheDocument();
  });

  it("prefills values, for demo mode", () => {
    render(
      <LoginForm defaultValues={{ email: "demo@folio-cms.dev", password: "demo-password" }} />,
    );
    expect(screen.getByLabelText("Email")).toHaveValue("demo@folio-cms.dev");
  });
});
