import { api } from "./axiosConfig";

// Mahsulotlar o'zgarganda UI'ni qayta yuklash uchun global event
export const PRODUCTS_CHANGED_EVENT = "products:changed";

const STORAGE_KEYS = {
  products: "products",
  deletedProductIds: "deleted_product_ids_v1",
};

const IMAGE_UPLOAD_ATTEMPTS = [
  { endpoint: "/upload", field: "image" },
  { endpoint: "/upload", field: "file" },
  { endpoint: "/upload", field: "upload" },
  { endpoint: "/upload/image", field: "image" },
  { endpoint: "/upload/image", field: "file" },
  { endpoint: "/images/upload", field: "image" },
];

function emitProductsChanged() {
  window.dispatchEvent(new Event(PRODUCTS_CHANGED_EVENT));
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function hasLocalProducts() {
  return localStorage.getItem(STORAGE_KEYS.products) !== null;
}

function readLocalProducts() {
  const parsed = readJson(STORAGE_KEYS.products, []);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.products)) return parsed.products;
  return [];
}

function writeLocalProducts(products) {
  writeJson(STORAGE_KEYS.products, products);
}

function readDeletedIds() {
  const parsed = readJson(STORAGE_KEYS.deletedProductIds, []);
  if (!Array.isArray(parsed)) return new Set();
  return new Set(parsed.map((id) => String(id)));
}

function writeDeletedIds(idsSet) {
  writeJson(STORAGE_KEYS.deletedProductIds, Array.from(idsSet));
}

// API javobidagi product listni bir xil formatga keltiramiz
function extractProductsArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// Rang qiymatini CSS uchun to'g'ri formatga keltiramiz
function normalizeColor(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("#")) return raw;
  return `#${raw}`;
}

function toBackendColor(value) {
  return String(value || "").replace("#", "").trim().toUpperCase();
}

// Product obyektini UI uchun bir xil shape'ga keltirish
function normalizeProduct(item = {}) {
  const gallery =
    (Array.isArray(item.pictures) && item.pictures) ||
    (Array.isArray(item.images) && item.images) ||
    (item.thumbnail ? [item.thumbnail] : []);
  const colors = Array.isArray(item.colors)
    ? item.colors.map(normalizeColor).filter(Boolean)
    : [];
  const sizes = Array.isArray(item.sizes)
    ? item.sizes.filter(Boolean)
    : item.size
      ? [item.size]
      : [];

  return {
    ...item,
    id: item._id || item.id || item.productId || item.uuid,
    name: item.name || item.title || "",
    title: item.title || item.name || "",
    discount: Number(item.discount ?? item.discountPercentage ?? 0),
    discountPercentage: Number(item.discountPercentage ?? item.discount ?? 0),
    pictures: gallery,
    images: Array.isArray(item.images) ? item.images : gallery,
    thumbnail: item.thumbnail || gallery[0] || "",
    rating: Number(item.rating ?? 0),
    stock: Number(item.stock ?? 0),
    brand: item.brand || "",
    type: item.type || item.category || "",
    category: item.category || item.type || "",
    dressStyle: item.dressStyle || "",
    rank: Number(item.rank ?? 0),
    colors,
    size: item.size || sizes[0] || "",
    sizes,
  };
}

function normalizeProducts(list) {
  return list.map(normalizeProduct);
}

function mergeServerWithLocal(serverProducts, localProducts, deletedIds) {
  const localMap = new Map(
    localProducts.map((item) => [String(item.id), item]),
  );

  const mergedFromServer = serverProducts
    .filter((item) => !deletedIds.has(String(item.id)))
    .map((item) => localMap.get(String(item.id)) || item);

  const serverIdSet = new Set(mergedFromServer.map((item) => String(item.id)));
  const localOnly = localProducts.filter(
    (item) =>
      !deletedIds.has(String(item.id)) && !serverIdSet.has(String(item.id)),
  );

  return [...localOnly, ...mergedFromServer];
}

// Add/Edit form payloadini backendga qulay formatga o'tkazamiz
function toProductPayload(input = {}) {
  const title = (input.title || input.name || "").trim();
  const images =
    (Array.isArray(input.images) && input.images.filter(Boolean)) ||
    (Array.isArray(input.pictures) && input.pictures.filter(Boolean)) ||
    (input.thumbnail ? [input.thumbnail] : []);
  const colors = Array.isArray(input.colors)
    ? input.colors.map(toBackendColor).filter(Boolean)
    : [];

  return {
    name: title,
    title,
    description: (input.description || "").trim(),
    price: Number(input.price || 0),
    discount: Number(input.discount ?? input.discountPercentage ?? 0),
    discountPercentage: Number(input.discountPercentage ?? input.discount ?? 0),
    rating: Number(input.rating || 0),
    stock: Number(input.stock || 0),
    brand: (input.brand || "").trim(),
    type: (input.type || input.category || "").trim(),
    category: (input.category || input.type || "").trim(),
    dressStyle: (input.dressStyle || "").trim(),
    size: (input.size || "").trim(),
    colors,
    rank: Number(input.rank || 0),
    thumbnail: input.thumbnail || images[0] || "",
    images,
    pictures: images,
  };
}

