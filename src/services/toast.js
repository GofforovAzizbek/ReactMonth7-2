export const TOAST_EVENT = "app:toast";

export function showToast(payload) {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: payload?.type || "info",
        title: payload?.title || "",
        message: payload?.message || "",
      },
    }),
  );
}

export function showSuccess(message, title = "Success") {
  showToast({ type: "success", title, message });
}

export function showError(message, title = "Something went wrong") {
  showToast({ type: "error", title, message });
}
