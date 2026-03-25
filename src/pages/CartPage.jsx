import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CART_CHANGED_EVENT,
  getCartItems,
  removeFromCart,
  updateCartQty,
} from "../services/cart.jsx";

function calcFinal(price, discount) {
  const amount = Number(price || 0);
  const off = Number(discount || 0);
  return amount - (amount * off) / 100;
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2Z" fill="currentColor" />
      <path d="M7 9h10l-1 11H8L7 9Z" fill="currentColor" />
    </svg>
  );
}

function CartPage() {
  const [items, setItems] = useState(() => getCartItems());

  const load = useCallback(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    window.addEventListener(CART_CHANGED_EVENT, load);
    return () => window.removeEventListener(CART_CHANGED_EVENT, load);
  }, [load]);

  const summary = useMemo(() => {
    const subtotal = items.reduce(
      (acc, item) => acc + calcFinal(item.price, item.discount) * Number(item.qty || 1),
      0,
    );
    const oldTotal = items.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.qty || 1),
      0,
    );
    const discountValue = oldTotal - subtotal;
    const delivery = items.length > 0 ? 15 : 0;
    return {
      subtotal,
      discountValue,
      delivery,
      total: subtotal + delivery,
    };
  }, [items]);

  return (
    <section className="container py-8 sm:py-10">
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-black">
          Home
        </Link>{" "}
        &gt; Cart
      </div>

      <h1 className="mb-6 text-5xl font-black uppercase">Your Cart</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-8 text-center">
          <p className="mb-4 text-lg">Savat bo&apos;sh.</p>
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-full bg-black px-6 text-white"
          >
            Homega qaytish
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.85fr]">
          <div className="rounded-2xl border border-gray-200 p-4 sm:p-5">
            {items.map((item) => {
              const final = calcFinal(item.price, item.discount);
              return (
                <article
                  key={item.id}
                  className="grid grid-cols-[84px_1fr_auto] gap-3 border-b border-gray-200 py-4 last:border-b-0"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="h-[84px] w-[84px] rounded-xl bg-[#f2f0f1] object-contain p-2"
                  />

                  <div>
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500">Size: {item.size || "-"}</p>
                    <p className="text-sm text-gray-500">Color: {item.color || "-"}</p>
                    <p className="mt-2 text-3xl font-bold">${final.toFixed(0)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3">
                    <button
                      onClick={() => setItems(removeFromCart(item.id))}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                    <div className="flex h-11 items-center gap-4 rounded-full bg-gray-100 px-4">
                      <button
                        onClick={() => setItems(updateCartQty(item.id, item.qty - 1))}
                      >
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => setItems(updateCartQty(item.id, item.qty + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-2xl border border-gray-200 p-5">
            <h2 className="mb-4 text-3xl font-bold">Order Summary</h2>
            <div className="space-y-3 border-b border-gray-200 pb-4 text-lg">
              <p className="flex items-center justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">${summary.subtotal.toFixed(0)}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="font-semibold text-red-500">
                  -${summary.discountValue.toFixed(0)}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-semibold">${summary.delivery.toFixed(0)}</span>
              </p>
            </div>
            <p className="my-4 flex items-center justify-between text-2xl">
              <span>Total</span>
              <span className="font-bold">${summary.total.toFixed(0)}</span>
            </p>
            <div className="mb-4 flex gap-2">
              <input
                placeholder="Add promo code"
                className="h-12 flex-1 rounded-full bg-gray-100 px-4 outline-none"
              />
              <button className="h-12 rounded-full bg-black px-8 text-white">
                Apply
              </button>
            </div>
            <button className="h-12 w-full rounded-full bg-black text-white">
              Go to Checkout →
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default CartPage;
