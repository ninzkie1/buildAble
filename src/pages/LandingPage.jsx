import React from "react";
import Footer from "../components/Footer";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-8">
          {/* Left Side - Text Placeholder */}
          <div className="md:w-1/2">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Welcome to buildAble
            </h1>
            <p className="mt-4 text-sm md:text-base text-blue-100 max-w-xl">
              Your go-to place for tools, hardware, and innovation.
            </p>
          </div>

          {/* Right Side - Placeholder for future image/banner */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md bg-white/5 rounded-xl p-4 h-64 md:h-80 flex items-center justify-center text-white/70 border border-white/20">
              <p>Image or banner here</p>
            </div>
          </div>
        </div>
      </header>

      {/* Placeholder Sections for Future Backend Data */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <p className="text-gray-500">Coming soon...</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Popular Products</h2>
        <p className="text-gray-500">Products will be displayed here once connected to backend.</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Customer Testimonials</h2>
        <p className="text-gray-500">This section will display user feedback from the backend.</p>
      </section>

    

      <Footer />
    </div>
  );
};

export default LandingPage;
