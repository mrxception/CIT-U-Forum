"use client"

import { useEffect } from "react";

export default function Custom404({ errorType = "notFound" }) {
  useEffect(() => {
    document.title = errorType === "notFound" ? "404 - Page Not Found | CIT-U Forum" : "Error | CIT-U Forum";
  }, [errorType]);

  const isNotFound = errorType === "notFound";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col text-gray-900 border border-gray-300">
      <div className="text-center animate-fadeIn">
        <div className="text-6xl font-bold mb-4 flex items-center justify-center">
          <span className="mr-4">{isNotFound ? "404" : "Error"}</span>
          <div className="animate-spin-slow w-12 h-12 border-4 border-gray-300 border-t-red-600 rounded-full"></div>
        </div>
        <h1 className="text-3xl font-semibold mb-2">
          {isNotFound ? "Page Not Found" : "Something Went Wrong"}
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          {isNotFound
            ? "Oops! It seems the page you’re looking for doesn’t exist or has been moved."
            : "We’re sorry, but the server encountered an issue. Please try again later or contact support."}
        </p>
        <a href="/" className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors duration-300">
          Return to Home
        </a>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out;
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spinSlow 2s linear infinite;
        }
      `}</style>
    </div>
  );
}