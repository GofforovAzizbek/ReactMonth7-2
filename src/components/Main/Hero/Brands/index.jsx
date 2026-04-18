// brand logos
import versage from "../../../../assets/icons/versage.svg";
import zara from "../../../../assets/icons/zara.svg";
import gucci from "../../../../assets/icons/gucci.svg";
import prada from "../../../../assets/icons/prada.svg";
import calvin from "../../../../assets/icons/calvin.svg";

function Brands() {
  return (
    <section className="mx-auto w-full max-w-[1440px] bg-black">
      <div className="container flex-center flex-wrap justify-center gap-[34px] py-[40px] md:gap-[90px]">
        <a href="#" className="opacity-95 transition hover:opacity-100">
          <img src={versage} alt="Versace" />
        </a>
        <a href="#" className="opacity-95 transition hover:opacity-100">
          <img src={zara} alt="Zara" />
        </a>
        <a href="#" className="opacity-95 transition hover:opacity-100">
          <img src={gucci} alt="Gucci" />
        </a>
        <a href="#" className="opacity-95 transition hover:opacity-100">
          <img src={prada} alt="Prada" />
        </a>
        <a href="#" className="opacity-95 transition hover:opacity-100">
          <img src={calvin} alt="Calvin Klein" />
        </a>
      </div>
    </section>
  );
}

export default Brands;
