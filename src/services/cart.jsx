export const CART_CHANGED_EVENT = "cart:changed";

const CART_KEY = "cart_items_v1";

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

function normalizeColor(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.startsWith("#") ? raw : `#${raw}`;
}

export function getCartItems() {
  return readCart();
}

export function addToCart(product, options = {}) {
  const qty = Math.max(1, Number(options.qty || 1));
  const size = options.size || product.size || "";
  const color = normalizeColor(options.color || "");
  const items = readCart();

  const productId = String(product.id || product._id);
  const index = items.findIndex(
    (item) =>
      String(item.productId) === productId &&
      String(item.size || "") === String(size || "") &&
      String(item.color || "") === String(color || ""),
  );

  if (index >= 0) {
    const next = [...items];
    next[index] = { ...next[index], qty: next[index].qty + qty };
    writeCart(next);
    return next[index];
  }

  const line = {
    id: String(Date.now()),
    productId,
    name: product.name || product.title || "",
    price: Number(product.price || 0),
    discount: Number(product.discount || product.discountPercentage || 0),
    thumbnail: product.thumbnail || product.pictures?.[0] || product.images?.[0] || "",
    size,
    color,
    qty,
  };

  writeCart([line, ...items]);
  return line;
}

export function removeFromCart(lineId) {
  const next = readCart().filter((item) => String(item.id) !== String(lineId));
  writeCart(next);
  return next;
}

export function updateCartQty(lineId, qty) {
  const safeQty = Math.max(1, Number(qty || 1));
  const next = readCart().map((item) =>
    String(item.id) === String(lineId) ? { ...item, qty: safeQty } : item,
  );
  writeCart(next);
  return next;
}
