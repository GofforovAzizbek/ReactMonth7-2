import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CART_CHANGED_EVENT, getCartItems } from "../../services/cart.jsx";

// Mobile Navigation transition
import menuIcon from "../../assets/icons/menu.svg";
import closeIcon from "../../assets/icons/close.svg";

// Navbar arrowicon
import arrow from "../../assets/icons/arrow.svg";

// Header right icons
import searchIcon from "../../assets/icons/search.svg";
import bagsIcon from "../../assets/icons/bags.svg";
import userIcon from "../../assets/icons/user.svg";

// Header Logo
import logo from "../../assets/icons/logo.svg";

function readSearchValue(search) {
  return new URLSearchParams(search).get("q") || "";
}

// ⚠️ MUHIM: Bu komponent App.jsx da Routes dan tashqarida render qilingan
// Shuning uchun sahifa almashinishda qayta yuklanmaydi va state saqlanib qoladi
function Header() {
  // Header Navigation map links
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [query, setQuery] = useState(() => readSearchValue(location.search));
  const [cartCount, setCartCount] = useState(() =>
    getCartItems().reduce((total, item) => total + Number(item.qty || 1), 0),
  );
  const navigate = useNavigate();

  const navLinks = useMemo(
    () => [
      { name: "Shop", href: "/shop/casual", hasArrow: true },
      { name: "On Sale", href: "/shop/casual", hasArrow: false },
      { name: "New Arrivals", href: "/shop/casual", hasArrow: false },
      { name: "Brands", href: "/", hasArrow: false },
    ],
    [],
  );

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(
        getCartItems().reduce((total, item) => total + Number(item.qty || 1), 0),
      );
    };

    window.addEventListener(CART_CHANGED_EVENT, syncCartCount);
    return () => window.removeEventListener(CART_CHANGED_EVENT, syncCartCount);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    navigate(`/shop/casual${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <>
      <div className="bg-black py-2 text-center text-xs text-white sm:text-sm">
        Sign up and get 20% off your first order.{" "}
        <Link to="/shop/casual" className="font-medium underline">
          Shop Now
        </Link>
      </div>
      <header className="relative py-[20px] xl:py-[24px]">
        <div className="container">
          <div className="flex items-center justify-between gap-[12px]">
            <div className="flex items-center gap-[12px]">
              {/* Open Header Menu navigation */}
              <button onClick={() => setIsOpen(true)} className="block xl:hidden">
                <img src={menuIcon} alt="Menu" />
              </button>

              <Link to="/" className="shrink-0">
                <img src={logo} alt="Logo" className="w-[120px] xl:w-[160px]" />
              </Link>
            </div>

            {/* Navigation start */}
            <nav className="hidden xl:block">
              <ul className="flex items-center gap-[24px]">
                {navLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="flex items-center gap-[4px] transition-colors hover:text-gray-600"
                    >
                      {link.name}
                      {link.hasArrow && <img src={arrow} alt="" className="" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Navigation finnish */}

            {/* Header Right start */}
            <div className="flex-center gap-[40px]">
              <form
                onSubmit={handleSearch}
                className="hidden h-[48px] items-center rounded-full border border-transparent bg-[#F0F0F0] px-[16px] transition-all focus-within:border-black focus-within:ring-[0.1px] focus-within:ring-black md:flex xl:w-[575px]"
              >
                <img src={searchIcon} alt="search" className="opacity-40" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for products..."
                  className="mx-[12px] h-full w-full cursor-pointer border-none bg-transparent p-0 outline-none"
                />
              </form>

              <div className="flex items-center gap-[12px] xl:gap-[14px]">
                <button className="md:hidden" onClick={() => navigate("/shop/casual")}>
                  <img src={searchIcon} alt="search" />
                </button>
                <Link to="/cart" className="relative">
                  <img src={bagsIcon} alt="cart" />
                  {cartCount > 0 ? (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
                <button
                  onClick={() => navigate("/admin")}
                  className=""
                  title="Admin Panel"
                >
                  <img src={userIcon} alt="admin" />
                </button>
              </div>
            </div>
          </div>

          {/* Header Right finnish */}
        </div>

        {/* Header menu openned func */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />

        <div
          className={`fixed left-0 top-0 z-50 h-full w-[280px] bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="mb-8 flex items-center justify-between">
            <img src={logo} alt="Logo" className="w-[100px]" />
            <button onClick={() => setIsOpen(false)}>
              <img src={closeIcon || menuIcon} alt="Close" className="" />{" "}
            </button>
          </div>

          <ul className="flex flex-col gap-6">
            {navLinks.map((link, index) => (
              <li key={index} onClick={() => setIsOpen(false)}>
                <Link
                  to={link.href}
                  className="flex items-center justify-between text-lg font-medium"
                >
                  {link.name}
                  {link.hasArrow && <img src={arrow} alt="" className="" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Header menu openned func */}
      </header>
    </>
  );
}

export default Header;
