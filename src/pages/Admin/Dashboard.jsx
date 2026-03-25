import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteProductApi,
  fetchProductsApi,
  PRODUCTS_CHANGED_EVENT,
} from "../../services/api";

const STORAGE_KEYS = {
  reviews: "admin_reviews_v1",
  orders: "admin_orders_v1",
};

const EMPTY_REVIEW_FORM = {
  id: "",
  productId: "",
  customer: "",
  rating: "",
  comment: "",
};

const EMPTY_ORDER_FORM = {
  id: "",
  productId: "",
  customer: "",
  quantity: "",
  status: "pending",
};

function readList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

// List ichida add/edit umumiy helper
function upsertById(list, payload) {
  const idx = list.findIndex((item) => String(item.id) === String(payload.id));
  if (idx >= 0) {
    const next = [...list];
    next[idx] = payload;
    return next;
  }
  return [payload, ...list];
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW_FORM);
  const [orderForm, setOrderForm] = useState(EMPTY_ORDER_FORM);

  // Select optionlarda product nomlarini bir xil ko'rinishda ishlatamiz
  const productOptions = useMemo(
    () => products.map((p) => ({ id: p.id, name: p.name || p.title })),
    [products],
  );

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await fetchProductsApi({ fromServer: true }));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    setReviews(readList(STORAGE_KEYS.reviews));
    setOrders(readList(STORAGE_KEYS.orders));

    const onProductsChanged = () => fetchProducts();
    window.addEventListener(PRODUCTS_CHANGED_EVENT, onProductsChanged);
    return () =>
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, onProductsChanged);
  }, [fetchProducts]);

  const handleDeleteProduct = async (product) => {
    const id = product.id;
    if (!window.confirm(`Delete ${product.name || product.title}?`)) return;

    try {
      await deleteProductApi(id);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  // Review CRUD
  const saveReview = (e) => {
    e.preventDefault();
    const payload = {
      id: reviewForm.id || String(Date.now()),
      productId: reviewForm.productId,
      customer: reviewForm.customer.trim(),
      rating: Number(reviewForm.rating || 0),
      comment: reviewForm.comment.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = upsertById(reviews, payload);
    writeList(STORAGE_KEYS.reviews, next);
    setReviews(next);
    setReviewForm(EMPTY_REVIEW_FORM);
  };

  const editReview = (item) => {
    setReviewForm({
      id: String(item.id),
      productId: String(item.productId || ""),
      customer: item.customer || "",
      rating: String(item.rating || ""),
      comment: item.comment || "",
    });
  };

  const deleteReview = (id) => {
    const next = reviews.filter((r) => String(r.id) !== String(id));
    writeList(STORAGE_KEYS.reviews, next);
    setReviews(next);
  };

  // Order CRUD
  const saveOrder = (e) => {
    e.preventDefault();
    const payload = {
      id: orderForm.id || String(Date.now()),
      productId: orderForm.productId,
      customer: orderForm.customer.trim(),
      quantity: Number(orderForm.quantity || 1),
      status: orderForm.status,
      createdAt: new Date().toISOString(),
    };
    const next = upsertById(orders, payload);
    writeList(STORAGE_KEYS.orders, next);
    setOrders(next);
    setOrderForm(EMPTY_ORDER_FORM);
  };

  const editOrder = (item) => {
    setOrderForm({
      id: String(item.id),
      productId: String(item.productId || ""),
      customer: item.customer || "",
      quantity: String(item.quantity || ""),
      status: item.status || "pending",
    });
  };

  const deleteOrder = (id) => {
    const next = orders.filter((o) => String(o.id) !== String(id));
    writeList(STORAGE_KEYS.orders, next);
    setOrders(next);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    document.cookie = "adminToken=; path=/; max-age=0";
    navigate("/login");
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {["products", "reviews", "orders"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {activeTab === "products" && (
        <div className="space-y-4">
          <button
            onClick={() => navigate("/admin/add")}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Add Product
          </button>

          <div className="overflow-x-auto border rounded">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.name || p.title}</td>
                    <td className="p-3">${Number(p.price || 0).toFixed(2)}</td>
                    <td className="p-3">{p.type || p.category || "-"}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/product/${p.id}`)}
                          className="px-3 py-1 bg-gray-700 text-white rounded"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/edit/${p.id}`)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          <form onSubmit={saveReview} className="grid md:grid-cols-5 gap-2">
            <select
              className="border p-2 rounded"
              value={reviewForm.productId}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, productId: e.target.value }))
              }
              required
            >
              <option value="">Product</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              className="border p-2 rounded"
              placeholder="Customer"
              value={reviewForm.customer}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, customer: e.target.value }))
              }
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Rating"
              type="number"
              min={1}
              max={5}
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, rating: e.target.value }))
              }
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Comment"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              required
            />
            <button className="bg-green-600 text-white rounded px-3 py-2">
              {reviewForm.id ? "Update" : "Add"}
            </button>
          </form>

          <div className="overflow-x-auto border rounded">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Comment</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.customer}</td>
                    <td className="p-3">
                      {productOptions.find(
                        (p) => String(p.id) === String(r.productId),
                      )?.name || r.productId}
                    </td>
                    <td className="p-3">{r.rating}</td>
                    <td className="p-3">{r.comment}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editReview(r)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-4">
          <form onSubmit={saveOrder} className="grid md:grid-cols-5 gap-2">
            <select
              className="border p-2 rounded"
              value={orderForm.productId}
              onChange={(e) =>
                setOrderForm((prev) => ({ ...prev, productId: e.target.value }))
              }
              required
            >
              <option value="">Product</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              className="border p-2 rounded"
              placeholder="Customer"
              value={orderForm.customer}
              onChange={(e) =>
                setOrderForm((prev) => ({ ...prev, customer: e.target.value }))
              }
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Qty"
              type="number"
              min={1}
              value={orderForm.quantity}
              onChange={(e) =>
                setOrderForm((prev) => ({ ...prev, quantity: e.target.value }))
              }
              required
            />
            <select
              className="border p-2 rounded"
              value={orderForm.status}
              onChange={(e) =>
                setOrderForm((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
            <button className="bg-green-600 text-white rounded px-3 py-2">
              {orderForm.id ? "Update" : "Add"}
            </button>
          </form>

          <div className="overflow-x-auto border rounded">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Qty</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="p-3">{o.customer}</td>
                    <td className="p-3">
                      {productOptions.find(
                        (p) => String(p.id) === String(o.productId),
                      )?.name || o.productId}
                    </td>
                    <td className="p-3">{o.quantity}</td>
                    <td className="p-3">{o.status}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editOrder(o)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteOrder(o.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
