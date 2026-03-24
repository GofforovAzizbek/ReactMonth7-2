import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // API dan mahsulot ma'lumotlarini olish
  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        // Birinchi rangi avtomatik tanlash
        if (res.data.colors && res.data.colors.length > 0) {
          setSelectedColor(res.data.colors[0]);
        }
      })
      .catch((err) => {
        console.log("Mahsulot yuklanishida xatolik:", err);
        navigate("/");
      });
  }, [id, navigate]);

  // Mahsulot yuklanayotgan vaqt
  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Yuklanmoqda...</p>
      </div>
    );
  }

  // Diskauntli narxni hisoblash
  const discountedPrice =
    product.price - (product.price * (product.discount || 0)) / 100;

  // Raqamni 2 ta kasrga yaxlitlash
  const formattedPrice = discountedPrice.toFixed(0);
  const formattedOriginalPrice = product.price.toFixed(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Asosiy container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 lg:py-12">
        {/* Orqaga qaytish tugmasi */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 hover:text-black transition"
        >
          ← Orqaga qaytish
        </button>

        {/* Mahsulot detallari - Responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Rasm seksiyasi */}
          <div className="flex flex-col gap-4">
            {/* Asosiy rasm */}
            <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-96">
              <img
                src={product.pictures?.[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>

            {/* Rasm galereya (agar ko'p rasm bo'lsa) */}
            {product.pictures && product.pictures.length > 1 && (
              <div className="flex gap-3">
                {product.pictures.map((pic, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 rounded-lg p-2 w-20 h-20 cursor-pointer"
                  >
                    <img
                      src={pic}
                      alt={`Rasm ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mahsulot ma'lumotlari */}
          <div className="flex flex-col gap-6">
            {/* Nomi va reytingi */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400">⭐⭐⭐⭐☆</span>
                <span className="text-gray-600">4.5/5 (Sharhlar)</span>
              </div>
            </div>

            {/* Narx seksiyasi */}
            <div className="flex items-center gap-3 border-b pb-6">
              <span className="text-3xl font-bold text-gray-900">
                ${formattedPrice}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ${formattedOriginalPrice}
                  </span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}%
                  </span>
                </>
              )}
            </div>

            {/* Tavsifi */}
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Ranglar seksiyasi */}
            {product.colors && product.colors.length > 0 && (
              <div className="border-b pb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Rangni tanlang
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition ${
                        selectedColor === color
                          ? "border-black scale-110"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: `#${color}` }}
                      title={`Rang: #${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* O'lcham seksiyasi (agar mavjud bo'lsa) */}
            {product.size && (
              <div className="border-b pb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  O'lchamni tanlang
                </p>
                <div className="flex gap-3 flex-wrap">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-3 border rounded-lg transition ${
                        selectedSize === size
                          ? "bg-black text-white border-black"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Miqdor va Savatga qo'shish */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Miqdor */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-lg font-semibold hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 py-3 text-lg font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-lg font-semibold hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              {/* Savatga qo'shish tugmasi */}
              <button className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
                Savatga qo'shish
              </button>
            </div>

            {/* Mahsulot xususiyatlari */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p>
                <span className="font-semibold">Turi:</span>{" "}
                {product.type || "—"}
              </p>
              <p>
                <span className="font-semibold">Uslubi:</span>{" "}
                {product.dressStyle || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Sharhlar seksiyasi (Ixtiyoriy) */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">Sharhlar va baho</h2>
          <p className="text-gray-600">
            Mahsulot sharhlarini ko'rish uchun saytda to'liq versiyasiga qarang.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
