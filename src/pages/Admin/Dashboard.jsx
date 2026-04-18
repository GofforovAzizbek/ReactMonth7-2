import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteProductApi,
  fetchProductsApi,
  PRODUCTS_CHANGED_EVENT,
} from "../../services/api";
import { EmptyState, ErrorState } from "../../components/StatusState";
import { showError, showSuccess } from "../../services/toast";

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

function upsertById(list, payload) {
  const index = list.findIndex((item) => String(item.id) === String(payload.id));
  if (index >= 0) {
    const next = [...list];
    next[index] = payload;
    return next;
  }
  return [payload, ...list];
}

function formatStatus(status) {
  const value = String(status || "pending");
  return value[0].toUpperCase() + value.slice(1);
}

function TableAction({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card-surface h-32 animate-pulse bg-[#f5f5f5]" />
        ))}
      </div>
      <div className="card-surface h-[420px] animate-pulse bg-[#f5f5f5]" />
    </div>
  );
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

  const productOptions = useMemo(
    () => products.map((item) => ({ id: item.id, name: item.name || item.title })),
    [products],
  );

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await fetchProductsApi({ fromServer: true }));
      setError("");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Products could not be loaded for the dashboard.";
      setError(message);
      showError(message, "Admin data failed");
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
    if (!window.confirm(`Delete ${product.name || product.title}?`)) return;

    try {
      await deleteProductApi(product.id);
      setProducts((current) =>
        current.filter((item) => String(item.id) !== String(product.id)),
      );
      showSuccess("Product deleted successfully.");
    } catch (err) {
      const message = err.response?.data?.message || "Delete failed";
      setError(message);
      showError(message, "Delete failed");
    }
  };

  const saveReview = (event) => {
    event.preventDefault();
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
    showSuccess(reviewForm.id ? "Review updated." : "Review added.");
  };

  const deleteReview = (id) => {
    const next = reviews.filter((item) => String(item.id) !== String(id));
    writeList(STORAGE_KEYS.reviews, next);
    setReviews(next);
    showSuccess("Review deleted.");
  };

  const saveOrder = (event) => {
    event.preventDefault();
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
    showSuccess(orderForm.id ? "Order updated." : "Order added.");
  };

  const deleteOrder = (id) => {
    const next = orders.filter((item) => String(item.id) !== String(id));
    writeList(STORAGE_KEYS.orders, next);
    setOrders(next);
    showSuccess("Order deleted.");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    document.cookie = "adminToken=; path=/; max-age=0";
    showSuccess("Logged out successfully.");
    navigate("/login");
  };

  if (loading) return <DashboardSkeleton />;
  if (error && products.length === 0) {
    return <ErrorState className="mx-auto mt-10 max-w-7xl" message={error} onRetry={fetchProducts} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {["products", "reviews", "orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-3 text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-black text-white"
                    : "bg-white text-black/60 hover:text-black"
                }`}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchProducts}
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:border-black"
            >
              Refresh Data
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85"
            >
              Logout
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {activeTab === "products" ? (
          <div className="card-surface overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-2xl font-bold text-black">Products</h2>
                <p className="text-sm text-black/50">Browse, preview, edit, or remove existing catalog items.</p>
              </div>
              <button
                onClick={() => navigate("/admin/add")}
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No products found"
                  description="The API returned an empty list. Try refreshing the dashboard."
                  action={
                    <button
                      onClick={fetchProducts}
                      className="inline-flex h-11 items-center rounded-full bg-black px-6 text-sm font-medium text-white"
                    >
                      Refresh
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-[#fafafa] text-sm text-black/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Product</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium">Stock</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-black/10">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail || product.images?.[0] || product.pictures?.[0]}
                              alt={product.name || product.title}
                              className="h-14 w-14 rounded-2xl bg-[#f0f0f0] object-contain p-2"
                            />
                            <div>
                              <p className="font-semibold text-black">{product.name || product.title}</p>
                              <p className="text-sm text-black/50">{product.brand || "Shop.co"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-medium text-black">${Number(product.price || 0).toFixed(2)}</td>
                        <td className="px-6 py-5 text-black/70">{product.type || product.category || "-"}</td>
                        <td className="px-6 py-5 text-black/70">{product.stock ?? 0}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                            <TableAction onClick={() => navigate(`/product/${product.id}`)} className="bg-slate-700">
                              View
                            </TableAction>
                            <TableAction onClick={() => navigate(`/admin/edit/${product.id}`)} className="bg-indigo-600">
                              Edit
                            </TableAction>
                            <TableAction onClick={() => handleDeleteProduct(product)} className="bg-red-600">
                              Delete
                            </TableAction>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "reviews" ? (
          <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
            <form onSubmit={saveReview} className="card-surface p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-black">
                {reviewForm.id ? "Edit Review" : "Add Review"}
              </h2>
              <p className="mt-2 text-sm text-black/50">Reviews are stored locally and reflected on product pages.</p>

              <div className="mt-5 space-y-4">
                <select
                  className="admin-input"
                  value={reviewForm.productId}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, productId: event.target.value }))
                  }
                  required
                >
                  <option value="">Select product</option>
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  className="admin-input"
                  placeholder="Customer name"
                  value={reviewForm.customer}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, customer: event.target.value }))
                  }
                  required
                />
                <input
                  className="admin-input"
                  placeholder="Rating"
                  type="number"
                  min={1}
                  max={5}
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, rating: event.target.value }))
                  }
                  required
                />
                <textarea
                  className="admin-textarea"
                  placeholder="Comment"
                  value={reviewForm.comment}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, comment: event.target.value }))
                  }
                  required
                />
                <button className="w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85">
                  {reviewForm.id ? "Update Review" : "Add Review"}
                </button>
              </div>
            </form>

            <div className="card-surface overflow-hidden">
              <div className="border-b border-black/10 px-6 py-5">
                <h2 className="text-2xl font-bold text-black">Review List</h2>
              </div>
              {reviews.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No reviews yet"
                    description="Use the form to create the first customer review."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-[#fafafa] text-sm text-black/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Product</th>
                        <th className="px-6 py-4 font-medium">Rating</th>
                        <th className="px-6 py-4 font-medium">Comment</th>
                        <th className="px-6 py-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id} className="border-t border-black/10">
                          <td className="px-6 py-5 font-medium text-black">{review.customer}</td>
                          <td className="px-6 py-5 text-black/70">
                            {productOptions.find((item) => String(item.id) === String(review.productId))?.name || review.productId}
                          </td>
                          <td className="px-6 py-5 text-black/70">{review.rating}</td>
                          <td className="px-6 py-5 text-black/70">{review.comment}</td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              <TableAction
                                onClick={() =>
                                  setReviewForm({
                                    id: String(review.id),
                                    productId: String(review.productId || ""),
                                    customer: review.customer || "",
                                    rating: String(review.rating || ""),
                                    comment: review.comment || "",
                                  })
                                }
                                className="bg-indigo-600"
                              >
                                Edit
                              </TableAction>
                              <TableAction onClick={() => deleteReview(review.id)} className="bg-red-600">
                                Delete
                              </TableAction>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "orders" ? (
          <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
            <form onSubmit={saveOrder} className="card-surface p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-black">
                {orderForm.id ? "Edit Order" : "Add Order"}
              </h2>
              <p className="mt-2 text-sm text-black/50">Create clean mock orders for local admin workflows.</p>

              <div className="mt-5 space-y-4">
                <select
                  className="admin-input"
                  value={orderForm.productId}
                  onChange={(event) =>
                    setOrderForm((current) => ({ ...current, productId: event.target.value }))
                  }
                  required
                >
                  <option value="">Select product</option>
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  className="admin-input"
                  placeholder="Customer name"
                  value={orderForm.customer}
                  onChange={(event) =>
                    setOrderForm((current) => ({ ...current, customer: event.target.value }))
                  }
                  required
                />
                <input
                  className="admin-input"
                  placeholder="Quantity"
                  type="number"
                  min={1}
                  value={orderForm.quantity}
                  onChange={(event) =>
                    setOrderForm((current) => ({ ...current, quantity: event.target.value }))
                  }
                  required
                />
                <select
                  className="admin-input"
                  value={orderForm.status}
                  onChange={(event) =>
                    setOrderForm((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85">
                  {orderForm.id ? "Update Order" : "Add Order"}
                </button>
              </div>
            </form>

            <div className="card-surface overflow-hidden">
              <div className="border-b border-black/10 px-6 py-5">
                <h2 className="text-2xl font-bold text-black">Order List</h2>
              </div>
              {orders.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No orders yet"
                    description="Add a local order to simulate dashboard management."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-[#fafafa] text-sm text-black/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Product</th>
                        <th className="px-6 py-4 font-medium">Qty</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t border-black/10">
                          <td className="px-6 py-5 font-medium text-black">{order.customer}</td>
                          <td className="px-6 py-5 text-black/70">
                            {productOptions.find((item) => String(item.id) === String(order.productId))?.name || order.productId}
                          </td>
                          <td className="px-6 py-5 text-black/70">{order.quantity}</td>
                          <td className="px-6 py-5">
                            <span className="rounded-full bg-[#f0f0f0] px-3 py-1 text-sm text-black/70">
                              {formatStatus(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              <TableAction
                                onClick={() =>
                                  setOrderForm({
                                    id: String(order.id),
                                    productId: String(order.productId || ""),
                                    customer: order.customer || "",
                                    quantity: String(order.quantity || ""),
                                    status: order.status || "pending",
                                  })
                                }
                                className="bg-indigo-600"
                              >
                                Edit
                              </TableAction>
                              <TableAction onClick={() => deleteOrder(order.id)} className="bg-red-600">
                                Delete
                              </TableAction>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AdminDashboard;
