import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchProductApi,
  fetchProductsApi,
  PRODUCTS_CHANGED_EVENT,
} from "../services/api";
import { addToCart } from "../services/cart.jsx";

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

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState("reviews");
  const [selectedSize, setSelectedSize] = useState("Large");
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);

  const fetchProduct = useCallback(async () => {
    try {
      const [item, list] = await Promise.all([
        fetchProductApi(id, { fromServer: true }),
        fetchProductsApi({ fromServer: true }),
      ]);
      if (!item) return navigate("/");
      setProduct(item);
      setAllProducts(list);
    } catch {
      navigate("/");
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
      (r) => String(r.productId) === String(product?.id),
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
    return Array.isArray(product.sizes) ? product.sizes : [];
  }, [product]);

  const colors = useMemo(() => {
    if (!product) return [];
    return Array.isArray(product.colors) ? product.colors : [];
  }, [product]);

  useEffect(() => {
    if (sizes.length > 0) setSelectedSize(sizes[0]);
  }, [product?.id, sizes]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedColor(0);
  }, [product?.id]);

  if (loading) return <p className="p-8 text-center">Loading...</p>;
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
    navigate("/cart");
  };

  return (
    <div className="container py-8">
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-black">Home</Link> &gt;{" "}
        <Link to="/" className="hover:text-black">Shop</Link> &gt;{" "}
        <Link to={`/shop/${String(style).toLowerCase()}`} className="hover:text-black">{style}</Link> &gt; {type}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="flex gap-4">
          <div className="flex lg:flex-col gap-3">
            {gallery.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 ${selectedImageIndex === idx ? "border-black" : "border-transparent"}`}
              >
                <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="flex-1 bg-[#f2f0f1] rounded-3xl p-6 min-h-[420px] flex items-center justify-center">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name || product.title}
                className="max-h-[360px] max-w-full object-contain"
              />
            ) : (
              <p className="text-gray-400">No image</p>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-black uppercase mb-3">
            {product.name || product.title}
          </h1>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#f5b301]">{buildStars(rating)}</span>
            <span className="text-gray-500 text-sm">{rating > 0 ? `${rating.toFixed(1)}/5` : "No rating"}</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl font-bold">${finalPrice.toFixed(0)}</span>
            {discount > 0 && (
              <>
                <span className="text-4xl text-gray-400 line-through">
                  ${price.toFixed(0)}
                </span>
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-5">
            {product.description || "No description"}
          </p>

          {colors.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-gray-500 mb-2">Select Colors</p>
              <div className="flex gap-3">
                {colors.map((color, idx) => (
                  <button
                    key={`${color}-${idx}`}
                    onClick={() => setSelectedColor(idx)}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${selectedColor === idx ? "border-black" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === idx ? (
                      <span className="text-white text-sm font-bold">✓</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-gray-500 mb-2">Choose Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 h-10 rounded-full ${selectedSize === size ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 flex gap-3">
            <div className="h-12 rounded-full bg-gray-100 px-4 flex items-center gap-4">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <button
              className="flex-1 h-12 rounded-full bg-black text-white"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="grid grid-cols-3 border-b border-gray-200 text-center">
          <button
            onClick={() => setSelectedTab("details")}
            className={`py-3 ${selectedTab === "details" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
          >
            Product Details
          </button>
          <button
            onClick={() => setSelectedTab("reviews")}
            className={`py-3 ${selectedTab === "reviews" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
          >
            Rating & Reviews
          </button>
          <button
            onClick={() => setSelectedTab("faqs")}
            className={`py-3 ${selectedTab === "faqs" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
          >
            FAQs
          </button>
        </div>

        {selectedTab === "details" && (
          <div className="pt-6 text-gray-700">
            <div className="grid gap-3 sm:grid-cols-2">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {product.name || product.title || "-"}
              </p>
              <p>
                <span className="font-semibold">Type:</span> {type}
              </p>
              <p>
                <span className="font-semibold">Dress Style:</span> {style}
              </p>
              <p>
                <span className="font-semibold">Size:</span> {product.size || selectedSize || "-"}
              </p>
              <p>
                <span className="font-semibold">Rank:</span> {product.rank ?? 0}
              </p>
              <p>
                <span className="font-semibold">Discount:</span> {discount}%
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Description:</span>{" "}
                {product.description || "-"}
              </p>
            </div>
          </div>
        )}

        {selectedTab === "reviews" && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">All Reviews ({reviews.length})</h3>
              <button className="px-6 h-11 rounded-full bg-black text-white">
                Write a Review
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {reviews.length === 0 && (
                <p className="text-gray-500">Hozircha review yo&apos;q.</p>
              )}
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-2xl p-5 bg-white">
                  <p className="text-[#f5b301] mb-2">{buildStars(Number(review.rating || 0))}</p>
                  <p className="font-semibold mb-2">{review.customer}</p>
                  <p className="text-gray-600 mb-3">{review.comment}</p>
                  <p className="text-sm text-gray-400">Posted on {formatDate(review.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === "faqs" && (
          <div className="pt-6 text-gray-700">
            <p>1. Delivery 3-7 working days.</p>
            <p>2. Return policy: 14 days.</p>
            <p>3. Payment: Card / Cash on delivery.</p>
          </div>
        )}
      </div>

      {suggestedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-4xl font-black uppercase sm:text-5xl">
            You Might Also Like
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suggestedProducts.map((item) => {
              const itemPrice = Number(item.price || 0);
              const itemDiscount = Number(
                item.discount || item.discountPercentage || 0,
              );
              const itemFinal = itemPrice - (itemPrice * itemDiscount) / 100;
              const itemRating = Number(item.rating || 4.5);
              const itemImage =
                item.thumbnail || item.images?.[0] || item.pictures?.[0] || "";

              return (
                <article
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="mb-3 flex h-[220px] items-center justify-center rounded-2xl bg-[#f2f0f1] p-4 sm:h-[260px]">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name || item.title}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <p className="text-gray-400">No image</p>
                    )}
                  </div>

                  <h3 className="mb-1 line-clamp-2 text-lg font-bold">
                    {item.name || item.title}
                  </h3>

                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm text-[#f5b301]">
                      {buildStars(itemRating)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {itemRating.toFixed(1)}/5
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-3xl font-bold">${itemFinal.toFixed(0)}</span>
                    {itemDiscount > 0 && (
                      <>
                        <span className="text-2xl text-gray-400 line-through">
                          ${itemPrice.toFixed(0)}
                        </span>
                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-500">
                          -{itemDiscount}%
                        </span>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
