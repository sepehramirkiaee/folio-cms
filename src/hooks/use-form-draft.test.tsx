import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDraftsStore } from "@/stores/drafts-store";
import { useFormDraft } from "./use-form-draft";

type Values = { title: string };

function setup(key = "project:new") {
  return renderHook(() => {
    const form = useForm<Values>({ defaultValues: { title: "" } });
    return { form, draft: useFormDraft(form, key) };
  });
}

describe("useFormDraft", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useDraftsStore.setState({ drafts: {} });
  });
  afterEach(() => vi.useRealTimers());

  it("saves dirty values after a pause in typing", () => {
    const { result } = setup();
    act(() => result.current.form.setValue("title", "Hello", { shouldDirty: true }));
    expect(useDraftsStore.getState().drafts["project:new"]).toBeUndefined();

    act(() => vi.advanceTimersByTime(600));
    expect(useDraftsStore.getState().drafts["project:new"]?.values).toEqual({ title: "Hello" });
  });

  it("offers an existing draft and restores it into the form", () => {
    useDraftsStore.getState().saveDraft("project:new", { title: "From last time" });
    const { result } = setup();

    expect(result.current.draft.draftSavedAt).toBeInstanceOf(Date);
    act(() => result.current.draft.restore());
    expect(result.current.form.getValues("title")).toBe("From last time");
    expect(result.current.draft.draftSavedAt).toBeNull();
  });

  it("clears the draft after a successful save", () => {
    useDraftsStore.getState().saveDraft("project:p1", { title: "x" });
    const { result } = setup("project:p1");
    act(() => result.current.draft.clear());
    expect(useDraftsStore.getState().drafts["project:p1"]).toBeUndefined();
  });
});
