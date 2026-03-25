import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProductsApi, PRODUCTS_CHANGED_EVENT } from "../../services/api";

function buildStars(rating) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

// Bitta mahsulot kartasi
function ProductCard({ item, onOpen }) {
  const price = Number(item.price || 0);
  const discount = Number(item.discount || item.discountPercentage || 0);
  const finalPrice = price - (price * discount) / 100;
  const rating = Number(item.rating || 4.5);

  return (
    <button onClick={onOpen} className="text-left group">
      <div className="bg-[#f1efef] rounded-[20px] p-5 h-[220px] sm:h-[240px] flex items-center justify-center mb-4 overflow-hidden">
        <img
          src={item.thumbnail || item.pictures?.[0]}
          alt={item.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      <p className="font-semibold text-base sm:text-lg line-clamp-1 mb-1">
        {item.name || item.title}
      </p>

      <div className="flex items-center gap-2 text-sm mb-1">
        <span className="text-[#f5b301]">{buildStars(rating)}</span>
        <span className="text-gray-500">{rating.toFixed(1)}/5</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold text-xl">${finalPrice.toFixed(0)}</span>
        {discount > 0 && (
          <>
            <span className="text-gray-400 line-through text-xl">
              ${price.toFixed(0)}
            </span>
            <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
              -{discount}%
            </span>
          </>
        )}
      </div>
    </button>
  );
}

// Bir xil section UI (NEW ARRIVALS / TOP SELLING)
function ProductSection({ title, items, onOpen }) {
  return (
    <>
      <h2 className="text-center font-black text-4xl sm:text-5xl mb-8 sm:mb-10">
        {title}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onOpen={() => onOpen(item.id)}
          />
        ))}
      </div>
      <div className="flex justify-center mt-8 sm:mt-10">
        <Link
          to="/shop/casual"
          className="inline-flex items-center h-12 px-10 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          View All
        </Link>
      </div>
    </>
  );
}

function Cart() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mahsulotlarni backend/local cache'dan olish
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await fetchProductsApi({ fromServer: true }));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Mahsulotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const onRefresh = () => fetchProducts();
    window.addEventListener("focus", onRefresh);
    window.addEventListener(PRODUCTS_CHANGED_EVENT, onRefresh);
    return () => {
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, onRefresh);
    };
  }, [fetchProducts]);

  const sections = useMemo(
    () => [
      { title: "NEW ARRIVALS", items: products.slice(0, 4) },
      { title: "TOP SELLING", items: products.slice(4, 8) },
    ],
    [products],
  );

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;

  return (
    <section className="container py-12 sm:py-16">
      <ProductSection
        title={sections[0].title}
        items={sections[0].items}
        onOpen={(id) => navigate(`/product/${id}`)}
      />
      <div className="my-10 sm:my-14 border-t border-gray-200" />
      <ProductSection
        title={sections[1].title}
        items={sections[1].items}
        onOpen={(id) => navigate(`/product/${id}`)}
      />
    </section>
  );
}

export default Cart;
