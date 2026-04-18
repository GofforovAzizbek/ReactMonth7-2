import { Link } from "react-router-dom";

function buildStars(rating) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function ProductCard({ item, compact = false }) {
  const price = Number(item.price || 0);
  const discount = Number(item.discount || item.discountPercentage || 0);
  const finalPrice = price - (price * discount) / 100;
  const rating = Number(item.rating || 4.5);
  const image = item.thumbnail || item.images?.[0] || item.pictures?.[0] || "";

  return (
    <Link
      to={`/product/${item.id}`}
      className="group block rounded-[20px] transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        className={`mb-3 flex items-center justify-center overflow-hidden rounded-[20px] bg-[#f2f0f1] p-4 ${
          compact ? "h-[220px] sm:h-[298px]" : "h-[260px] sm:h-[298px]"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={item.name || item.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-sm text-black/40">No image</div>
        )}
      </div>

      <h3 className="mb-2 line-clamp-2 min-h-[48px] text-[18px] font-bold leading-[1.25] text-[#000000] sm:min-h-[54px] sm:text-[20px]">
        {item.name || item.title}
      </h3>

      <div className="mb-2 flex items-center gap-2">
        <span className="text-[12px] tracking-[0.16em] text-[#f5b301]">
          {buildStars(rating)}
        </span>
        <span className="text-[13px] text-black/60">{rating.toFixed(1)}/5</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[28px] font-bold leading-none text-black">
          ${finalPrice.toFixed(0)}
        </span>
        {discount > 0 && (
          <>
            <span className="text-[28px] leading-none text-black/40 line-through">
              ${price.toFixed(0)}
            </span>
            <span className="rounded-full bg-[#ffebeb] px-3 py-1 text-[11px] font-medium text-[#ff3333]">
              -{discount}%
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

export function ProductGridSkeleton({ count = 4, compact = false }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div
            className={`mb-4 rounded-[20px] bg-[#f2f0f1] ${
              compact ? "h-[220px] sm:h-[250px]" : "h-[260px] sm:h-[298px]"
            }`}
          />
          <div className="mb-3 h-6 w-2/3 rounded-full bg-[#f2f0f1]" />
          <div className="mb-3 h-4 w-1/3 rounded-full bg-[#f2f0f1]" />
          <div className="h-7 w-1/2 rounded-full bg-[#f2f0f1]" />
        </div>
      ))}
    </div>
  );
}

export default ProductCard;
