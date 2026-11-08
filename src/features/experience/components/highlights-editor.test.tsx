import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { HighlightsEditor } from "./highlights-editor";

function Harness({ initial }: { initial: string[] }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <HighlightsEditor value={value} onChange={setValue} />
      <output>{JSON.stringify(value)}</output>
    </>
  );
}

const current = () => JSON.parse(screen.getByRole("status").textContent ?? "[]") as string[];

describe("HighlightsEditor", () => {
  it("adds a highlight and focuses it", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[]} />);
    await user.click(screen.getByRole("button", { name: "Add highlight" }));
    await user.keyboard("Shipped it");
    expect(screen.getByLabelText("Highlight 1")).toHaveFocus();
    expect(current()).toEqual(["Shipped it"]);
  });

  it("reorders and removes with labelled buttons", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["A", "B", "C"]} />);

    expect(screen.getByRole("button", { name: "Move highlight 1 up" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Move highlight 3 up" }));
    expect(current()).toEqual(["A", "C", "B"]);

    await user.click(screen.getByRole("button", { name: "Remove highlight 1" }));
    expect(current()).toEqual(["C", "B"]);
  });
});
