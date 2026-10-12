"use client";

import { Toaster } from "sonner";

/**
 * Global toast host. Mount once in the root layout so any component
 * can call `toast(...)` from sonner.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
