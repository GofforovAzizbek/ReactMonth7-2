import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProductsApi, PRODUCTS_CHANGED_EVENT } from "../services/api";

function buildStars(rating) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function ShopCasual() {
  const { style } = useParams();
  const navigate = useNavigate();
  const styleFromRoute = useMemo(() => {
    const raw = String(style || "casual").trim();
    return raw ? raw[0].toUpperCase() + raw.slice(1).toLowerCase() : "Casual";
  }, [style]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchProductsApi({ fromServer: true });
      setProducts(list);
      const prices = list.map((p) => Number(p.price || 0));
      const min = prices.length ? Math.min(...prices) : 0;
      const max = prices.length ? Math.max(...prices) : 1000;
      setPriceRange({ min, max });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Products load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(PRODUCTS_CHANGED_EVENT, load);
    return () => window.removeEventListener(PRODUCTS_CHANGED_EVENT, load);
  }, [load]);

  const filterMeta = useMemo(() => {
    const types = [...new Set(products.map((p) => p.type).filter(Boolean))];
    const sizes = [...new Set(products.map((p) => p.size).filter(Boolean))];
    const styles = [...new Set(products.map((p) => p.dressStyle).filter(Boolean))];
    const colors = [...new Set(products.flatMap((p) => p.colors || []).filter(Boolean))];
    return { types, sizes, styles, colors };
  }, [products]);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const price = Number(p.price || 0);
      const byType = typeFilter === "all" || p.type === typeFilter;
      const byColor = !colorFilter || (p.colors || []).includes(colorFilter);
      const bySize = !sizeFilter || p.size === sizeFilter;
      // dressStyle bo'sh bo'lsa ham product ro'yxatda ko'rinsin
      const byStyle =
        styleFilter === "all" ||
        !String(p.dressStyle || "").trim() ||
        p.dressStyle === styleFilter;
      const byPrice = price >= priceRange.min && price <= priceRange.max;
      return byType && byColor && bySize && byStyle && byPrice;
    });

    if (sortBy === "price-low") return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return [...list].sort((a, b) => b.price - a.price);
    return [...list].sort((a, b) => Number(b.rank || 0) - Number(a.rank || 0));
  }, [products, typeFilter, colorFilter, sizeFilter, styleFilter, priceRange, sortBy]);

  const perPage = 9;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, colorFilter, sizeFilter, styleFilter, priceRange, sortBy]);

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;

  const renderCard = (item) => {
    const price = Number(item.price || 0);
    const discount = Number(item.discount || item.discountPercentage || 0);
    const finalPrice = price - (price * discount) / 100;
    const rating = Number(item.rating || 4.5);
    return (
      <article key={item.id} className="cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
        <div className="mb-3 flex h-[220px] items-center justify-center rounded-2xl bg-[#f2f0f1] p-4 sm:h-[260px]">
          <img
            src={item.thumbnail || item.pictures?.[0]}
            alt={item.name || item.title}
            className="h-full w-full object-contain"
          />
        </div>
        <h3 className="mb-1 line-clamp-1 text-[22px] font-bold">{item.name || item.title}</h3>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[#f5b301]">{buildStars(rating)}</span>
          <span className="text-sm text-gray-500">{rating.toFixed(1)}/5</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-3xl font-bold">${finalPrice.toFixed(0)}</span>
          {discount > 0 && (
            <>
              <span className="text-2xl text-gray-400 line-through">${price.toFixed(0)}</span>
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-500">-{discount}%</span>
            </>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="container py-8">
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-black">Home</Link> &gt; {styleFromRoute}
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-4xl font-black">{styleFromRoute}</h1>
        <button
          className="inline-flex h-10 items-center rounded-full bg-gray-100 px-4 lg:hidden"
          onClick={() => setShowFilter(true)}
        >
          Filter
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-2xl border border-gray-200 p-4 lg:block">
          <h3 className="mb-4 text-2xl font-bold">Filters</h3>
          <div className="space-y-5">
            <div>
              <p className="mb-2 font-semibold">Type</p>
              <div className="space-y-2">
                <button onClick={() => setTypeFilter("all")} className={`block ${typeFilter === "all" ? "font-bold" : "text-gray-600"}`}>All</button>
                {filterMeta.types.map((type) => (
                  <button key={type} onClick={() => setTypeFilter(type)} className={`block ${typeFilter === type ? "font-bold" : "text-gray-600"}`}>{type}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold">Price</p>
              <div className="grid gap-2">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) }))
                  }
                />
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                  }
                />
                <p className="text-sm text-gray-500">${priceRange.min} - ${priceRange.max}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold">Colors</p>
              <div className="flex flex-wrap gap-2">
                {filterMeta.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColorFilter((prev) => (prev === color ? "" : color))}
                    className={`h-8 w-8 rounded-full border ${colorFilter === color ? "ring-2 ring-black" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold">Size</p>
              <div className="flex flex-wrap gap-2">
                {filterMeta.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSizeFilter((prev) => (prev === size ? "" : size))}
                    className={`rounded-full px-3 py-1 text-sm ${sizeFilter === size ? "bg-black text-white" : "bg-gray-100"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold">Dress Style</p>
              <div className="space-y-2">
                <button
                  onClick={() => setStyleFilter("all")}
                  className={`block ${styleFilter === "all" ? "font-bold" : "text-gray-600"}`}
                >
                  All
                </button>
                {filterMeta.styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setStyleFilter(style)}
                    className={`block ${styleFilter === style ? "font-bold" : "text-gray-600"}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Showing {filtered.length === 0 ? 0 : start + 1}-{Math.min(start + perPage, filtered.length)} of {filtered.length} Products
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {pageItems.length === 0 ? (
            <p className="rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
              Product topilmadi.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {pageItems.map(renderCard)}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-gray-200 px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-sm text-gray-500">
              Page {currentPage} / {pageCount}
            </p>
            <button
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="rounded-md border border-gray-200 px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showFilter && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 lg:hidden">
          <div className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Filters</h3>
              <button onClick={() => setShowFilter(false)} className="text-2xl">×</button>
            </div>
            <div className="space-y-5">
              <div>
                <p className="mb-2 font-semibold">Type</p>
                <div className="space-y-2">
                  <button onClick={() => setTypeFilter("all")} className={`block ${typeFilter === "all" ? "font-bold" : "text-gray-600"}`}>All</button>
                  {filterMeta.types.map((type) => (
                    <button key={type} onClick={() => setTypeFilter(type)} className={`block ${typeFilter === type ? "font-bold" : "text-gray-600"}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-semibold">Dress Style</p>
                <div className="space-y-2">
                  <button onClick={() => setStyleFilter("all")} className={`block ${styleFilter === "all" ? "font-bold" : "text-gray-600"}`}>All</button>
                  {filterMeta.styles.map((style) => (
                    <button key={style} onClick={() => setStyleFilter(style)} className={`block ${styleFilter === style ? "font-bold" : "text-gray-600"}`}>{style}</button>
                  ))}
                </div>
              </div>
              <button
                className="h-11 w-full rounded-full bg-black text-white"
                onClick={() => setShowFilter(false)}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ShopCasual;
