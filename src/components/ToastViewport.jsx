import { useEffect, useState } from "react";
import { TOAST_EVENT } from "../services/toast";

const TOAST_STYLES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-black/10 bg-white text-black",
};

function ToastViewport() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const toast = event.detail;
      setItems((current) => [...current, toast]);

      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== toast.id));
      }, 3200);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-32px)] max-w-sm flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto animate-toast-in rounded-[20px] border px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${TOAST_STYLES[item.type] || TOAST_STYLES.info}`}
        >
          {item.title ? (
            <p className="text-sm font-semibold">{item.title}</p>
          ) : null}
          <p className="text-sm opacity-80">{item.message}</p>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
