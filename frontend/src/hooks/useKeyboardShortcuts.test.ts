import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  it("calls onStart when Space is pressed", () => {
    const onStart = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onStart, enabled: true }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("calls onPause when P is pressed", () => {
    const onPause = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onPause, enabled: true }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "p", bubbles: true }));
    expect(onPause).toHaveBeenCalledOnce();
  });

  it("does not fire when disabled", () => {
    const onStart = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onStart, enabled: false }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(onStart).not.toHaveBeenCalled();
  });
});
