import { Link } from "react-router-dom";
// Brands
import Brands from "./Brands";

import HeroBanner from "../../../assets/images/HeroBanner.png";
import HeroBannerMobile from "../../../assets/images/HeroBannerMobile.png";

function Hero() {
  const stats = [
    { value: "200+", label: "International Brands" },
    { value: "2,000+", label: "High-Quality Products" },
    { value: "30,000+", label: "Happy Customers" },
  ];

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1440px] overflow-hidden bg-[#F2F0F1]">
        <div className="flex flex-col items-center md:block">
          {/* Hero Description */}
          <div className="container md:absolute md:inset-0">
            <div className="max-w-[595px] w-full flex animate-page-in flex-col items-start gap-[24px] pt-[64px] pb-[40px] xl:gap-[32px] md:pt-[100px] md:pb-[120px]">
              <h1
                className="font-bold 
              text-[36px] leading-[36px] 
              md:text-[64px] md:leading-[64px] 
              uppercase"
              >
                FIND CLOTHES THAT MATCHES YOUR STYLE
              </h1>

              <p
                className="font-normal 
              text-[14px] md:text-base 
              leading-[20px] md:leading-[22px] 
              text-black/60"
              >
                Browse through our diverse range of meticulously crafted
                garments, designed to bring out your individuality and cater to
                your sense of style.
              </p>

              <Link
                to="/shop/casual"
                className="bg-black text-white font-medium 
              text-[14px] md:text-base px-[67px] py-[15px] 
              rounded-full hover:bg-black/80 transition-all mb-[16px] w-full md:w-auto text-center"
              >
                Shop Now
              </Link>

              <div className="flex flex-wrap justify-center md:justify-start mx-auto md:mx-0 md:flex-nowrap">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="
                    px-[22px] md:px-[32px]
                    mb-[16px] md:mb-0
                    first:pl-0 last:pr-0
                    border-r border-black/10 last:border-none
                  "
                  >
                    <h2
                      className="font-bold 
                    text-[24px] md:text-[40px] 
                    leading-none text-black"
                    >
                      {stat.value}
                    </h2>
                    <p
                      className="font-normal 
                    text-[12px] md:text-base 
                    leading-[18px] md:leading-[22px] 
                    text-black/60 mt-[5px]"
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="w-full">
            <img
              src={HeroBannerMobile}
              alt="Hero Mobile"
              className="block w-full md:hidden"
            />
            <img
              src={HeroBanner}
              alt="Hero Banner"
              className="hidden w-full md:block"
            />
          </div>
        </div>
      </section>

      <Brands />
    </>
  );
}

export default Hero;
