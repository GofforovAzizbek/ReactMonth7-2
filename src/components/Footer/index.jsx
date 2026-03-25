function Footer() {
  const footerColumns = [
    {
      title: "COMPANY",
      links: ["About", "Features", "Works", "Career"],
    },
    {
      title: "HELP",
      links: ["Customer Support", "Delivery Details", "Terms & Conditions", "Privacy Policy"],
    },
    {
      title: "FAQ",
      links: ["Account", "Manage Deliveries", "Orders", "Payments"],
    },
    {
      title: "RESOURCES",
      links: ["Free eBooks", "Development Tutorial", "How to - Blog", "Youtube Playlist"],
    },
  ];

  const paymentBadges = ["VISA", "Mastercard", "PayPal", "Apple Pay", "G Pay"];

  return (
    <footer className="mt-16 bg-[#f0f0f0] pt-24 pb-8 sm:pt-28">
      <div className="container">
        <div className="-mt-40 mb-10 grid items-center gap-6 rounded-3xl bg-black px-5 py-7 sm:mb-14 sm:px-12 sm:py-9 lg:grid-cols-2">
          <h3 className="max-w-[620px] text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
            Stay upto date about our latest offers
          </h3>

          <div className="space-y-3">
            <div className="flex h-12 items-center gap-2 rounded-full bg-white px-4">
              <span className="text-gray-400">✉</span>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button className="h-12 w-full rounded-full bg-white font-medium text-black transition hover:bg-gray-100">
              Subscribe to Newsletter
            </button>
          </div>
        </div>

        <div className="grid gap-8 border-b border-gray-300 pb-8 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <h2 className="mb-4 text-[42px] font-black leading-none">SHOP.CO</h2>
            <p className="mb-5 max-w-[260px] text-sm text-gray-600">
              We have clothes that suits your style and which you&apos;re proud to
              wear. From women to men.
            </p>
            <div className="flex gap-3">
              {["𝕏", "f", "◎", "◍"].map((icon) => (
                <button
                  key={icon}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-sm transition hover:border-black"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:col-span-4 lg:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-semibold tracking-[0.2em]">{col.title}</h4>
                <ul className="space-y-2.5 text-gray-600">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-black transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-5 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>Shop.co © 2000-2023, All Rights Reserved</p>
          <div className="flex flex-wrap gap-2">
            {paymentBadges.map((item) => (
              <span
                key={item}
                className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