function upsertLocalProduct(id, payload) {
  const products = normalizeProducts(readLocalProducts());
  const next = products.map((item) =>
    String(item.id) === String(id)
      ? normalizeProduct({ ...item, ...payload, id: item.id })
      : item,
  );
  writeLocalProducts(next);
  emitProductsChanged();
  return next.find((item) => String(item.id) === String(id)) || null;
}

// Mahsulotlar:
// fromServer=true bo'lsa bevosita backenddan oladi
// aks holda avval localStorage, bo'lmasa backenddan oladi
export async function fetchProductsApi(options = {}) {
  const { fromServer = false } = options;
  if (!fromServer && hasLocalProducts()) return normalizeProducts(readLocalProducts());

  const response = await api.get("/products");
  const serverProducts = normalizeProducts(extractProductsArray(response.data));
  const localProducts = normalizeProducts(readLocalProducts());
  const deletedIds = readDeletedIds();
  const merged = mergeServerWithLocal(serverProducts, localProducts, deletedIds);
  writeLocalProducts(merged);
  return merged;
}

// Bitta mahsulot: listdan topamiz (barqaror)
export async function fetchProductApi(id, options = {}) {
  const products = await fetchProductsApi(options);
  return products.find((item) => String(item.id) === String(id)) || null;
}

// Create: localStorage darhol yangilanadi, backend sync keyin uriniladi
export async function createProductApi(payload) {
  const prepared = toProductPayload(payload);

  try {
    const response = await api.post("/products", prepared);
    const created = normalizeProduct(response.data?.product || response.data || prepared);
    const products = normalizeProducts(readLocalProducts());
    const deletedIds = readDeletedIds();
    deletedIds.delete(String(created.id));
    writeDeletedIds(deletedIds);
    writeLocalProducts([created, ...products]);
    emitProductsChanged();
    return created;
  } catch {
    const products = normalizeProducts(readLocalProducts());
    const created = normalizeProduct({ ...prepared, id: Date.now() });
    writeLocalProducts([created, ...products]);
    emitProductsChanged();
    return created;
  }
}

// Update: localStorage darhol yangilanadi, backendga PUT/PATCH uriniladi
export async function updateProductApi(id, payload) {
  const prepared = toProductPayload(payload);
  const deletedIds = readDeletedIds();
  deletedIds.delete(String(id));
  writeDeletedIds(deletedIds);

  try {
    const response = await api.put(`/products/${id}`, prepared);
    const serverUpdated = normalizeProduct(
      response.data?.product || response.data || { ...prepared, id },
    );
    upsertLocalProduct(id, serverUpdated);
    return serverUpdated;
  } catch {
    try {
      const response = await api.patch(`/products/${id}`, prepared);
      const serverUpdated = normalizeProduct(
        response.data?.product || response.data || { ...prepared, id },
      );
      upsertLocalProduct(id, serverUpdated);
      return serverUpdated;
    } catch {
      return upsertLocalProduct(id, prepared);
    }
  }
}

// Delete: localStorage darhol tozalanadi, backendga bir nechta usulda uriniladi
export async function deleteProductApi(id) {
  const deletedIds = readDeletedIds();
  deletedIds.add(String(id));
  writeDeletedIds(deletedIds);

  const products = normalizeProducts(readLocalProducts());
  writeLocalProducts(products.filter((item) => String(item.id) !== String(id)));
  emitProductsChanged();

  try {
    await api.delete(`/products/${id}`);
    return true;
  } catch {
    try {
      await api.post(`/products/${id}/delete`, {});
      return true;
    } catch {
      try {
        await api.patch(`/products/${id}`, { isDeleted: true, status: "deleted" });
      } catch {
        // Offline/fail holatda local rejim davom etadi.
      }
      return true;
    }
  }
}

function extractUploadedUrl(data) {
  return (
    data?.url ||
    data?.image ||
    data?.file ||
    data?.path ||
    data?.data?.url ||
    data?.data?.image ||
    data?.data?.file ||
    data?.data?.path ||
    ""
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

// Rasm upload: bir nechta endpoint/field sinab ko'riladi
export async function uploadImageApi(file) {
  for (const attempt of IMAGE_UPLOAD_ATTEMPTS) {
    try {
      const formData = new FormData();
      formData.append(attempt.field, file);
      const response = await api.post(attempt.endpoint, formData);
      const url = extractUploadedUrl(response.data);
      if (url) return url;
    } catch {
      // Keyingi endpoint/fieldga o'tamiz.
    }
  }

  // Backend upload ishlamasa ham foydalanuvchi ishini to'xtatmaymiz.
  return fileToDataUrl(file);
}
