import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchProductApi,
  fetchProductsApi,
  PRODUCTS_CHANGED_EVENT,
} from "../services/api";
import { addToCart } from "../services/cart.jsx";
import ProductCard, { ProductGridSkeleton } from "../components/ProductCard";
import { ErrorState } from "../components/StatusState";
import { showError, showSuccess } from "../services/toast";

const REVIEWS_KEY = "admin_reviews_v1";

function buildStars(rating) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readReviews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getColorCheckClass(color) {
  return color === "#FFFFFF" || color === "#F5DD06"
    ? "text-black"
    : "text-white";
}

function ProductDetailSkeleton() {
  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-8 h-4 w-56 animate-pulse rounded-full bg-[#f0f0f0]" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex gap-4">
          <div className="hidden gap-3 sm:flex sm:flex-col">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 w-28 animate-pulse rounded-[20px] bg-[#f0f0f0]"
              />
            ))}
          </div>
          <div className="min-h-[450px] flex-1 animate-pulse rounded-[20px] bg-[#f0f0f0]" />
        </div>
        <div>
          <div className="mb-4 h-12 w-3/4 animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="mb-6 h-12 w-52 animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="mb-4 h-4 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="mb-8 h-4 w-5/6 animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="mb-5 h-20 animate-pulse rounded-[20px] bg-[#f0f0f0]" />
          <div className="h-14 animate-pulse rounded-full bg-[#f0f0f0]" />
        </div>
      </div>
      <div className="mt-16">
        <ProductGridSkeleton count={4} compact />
      </div>
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState("reviews");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const [item, list] = await Promise.all([
        fetchProductApi(id, { fromServer: true }),
        fetchProductsApi({ fromServer: true }),
      ]);

      if (!item) {
        navigate("/");
        return;
      }

      setProduct(item);
      setAllProducts(list);
      setError("");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "We couldn't load this product. Please check the API and try again.";
      setError(message);
      showError(message, "Product load failed");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();

    const onRefresh = () => fetchProduct();
    window.addEventListener("focus", onRefresh);
    window.addEventListener(PRODUCTS_CHANGED_EVENT, onRefresh);

    return () => {
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, onRefresh);
    };
  }, [fetchProduct]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const list = (product.images || product.pictures || []).filter(Boolean);
    if (list.length > 0) return list;
    return product.thumbnail ? [product.thumbnail] : [];
  }, [product]);

  const reviews = useMemo(() => {
    const all = readReviews();
    return all.filter(
      (review) => String(review.productId) === String(product?.id),
    );
  }, [product?.id]);

  const suggestedProducts = useMemo(() => {
    const others = allProducts.filter((item) => String(item.id) !== String(id));
    const sameType = others.filter(
      (item) =>
        item.type &&
        product?.type &&
        String(item.type).toLowerCase() === String(product.type).toLowerCase(),
    );

    return (sameType.length > 0 ? sameType : others).slice(0, 4);
  }, [allProducts, id, product?.type]);

  const sizes = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.sizes) && product.sizes.length)
      return product.sizes;
    return product.size ? [product.size] : [];
  }, [product]);

  const colors = useMemo(
    () => (Array.isArray(product?.colors) ? product.colors : []),
    [product?.colors],
  );

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedColor(0);
    setQty(1);
  }, [product?.id]);

  useEffect(() => {
    setSelectedSize(sizes[0] || "");
  }, [sizes]);

  if (loading) return <ProductDetailSkeleton />;
  if (error)
    return (
      <ErrorState
        className="container mt-8"
        message={error}
        onRetry={fetchProduct}
      />
    );
  if (!product) return null;

  const price = Number(product.price || 0);
  const discount = Number(product.discount || product.discountPercentage || 0);
  const finalPrice = price - (price * discount) / 100;
  const rating = Number(product.rating || 0);
  const currentImage = gallery[selectedImageIndex] || gallery[0];
  const type = product.type || product.category || "Product";
  const style = product.dressStyle || "Casual";
  const selectedColorValue = colors[selectedColor] || "";

  const handleAddToCart = () => {
    addToCart(product, {
      qty,
      size: selectedSize || product.size,
      color: selectedColorValue,
    });
    showSuccess("Product added to cart.");
    navigate("/cart");
  };

  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-6 text-sm text-black/60">
        <Link to="/" className="transition hover:text-black">
          Home
        </Link>{" "}
        &gt;{" "}
        <Link to="/shop/casual" className="transition hover:text-black">
          Shop
        </Link>{" "}
        &gt;{" "}
        <Link
          to={`/shop/${String(style).toLowerCase()}`}
          className="transition hover:text-black"
        >
          {style}
        </Link>{" "}
        &gt; <span className="text-black">{type}</span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[610px_minmax(0,1fr)] xl:gap-10">
        <div className="grid gap-4 sm:grid-cols-[152px_1fr]">
          <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={`overflow-hidden rounded-[20px] border transition ${
                  selectedImageIndex === index
                    ? "border-black"
                    : "border-transparent hover:border-black/20"
                }`}
              >
                <img
                  src={image}
                  alt={`Product preview ${index + 1}`}
                  className="h-28 w-28 rounded-[20px] bg-[#f0f0f0] object-contain p-3 sm:h-[152px] sm:w-[152px]"
                />
              </button>
            ))}
          </div>

          <div className="order-1 flex min-h-[380px] items-center justify-center rounded-[20px] bg-[#f2f0f1] p-6 sm:min-h-[530px] sm:p-10">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name || product.title}
                className="max-h-[500px] w-full object-contain"
              />
            ) : (
              <p className="text-black/40">No image</p>
            )}
          </div>
        </div>

        <div className="xl:pt-1">
          <h1 className="mb-3 text-[32px] font-black uppercase leading-[0.95] text-black sm:text-[40px] xl:text-[44px]">
            {product.name || product.title}
          </h1>

          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm tracking-[0.18em] text-[#f5b301]">
              {buildStars(rating)}
            </span>
            <span className="text-sm text-black/60">
              {rating > 0 ? `${rating.toFixed(1)}/5` : "No rating yet"}
            </span>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="text-[32px] font-bold text-black sm:text-[40px]">
              ${finalPrice.toFixed(0)}
            </span>
            {discount > 0 ? (
              <>
                <span className="text-[32px] text-black/30 line-through">
                  ${price.toFixed(0)}
                </span>
                <span className="rounded-full bg-[#ffebeb] px-3 py-1 text-sm font-medium text-[#ff3333]">
                  -{discount}%
                </span>
              </>
            ) : null}
          </div>

          <p className="mb-6 border-b border-black/10 pb-6 text-sm leading-7 text-black/60 sm:text-base">
            {product.description ||
              "A clean essential designed for everyday wear and styled to match the look and feel of the storefront."}
          </p>

          {colors.length > 0 ? (
            <div className="border-b border-black/10 py-6">
              <p className="mb-4 text-sm text-black/60">Select Colors</p>
              <div className="flex flex-wrap gap-4">
                {colors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => setSelectedColor(index)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                      selectedColor === index
                        ? "border-black ring-2 ring-black ring-offset-2"
                        : ""
                    }`}
                    aria-label={`Select color ${color}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {selectedColor === index ? (
                      <span
                        className={`text-sm font-bold ${getColorCheckClass(color)}`}
                      >
                        ✓
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {sizes.length > 0 ? (
            <div className="border-b border-black/10 py-6">
              <p className="mb-4 text-sm text-black/60">Choose Size</p>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full px-7 py-3 text-sm font-medium transition ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "bg-[#f0f0f0] text-black/60 hover:bg-black hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 py-6 sm:flex-row">
            <div className="flex h-12 items-center justify-between rounded-full bg-[#f0f0f0] px-4 sm:w-[170px]">
              <button
                onClick={() => setQty((current) => Math.max(1, current - 1))}
                className="text-xl text-black/70 transition hover:text-black"
              >
                -
              </button>
              <span className="font-medium text-black">{qty}</span>
              <button
                onClick={() => setQty((current) => current + 1)}
                className="text-xl text-black/70 transition hover:text-black"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-black px-8 text-sm font-medium text-white transition hover:bg-black/85"
            >
              Add to Cart
            </button>
          </div>

          <div className="grid gap-y-4 rounded-[20px] bg-[#f8f8f8] p-5 text-sm text-black/60 sm:grid-cols-2 sm:gap-x-8">
            <p>
              <span className="font-semibold text-black">Category:</span> {type}
            </p>
            <p>
              <span className="font-semibold text-black">Dress Style:</span>{" "}
              {style}
            </p>
            <p>
              <span className="font-semibold text-black">Stock:</span>{" "}
              {product.stock || 0}
            </p>
            <p>
              <span className="font-semibold text-black">Brand:</span>{" "}
              {product.brand || "Shop.co"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 sm:mt-16">
        <div className="grid grid-cols-3 border-b border-black/10 text-center">
          {[
            { id: "details", label: "Product Details" },
            { id: "reviews", label: "Rating & Reviews" },
            { id: "faqs", label: "FAQs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-4 text-sm font-medium transition sm:text-base ${
                selectedTab === tab.id
                  ? "border-b-2 border-black text-black"
                  : "text-black/40 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {selectedTab === "details" ? (
          <div className="grid gap-4 pt-8 text-sm text-black/70 sm:grid-cols-2 sm:text-base">
            <p>
              <span className="font-semibold text-black">Name:</span>{" "}
              {product.name || product.title || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Type:</span> {type}
            </p>
            <p>
              <span className="font-semibold text-black">Dress Style:</span>{" "}
              {style}
            </p>
            <p>
              <span className="font-semibold text-black">Selected Size:</span>{" "}
              {selectedSize || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Discount:</span>{" "}
              {discount}%
            </p>
            <p>
              <span className="font-semibold text-black">Rank:</span>{" "}
              {product.rank ?? 0}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-black">Description:</span>{" "}
              {product.description || "-"}
            </p>
          </div>
        ) : null}

        {selectedTab === "reviews" ? (
          <div className="pt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-black sm:text-[28px]">
                  All Reviews ({reviews.length})
                </h3>
                <p className="mt-1 text-sm text-black/60">
                  Reviews are sourced from the project&apos;s local admin
                  dashboard.
                </p>
              </div>
              <button className="inline-flex h-11 items-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85">
                Write a Review
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {reviews.length === 0 ? (
                <div className="rounded-[20px] border border-black/10 p-6 text-sm text-black/60">
                  No reviews yet for this product.
                </div>
              ) : null}

              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[20px] border border-black/10 bg-white p-6"
                >
                  <p className="mb-3 text-[#f5b301]">
                    {buildStars(Number(review.rating || 0))}
                  </p>
                  <h4 className="mb-2 text-lg font-bold text-black">
                    {review.customer}
                  </h4>
                  <p className="mb-4 text-sm leading-6 text-black/60">
                    {review.comment}
                  </p>
                  <p className="text-sm text-black/40">
                    Posted on {formatDate(review.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {selectedTab === "faqs" ? (
          <div className="grid gap-4 pt-8">
            {[
              "Delivery usually takes 3 to 7 working days depending on location.",
              "Returns are accepted within 14 days if the product is unused.",
              "Payment is available by card and cash on delivery where supported.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[20px] border border-black/10 p-5 text-sm text-black/70"
              >
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {suggestedProducts.length > 0 ? (
        <section className="mt-16 mb-[80px] sm:mt-20">
          <h2 className="mb-8 text-center text-[32px] font-black uppercase text-black sm:text-5xl">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {suggestedProducts.map((item) => (
              <ProductCard key={item.id} item={item} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ProductDetail;
