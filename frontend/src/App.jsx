import React, { useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import LandingPage from "./LandingPage";
import SignupPage from "./SignupPage";
import Dashboard from "./Dashboard";

/**
 * PageWrapper component for smooth route transitions using GSAP.
 */
function PageWrapper({ children }) {
  const containerRef = useRef();
  
  useGSAP(() => {
    gsap.from(containerRef.current, { 
      opacity: 0, 
      y: 20, 
      duration: 0.4, 
      ease: "power2.out" 
    });
  }, { scope: containerRef });

  return <div ref={containerRef}>{children}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><LandingPage /></PageWrapper>} />
      </Routes>
    </BrowserRouter>
  );
}
