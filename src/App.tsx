import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/theme-provider";
import Home from "@/pages/Home";

const NotFound = lazy(() => import("@/pages/NotFound"));
const RefreshTransition = lazy(() => import("@/pages/RefreshTransition"));
const LoaderMockups = lazy(() => import("@/pages/LoaderMockups"));

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/refresh" element={<RefreshTransition />} />
            <Route path="/mockups" element={<LoaderMockups />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
