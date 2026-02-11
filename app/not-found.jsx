"use client";

import { motion } from "framer-motion";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* 404 Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#3B4CB8]/20 blur-3xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-[#3B4CB8] to-[#1FB3C8] w-32 h-32 rounded-full flex items-center justify-center">
                <AlertCircle className="w-16 h-16 text-white" strokeWidth={2} />
              </div>
            </div>
          </motion.div>

          {/* 404 Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3B4CB8] via-[#1FB3C8] to-[#2DD4BF] mb-4">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist. It might have been
              moved or deleted.
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse"></div>
              <p className="text-gray-300 text-sm">
                Redirecting to home in{" "}
                <span className="font-bold text-[#2DD4BF]">{countdown}</span>{" "}
                seconds
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#3B4CB8] to-[#1FB3C8] text-white rounded-xl text-base font-semibold hover:shadow-lg hover:shadow-[#3B4CB8]/50 transition-all"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-base font-semibold hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </motion.button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}