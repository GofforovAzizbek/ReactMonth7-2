// import Header from "./components/Header";
// import Main from "./components/Main";
// import Cart from "./components/Cart";

// function App() {
//   return (
//     <>
//       {/* Header */}
//       <Header />
//       {/* Main */}
//       <Main />
//       <Cart />
//     </>
//   );
// }

// export default App;

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Cart from "./components/Cart";
// import ProductDetail from "./pages/ProductDetail";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Cart />} />
//         <Route path="/product/:id" element={<ProductDetail />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Cart from "./components/Cart";
import ProductDetail from "./pages/ProductDetail";
import Header from "./components/Header";
import Main from "./components/Main";

function AppContent() {
  const location = useLocation();

  // Faqat home page da yuqori hero section ko'rinadi
  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* Header barcha sahifalarda ko'rinadi va qayta yuklanmaydi */}
      <Header />

      {/* Hero va brend seksiyasi faqat home page da */}
      {isHomePage && <Main />}

      {/* Router - sahifalar almashinishi */}
      <Routes>
        <Route path="/" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
