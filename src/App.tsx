import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/theme-provider";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import RefreshTransition from "@/pages/RefreshTransition";
import LoaderMockups from "@/pages/LoaderMockups";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/refresh" element={<RefreshTransition />} />
          <Route path="/mockups" element={<LoaderMockups />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
