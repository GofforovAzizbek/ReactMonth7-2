import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProductsApi, PRODUCTS_CHANGED_EVENT } from "../../services/api";
import ProductCard, { ProductGridSkeleton } from "../ProductCard";
import { ErrorState } from "../StatusState";
import { showError } from "../../services/toast";
import casualImage from "../../assets/images/casual.png";
import formalImage from "../../assets/images/formal.png";
import partyImage from "../../assets/images/party.png";
import gymImage from "../../assets/images/gym.png";

function SectionTitle({ title, description }) {
  return (
    <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
      <h2 className="text-[32px] font-black uppercase text-black sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-[640px] text-sm text-black/60 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ProductSection({ title, description, items }) {
  return (
    <section>
      <SectionTitle title={title} description={description} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-9 flex justify-center">
        <Link
          to="/shop/casual"
          className="inline-flex h-12 items-center rounded-full border border-black/10 px-12 text-sm font-medium text-black transition hover:border-black hover:bg-black hover:text-white"
        >
          View All
        </Link>
      </div>
    </section>
  );
}

function DressStyleCard({ title, image }) {
  return (
    <Link
      to={`/shop/${title.toLowerCase()}`}
      className="group overflow-hidden rounded-[30px] bg-white shadow-sm transition duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
    >
      <div className="grid h-[220px] sm:h-[240px] grid-cols-[1.1fr_1.9fr] overflow-hidden rounded-[30px]">
        <div className="flex items-start p-6">
          <h3 className="text-2xl font-bold text-black leading-tight">
            {title}
          </h3>
        </div>
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover object-right"
          />
        </div>
      </div>
    </Link>
  );
}

function Testimonials() {
  const items = [
    {
      name: "Sarah M.",
      quote:
        "I found pieces that look premium and actually feel comfortable all day. The quality surprised me.",
    },
    {
      name: "Alex K.",
      quote:
        "The product pages are clear, shipping was smooth, and the clothes matched the photos really well.",
    },
    {
      name: "James L.",
      quote:
        "Easy shopping experience and the styling feels modern without trying too hard. I’d absolutely come back.",
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-[32px] font-black uppercase text-black sm:text-5xl">
          Our Happy Customers
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.name}
            className="rounded-[20px] border border-black/10 bg-white p-6 transition hover:border-black/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
          >
            <p className="mb-4 text-[#f5b301]">★★★★★</p>
            <h3 className="mb-3 text-xl font-bold text-black">{item.name}</h3>
            <p className="text-sm leading-6 text-black/60">{item.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Cart() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await fetchProductsApi({ fromServer: true }));
      setError("");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "We couldn't load the latest products. Please verify the API base URL.";
      setError(message);
      showError(message, "Storefront load failed");
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

  const sections = useMemo(() => {
    const ranked = [...products].sort(
      (left, right) => Number(right.rank || 0) - Number(left.rank || 0),
    );
    const discounted = [...products]
      .filter(
        (item) => Number(item.discount || item.discountPercentage || 0) > 0,
      )
      .sort(
        (left, right) =>
          Number(right.discount || right.discountPercentage || 0) -
          Number(left.discount || left.discountPercentage || 0),
      );

    return {
      arrivals: products.slice(0, 4),
      topSelling: (discounted.length > 0 ? discounted : ranked).slice(0, 4),
    };
  }, [products]);

  const dressStyles = [
    { title: "Casual", image: casualImage },
    { title: "Formal", image: formalImage },
    { title: "Party", image: partyImage },
    { title: "Gym", image: gymImage },
  ];

  return (
    <div className="container py-12 sm:py-16">
      {loading ? (
        <>
          <SectionTitle
            title="New Arrivals"
            description="Fresh drops inspired by the visual direction in the design."
          />
          <ProductGridSkeleton count={4} />
          <div className="my-12 border-t border-black/10 sm:my-16" />
          <SectionTitle
            title="Top Selling"
            description="Popular pieces with the strongest ranking and discounts."
          />
          <ProductGridSkeleton count={4} />
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : (
        <>
          <ProductSection
            title="New Arrivals"
            description="Fresh pieces with clean silhouettes, soft neutrals, and polished everyday styling."
            items={sections.arrivals}
          />

          <div className="my-12 border-t border-black/10 sm:my-16" />

          <ProductSection
            title="Top Selling"
            description="Best-performing products pulled from the live catalog with real pricing and discount data."
            items={sections.topSelling}
          />

          <section className="mt-12 rounded-[40px] bg-[#f2f2f2] px-6 py-8 sm:mt-20 sm:px-12 sm:py-14 lg:px-16">
            <SectionTitle title="Browse By Dress Style" />
            <div className="grid gap-4 sm:grid-cols-2">
              {dressStyles.map((item) => (
                <DressStyleCard
                  key={item.title}
                  title={item.title}
                  image={item.image}
                />
              ))}
            </div>
          </section>

          <Testimonials />
        </>
      )}
    </div>
  );
}

export default Cart;
