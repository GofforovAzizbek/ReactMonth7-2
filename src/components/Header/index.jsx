import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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

// ⚠️ MUHIM: Bu komponent App.jsx da Routes dan tashqarida render qilingan
// Shuning uchun sahifa almashinishda qayta yuklanmaydi va state saqlanib qoladi
function Header() {
  // Header Navigation map links
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Shop", href: "/", hasArrow: true },
    { name: "On Sale", href: "/shop/casual", hasArrow: false },
    { name: "New Arrivals", href: "/shop/casual", hasArrow: false },
    { name: "Brands", href: "/", hasArrow: false },
  ];

  return (
    // Header Start
    <header className="py-[20px] xl:py-[24px] relative">
      <div className="container">
        <div className="flex items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[12px]">
            {/* Open Header Menu navigation */}
            <button onClick={() => setIsOpen(true)} className="xl:hidden block">
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
                    className="flex items-center gap-[4px] hover:text-gray-600 transition-colors"
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
            <div className="hidden md:flex items-center xl:w-[575px] h-[48px] px-[16px] bg-[#F0F0F0] rounded-full cursor-pointer transition-all border border-transparent focus-within:border-black focus-within:ring-[0.1px] focus-within:ring-black">
              <img src={searchIcon} alt="search" className="opacity-40" />
              <input
                type="text"
                placeholder="Search for products..."
                className="mx-[12px] p-0 w-full h-full bg-transparent outline-none border-none opacity-[0.4] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-[12px] xl:gap-[14px]">
              <button className="md:hidden">
                <img src={searchIcon} alt="search" />
              </button>
              <Link to="/cart">
                <img src={bagsIcon} alt="cart" />
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
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-50 p-6 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-8">
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
                className="text-lg font-medium flex items-center justify-between"
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
  );
}

export default Header;
