import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchProductsApi, PRODUCTS_CHANGED_EVENT } from "../services/api";
import ProductCard, { ProductGridSkeleton } from "../components/ProductCard";
import { EmptyState, ErrorState } from "../components/StatusState";
import { showError } from "../services/toast";

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Top Rated", value: "rating" },
];

const FILTER_COLORS = [
  "#00C12B",
  "#F50606",
  "#F5DD06",
  "#F57906",
  "#06CAF5",
  "#063AF5",
  "#7D06F5",
  "#F506A4",
  "#FFFFFF",
  "#000000",
];

function normalizeLabel(value, fallback) {
  const raw = String(value || fallback).trim();
  return raw ? raw[0].toUpperCase() + raw.slice(1).toLowerCase() : fallback;
}

function normalizeHexColor(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  if (!raw) return "";
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function getColorButtonClasses(color, isActive) {
  const isWhite = color === "#FFFFFF";

  return `relative h-[35px] w-[35px] rounded-full border ${
    isWhite ? "border-black/20" : "border-black/10"
  } ${isActive ? "ring-2 ring-black ring-offset-2" : ""}`;
}

function getCheckmarkClass(color) {
  return color === "#FFFFFF" || color === "#F5DD06"
    ? "text-black"
    : "text-white";
}

function ShopCasual() {
  const { style } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const styleFromRoute = useMemo(
    () => normalizeLabel(style, "Casual"),
    [style],
  );
  const pageTitle = "All Products";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);

  const searchQuery = String(searchParams.get("q") || "")
    .trim()
    .toLowerCase();
  const typeFilter = searchParams.get("type") || "all";
  const colorFilter = searchParams.get("color") || "";
  const sizeFilter = searchParams.get("size") || "";
  const dressStyleFilter = searchParams.get("dressStyle") || "all";
  const sortBy = searchParams.get("sort") || "popular";
  const currentPageParam = Math.max(1, Number(searchParams.get("page") || 1));
  const priceLimit = Number(searchParams.get("price") || maxPrice || 1000);

  const updateParams = useCallback(
    (updates = {}, options = {}) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        const emptyValue =
          value === undefined ||
          value === null ||
          value === "" ||
          value === "all" ||
          (key === "page" && Number(value) <= 1);

        if (emptyValue) next.delete(key);
        else next.set(key, String(value));
      });

      setSearchParams(next, { replace: options.replace ?? false });
    },
    [searchParams, setSearchParams],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchProductsApi({ fromServer: true });
      const prices = list.map((item) => Number(item.price || 0));
      const nextMax = prices.length ? Math.max(...prices) : 1000;

      setProducts(list);
      setMaxPrice(nextMax);

      if (!searchParams.get("price") && nextMax !== 1000) {
        updateParams({ price: "" }, { replace: true });
      }

      setError("");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "We couldn't load this collection. Please verify the API connection.";
      setError(message);
      showError(message, "Collection load failed");
    } finally {
      setLoading(false);
    }
  }, [searchParams, updateParams]);

  useEffect(() => {
    load();
    window.addEventListener(PRODUCTS_CHANGED_EVENT, load);
    return () => window.removeEventListener(PRODUCTS_CHANGED_EVENT, load);
  }, [load]);

  const filterMeta = useMemo(() => {
    const types = [
      ...new Set(products.map((item) => item.type).filter(Boolean)),
    ];
    const sizes = [
      ...new Set(
        products.flatMap((item) =>
          item.sizes?.length ? item.sizes : item.size ? [item.size] : [],
        ),
      ),
    ];
    const colors = [
      ...new Set(
        [...FILTER_COLORS, ...products.flatMap((item) => item.colors || [])]
          .map(normalizeHexColor)
          .filter(Boolean),
      ),
    ];
    const dressStyles = [
      ...new Set(products.map((item) => item.dressStyle).filter(Boolean)),
    ];

    return { types, sizes, colors, dressStyles };
  }, [products]);

  const filtered = useMemo(() => {
    const list = products
      .filter((item) => {
        const itemPrice = Number(item.price || 0);
        const itemName = String(item.name || item.title || "").toLowerCase();
        const itemSizes = item.sizes?.length
          ? item.sizes
          : item.size
            ? [item.size]
            : [];
        const itemDressStyle = String(item.dressStyle || "")
          .trim()
          .toLowerCase();

        return (
          (!searchQuery || itemName.includes(searchQuery)) &&
          (typeFilter === "all" || item.type === typeFilter) &&
          (!colorFilter ||
            (item.colors || []).map(normalizeHexColor).includes(colorFilter)) &&
          (!sizeFilter || itemSizes.includes(sizeFilter)) &&
          (dressStyleFilter === "all" ||
            itemDressStyle === String(dressStyleFilter).toLowerCase()) &&
          itemPrice <= priceLimit
        );
      })
      .sort((left, right) => {
        if (sortBy === "price-low")
          return Number(left.price || 0) - Number(right.price || 0);
        if (sortBy === "price-high")
          return Number(right.price || 0) - Number(left.price || 0);
        if (sortBy === "rating")
          return Number(right.rating || 0) - Number(left.rating || 0);
        return Number(right.rank || 0) - Number(left.rank || 0);
      });

    return list;
  }, [
    colorFilter,
    dressStyleFilter,
    priceLimit,
    products,
    searchQuery,
    sizeFilter,
    sortBy,
    typeFilter,
  ]);

  const perPage = 9;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(currentPageParam, pageCount);
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  useEffect(() => {
    if (currentPageParam > pageCount) {
      updateParams({ page: pageCount }, { replace: true });
    }
  }, [currentPageParam, pageCount, updateParams]);

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      const q = prev.get("q");
      if (q) next.set("q", q);
      return next;
    });
  };

  const renderCategoryButton = (value, label) => (
    <button
      key={value}
      onClick={() => updateParams({ type: value, page: 1 })}
      className={`flex w-full items-center justify-between text-left text-[15px] transition ${
        typeFilter === value
          ? "font-medium text-black"
          : "text-black/60 hover:text-black"
      }`}
    >
      <span>{label}</span>
      <span className="text-black/40">›</span>
    </button>
  );

  const filtersPanel = (
    <div className="rounded-[20px] border border-black/10 bg-white p-5">
      <div className="border-b border-black/10 pb-5 text-center">
        <h3 className="text-xl font-bold text-black">Filters</h3>
      </div>

      <div className="space-y-6 pt-5">
        <div className="space-y-4 border-b border-black/10 pb-6">
          {renderCategoryButton("all", "All")}
          {filterMeta.types.map((type) => renderCategoryButton(type, type))}
        </div>

        <div className="border-b border-black/10 pb-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-bold text-black">Price</h4>
            <span className="text-black/50">⌃</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            value={Math.min(priceLimit, maxPrice)}
            onChange={(event) =>
              updateParams({ price: Number(event.target.value), page: 1 })
            }
            className="w-full accent-black"
          />
          <div className="mt-2 flex items-center justify-between text-sm text-black/70">
            <span>$50</span>
            <span>${Math.min(priceLimit, maxPrice)}</span>
          </div>
        </div>

        <div className="border-b border-black/10 pb-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-bold text-black">Colors</h4>
            <span className="text-black/50">⌃</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {filterMeta.colors.map((color) => (
              <button
                key={color}
                onClick={() =>
                  updateParams({
                    color: colorFilter === color ? "" : color,
                    page: 1,
                  })
                }
                className={getColorButtonClasses(color, colorFilter === color)}
                style={{ backgroundColor: color }}
                title={color}
              >
                {colorFilter === color ? (
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getCheckmarkClass(color)}`}
                  >
                    ✓
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-black/10 pb-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-bold text-black">Size</h4>
            <span className="text-black/50">⌃</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterMeta.sizes.map((size) => (
              <button
                key={size}
                onClick={() =>
                  updateParams({
                    size: sizeFilter === size ? "" : size,
                    page: 1,
                  })
                }
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  sizeFilter === size
                    ? "bg-black text-white"
                    : "bg-[#f0f0f0] text-black/60 hover:bg-black hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-black">Dress Style</h4>
            <span className="text-black/50">⌃</span>
          </div>
          <button
            onClick={() => updateParams({ dressStyle: "all", page: 1 })}
            className={`flex w-full items-center justify-between text-left text-[15px] ${
              dressStyleFilter === "all"
                ? "font-medium text-black"
                : "text-black/60 hover:text-black"
            }`}
          >
            <span>All</span>
            <span className="text-black/40">›</span>
          </button>
          {filterMeta.dressStyles
            .filter(
              (item) => item.toLowerCase() !== styleFromRoute.toLowerCase(),
            )
            .map((item) => (
              <button
                key={item}
                onClick={() =>
                  updateParams({
                    dressStyle: dressStyleFilter === item ? "" : item,
                    page: 1,
                  })
                }
                className={`flex w-full items-center justify-between text-left text-[15px] ${
                  dressStyleFilter === item
                    ? "font-medium text-black"
                    : "text-black/60 hover:text-black"
                }`}
              >
                <span>{item}</span>
                <span className="text-black/40">›</span>
              </button>
            ))}

          <button
            onClick={clearFilters}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white transition hover:bg-black/85"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="container py-8 sm:py-10">
      <div className="text-sm text-black/60">
        <Link to="/" className="transition hover:text-black">
          Home
        </Link>{" "}
        &gt; <span className="text-black">Products</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        {/* <div>
          <h1 className="text-[32px] font-black text-black sm:text-[40px]">
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm text-black/45">
            Showing {filtered.length === 0 ? 0 : start + 1}-
            {Math.min(start + perPage, filtered.length)} of {filtered.length}{" "}
            Products
          </p>
        </div> */}

        <button
          className="inline-flex h-11 items-center rounded-full bg-[#f0f0f0] px-5 text-sm font-medium text-black transition hover:bg-black hover:text-white lg:hidden"
          onClick={() => setShowFilter(true)}
        >
          Open Filters
        </button>
      </div>

      <div className="grid gap-[20px] xl:gap-[20px] lg:grid-cols-[295px_1fr]">
        <aside className="hidden lg:block">{filtersPanel}</aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="">
              <h2 className="text-[32px]">Casual</h2>
            </div>
            <div />
            <div className="flex items-center gap-2 text-sm text-black/60">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(event) =>
                  updateParams({ sort: event.target.value, page: 1 })
                }
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black outline-none transition focus:border-black"
              >
                {SORT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={9} compact />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : pageItems.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting the active filters to see more items from this collection."
              action={
                <button
                  onClick={clearFilters}
                  className="inline-flex h-11 items-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85"
                >
                  Clear Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-[20px] gap-y-9 sm:grid-cols-3 xl:grid-cols-3">
                {pageItems.map((item) => (
                  <ProductCard key={item.id} item={item} compact />
                ))}
              </div>

              <div className="mt-10 mb-[80px] flex items-center justify-between border-t border-black/10 pt-5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => updateParams({ page: currentPage - 1 })}
                  className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm text-black transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <div className="hidden items-center gap-2 sm:flex">
                  {Array.from({ length: pageCount }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === currentPage;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => updateParams({ page: pageNumber })}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm transition ${
                          isActive
                            ? "bg-[#f0f0f0] font-medium text-black"
                            : "text-black/50 hover:bg-[#f0f0f0]"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage >= pageCount}
                  onClick={() => updateParams({ page: currentPage + 1 })}
                  className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm text-black transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showFilter ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 lg:hidden">
          <div className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[24px] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-black">Filters</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="text-3xl leading-none text-black/60"
              >
                ×
              </button>
            </div>
            {filtersPanel}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ShopCasual;
