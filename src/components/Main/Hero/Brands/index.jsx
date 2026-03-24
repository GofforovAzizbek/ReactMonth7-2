// brand logos
import versage from "../../../../assets/icons/versage.svg";
import zara from "../../../../assets/icons/zara.svg";
import gucci from "../../../../assets/icons/gucci.svg";
import prada from "../../../../assets/icons/prada.svg";
import calvin from "../../../../assets/icons/calvin.svg";

function Brands() {
  return (
    <>
      <section className="max-w-[1440px] w-full mx-auto bg-black">
        <div className="container flex-center flex-wrap justify-center py-[40px] gap-[32px] md:gap-[106px]">
          <a href="#" className="">
            <img src={versage} className="" />
          </a>
          <a href="#" className="">
            <img src={zara} className="" />
          </a>
          <a href="#" className="">
            <img src={gucci} className="" />
          </a>
          <a href="#" className="">
            <img src={prada} className="" />
          </a>
          <a href="#" className="">
            <img src={calvin} className="" />
          </a>
        </div>
      </section>
    </>
  );
}

export default Brands;
