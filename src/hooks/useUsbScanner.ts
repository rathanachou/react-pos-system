import { useEffect, useRef } from "react";

// ─── useUsbScanner ────────────────────────────────────────
// Hook សម្រាប់ USB Barcode Scanner (keyboard emulation)
// USB Scanner វាយ characters ទៅ keyboard buffer រួច Enter
//
// Usage:
//   useUsbScanner((code) => console.log(code));
//   useUsbScanner((code) => handleScan(code), isActive);

export const useUsbScanner = (
  onScan: (code: string) => void,
  enabled: boolean = true
) => {
  const bufferRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // ✅ FIX: ប្រើ ref សម្រាប់ onScan
  // ការពារ useEffect re-run រៀងរាល់ render
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ✅ ការពារ — មិន Scan ពេលវាយ Input/Textarea/Select
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // ✅ ការពារ — មិន Scan ពេល contentEditable
      const isEditable = (e.target as HTMLElement).isContentEditable;
      if (isEditable) return;

      if (e.key === "Enter") {
        const code = bufferRef.current.trim();

        // ✅ FIX: min length 3 chars — ការពារ Enter ចៃដន្យ
        if (code.length >= 3) {
          onScanRef.current(code); // ✅ ប្រើ ref — stable reference
        }

        bufferRef.current = "";
        clearTimeout(timerRef.current);
        return;
      }

      // ✅ សរសេរ characters ដែលអាចបង្ហាញ (printable chars only)
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      // ✅ Auto-clear buffer បន្ទាប់ 100ms (USB scanner ជាធម្មតា < 50ms)
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        bufferRef.current = "";
      }, 100);
    };

    window.addEventListener("keydown", handleKeyDown);

    // ✅ Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timerRef.current);
      bufferRef.current = "";
    };

  // ✅ FIX: មានតែ enabled ក្នុង dependency
  // onScan handle ដោយ ref — មិន re-run
  }, [enabled]);
};