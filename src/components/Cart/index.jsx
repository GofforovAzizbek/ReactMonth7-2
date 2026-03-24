import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // API dan mahsulotlarni olish
  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Mahsulotlarni olishda xatolik:", err);
        setError("Mahsulotlarni yuklashda xatolik yuz berdi");
        setLoading(false);
      });
  }, []);

  // Mahsulot kartasini yaratish
  const ProductCard = ({ item }) => {
    const discountedPrice =
      item.price - (item.price * (item.discount || 0)) / 100;

    return (
      <div
        onClick={() => navigate(`/product/${item._id}`)}
        className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
      >
        {/* Rasm container */}
        <div className="bg-gray-100 rounded-lg p-4 overflow-hidden h-48 sm:h-56 lg:h-64 flex items-center justify-center relative">
          <img
            src={item.pictures?.[0]}
            alt={item.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Diskount badge */}
          {item.discount > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{item.discount}%
            </span>
          )}
        </div>

        {/* Mahsulot ma'lumoti */}
        <div className="p-4 sm:p-5">
          {/* Nomi */}
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-2">
            {item.name}
          </h3>

          {/* Reytingi */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-yellow-400 text-sm">⭐⭐⭐⭐☆</span>
            <span className="text-gray-600 text-xs">4.5/5</span>
          </div>

          {/* Narx */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg sm:text-xl text-gray-900">
              ${discountedPrice.toFixed(0)}
            </span>

            {item.discount > 0 && (
              <span className="line-through text-gray-400 text-sm">
                ${item.price.toFixed(0)}
              </span>
            )}
          </div>

          {/* Tezkor habar */}
          <p className="text-xs text-gray-500 mt-2">
            * Batafsil ma'lumotni ko'rish uchun bosing
          </p>
        </div>
      </div>
    );
  };

  // Yuklanayotgan holatni ko'rsatish
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center items-center min-h-96">
          <p className="text-lg text-gray-600">Mahsulotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Xatolik holati
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center items-center min-h-96">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Bo'sh holati
  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center items-center min-h-96">
          <p className="text-lg text-gray-600">Mahsulotlar topilmadi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Sarlavha */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            YANGI KELGAN MAHSULOTLAR
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Eng so'nggi va eng yaxshi sifatli kiyimlar
          </p>
        </div>

        {/* Mahsulotlar gridi - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-14 lg:mb-16">
          {products.slice(0, 8).map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>

        {/* Barchasi ko'rish tugmasi - Faqat ko'p mahsulot bo'lsa */}
        {products.length > 8 && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                // Barchasi ko'rish funksiyasi
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-8 sm:px-10 py-3 sm:py-4 border border-gray-300 rounded-full text-gray-900 font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Barcha mahsulotlarni ko'rish
            </button>
          </div>
        )}

        {/* Boshqa seksiya - Bo'sh joy */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            ENG MASHHUR MAHSULOTLAR
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.slice(8, 12).map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
