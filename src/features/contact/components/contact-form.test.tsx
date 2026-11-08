import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import { ContactForm } from "./contact-form";

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Priya");
  await user.type(screen.getByLabelText("Email"), "priya@example.com");
  await user.type(screen.getByLabelText("Message"), "Would you be open to a call?");
}

describe("ContactForm", () => {
  it("explains what is missing without sending anything", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Enter your name")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address, so I can reply")).toBeInTheDocument();
    expect(screen.getByText("Write a message of at least 10 characters")).toBeInTheDocument();
  });

  it("sends the message and moves focus to the confirmation", async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post("*/api/contact", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { sent: true } });
      }),
    );
    render(<ContactForm />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Message sent");
    expect(status).toHaveFocus();
    expect(body).toEqual({
      name: "Priya",
      email: "priya@example.com",
      subject: null,
      message: "Would you be open to a call?",
      website: "",
    });
  });

  it("shows a rate limit message from the server", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/api/contact", () =>
        HttpResponse.json(
          {
            error: {
              code: "RATE_LIMITED",
              message: "Too many messages. Please try again in a few minutes.",
            },
          },
          { status: 429 },
        ),
      ),
    );
    render(<ContactForm />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText(/Too many messages/)).toBeInTheDocument();
  });

  it("keeps the honeypot out of the tab order and accessibility tree", () => {
    render(<ContactForm />);
    expect(screen.queryByRole("textbox", { name: "Website" })).not.toBeInTheDocument();
  });

  it("warns demo visitors that messages are visible to others", () => {
    render(<ContactForm demoNotice />);
    expect(screen.getByText(/This is a public demo/)).toBeInTheDocument();
  });
});
