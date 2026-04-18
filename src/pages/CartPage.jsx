import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CART_CHANGED_EVENT,
  getCartItems,
  removeFromCart,
  updateCartQty,
} from "../services/cart.jsx";
import { EmptyState } from "../components/StatusState";
import { showError, showSuccess } from "../services/toast";

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
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  const load = useCallback(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    window.addEventListener(CART_CHANGED_EVENT, load);
    return () => window.removeEventListener(CART_CHANGED_EVENT, load);
  }, [load]);

  const summary = useMemo(() => {
    const subtotal = items.reduce(
      (total, item) =>
        total + calcFinal(item.price, item.discount) * Number(item.qty || 1),
      0,
    );
    const oldTotal = items.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.qty || 1),
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

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoMessage("Enter a promo code to continue.");
      showError("Enter a promo code first.", "Promo code missing");
      return;
    }

    setPromoMessage("Promo codes are display-only in this GET-only project.");
    showSuccess("Promo code UI checked successfully.", "Promo preview");
  };

  return (
    <section className="container pt-8 pb-16 sm:py-10">
      <div className="text-sm text-black/60">
        <Link to="/" className="transition hover:text-black">
          Home
        </Link>{" "}
        &gt; <span className="text-black">Cart</span>
      </div>

      <h1 className="mb-6 text-[32px] font-black uppercase text-black sm:text-5xl">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse the collection and add products to build your order summary."
          action={
            <Link
              to="/shop/casual"
              className="inline-flex h-11 items-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85"
            >
              Continue Shopping
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.8fr]">
          <div className="rounded-[20px] border border-black/10 bg-white p-4 sm:p-6">
            {items.map((item) => {
              const final = calcFinal(item.price, item.discount);

              return (
                <article
                  key={item.id}
                  className="grid grid-cols-[100px_1fr] gap-4 border-b border-black/10 py-5 last:border-b-0 last:pb-0 sm:grid-cols-[124px_1fr_auto]"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="h-[100px] w-[100px] rounded-[16px] bg-[#f0f0f0] object-contain p-3 sm:h-[124px] sm:w-[124px]"
                  />

                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-black sm:text-2xl">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-black/60">
                          Size:{" "}
                          <span className="text-black">{item.size || "-"}</span>
                        </p>
                        <p className="mt-1 text-sm text-black/60">
                          Color:{" "}
                          <span className="text-black">
                            {item.color || "-"}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setItems(removeFromCart(item.id));
                          showSuccess("Item removed from cart.");
                        }}
                        className="hidden text-[#ff3333] transition hover:text-[#d72828] sm:block"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-2xl font-bold text-black sm:text-[32px]">
                        ${final.toFixed(0)}
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setItems(removeFromCart(item.id));
                            showSuccess("Item removed from cart.");
                          }}
                          className="text-[#ff3333] transition hover:text-[#d72828] sm:hidden"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>

                        <div className="flex h-11 items-center gap-4 rounded-full bg-[#f0f0f0] px-4">
                          <button
                            onClick={() =>
                              setItems(updateCartQty(item.id, item.qty - 1))
                            }
                            className="text-lg text-black/70 transition hover:text-black"
                          >
                            -
                          </button>
                          <span className="min-w-5 text-center text-sm font-medium text-black">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              setItems(updateCartQty(item.id, item.qty + 1))
                            }
                            className="text-lg text-black/70 transition hover:text-black"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-[20px] border border-black/10 bg-white p-5 sm:p-6">
            <h2 className="mb-6 text-2xl font-bold text-black sm:text-[32px]">
              Order Summary
            </h2>

            <div className="space-y-4 border-b border-black/10 pb-6">
              <p className="flex items-center justify-between text-black/60">
                <span>Subtotal</span>
                <span className="font-semibold text-black">
                  ${summary.subtotal.toFixed(0)}
                </span>
              </p>
              <p className="flex items-center justify-between text-black/60">
                <span>Discount</span>
                <span className="font-semibold text-[#ff3333]">
                  -${summary.discountValue.toFixed(0)}
                </span>
              </p>
              <p className="flex items-center justify-between text-black/60">
                <span>Delivery Fee</span>
                <span className="font-semibold text-black">
                  ${summary.delivery.toFixed(0)}
                </span>
              </p>
            </div>

            <p className="my-6 flex items-center justify-between text-xl text-black sm:text-2xl">
              <span>Total</span>
              <span className="font-bold">${summary.total.toFixed(0)}</span>
            </p>

            <div className="mb-3 flex gap-2">
              <input
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Add promo code"
                className="h-12 flex-1 rounded-full bg-[#f0f0f0] px-4 text-sm outline-none ring-1 ring-transparent transition focus:ring-black"
              />
              <button
                onClick={handleApplyPromo}
                className="h-12 rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85"
              >
                Apply
              </button>
            </div>

            {promoMessage ? (
              <p className="mb-4 text-sm text-black/50">{promoMessage}</p>
            ) : null}

            <button className="inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white transition hover:bg-black/85">
              Go to Checkout →
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default CartPage;
