"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Globe,
  Plane,
  BookOpen,
  Users,
  Award,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUserInfo, setAccessToken } = useAppContext();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const formData = new FormData();
      formData.append("email", credentials.email);
      formData.append("password", credentials.password);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        localStorage.setItem("accessToken", data.data.access_token);
        localStorage.setItem("actUser", JSON.stringify(data.data.user));
        setAccessToken(data.data.access_token);
        setUserInfo(data.data.user);
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
    // window.location.href = "/dashboard";
  };

  // Floating icons configuration
  const leftIcons = [
    { Icon: GraduationCap, delay: 0 },
    { Icon: BookOpen, delay: 0.2 },
    { Icon: Award, delay: 0.4 },
  ];

  const rightIcons = [
    { Icon: Globe, delay: 0.1 },
    { Icon: Plane, delay: 0.3 },
    { Icon: Users, delay: 0.5 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-[#1a3a6b] to-secondary p-4 overflow-hidden relative">
      {/* Animated Background Circles */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="w-full mx-auto grid lg:grid-cols-3 gap-8 items-center relative z-10">
        {/* Left Side - Animated Icons */}
        <div className="hidden lg:flex flex-col gap-8 items-center justify-center">
          {leftIcons.map(({ Icon, delay }, index) => (
            <motion.div
              key={index}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: delay,
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
            >
              <motion.div
                className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  y: {
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Center - Login Form */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-sm">
            {/* Logo and Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                className="mb-4 inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-9 h-9 text-white" strokeWidth={2} />
                </div>
                <h1 className="text-primary text-3xl font-bold mb-2">ACT</h1>
                <p className="text-secondary text-sm font-medium">
                  Education & Visa Consultants
                </p>
              </motion.div>
              <p className="text-text-secondary text-sm mt-4">
                Sign in to access your account
              </p>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@agency.com"
                    className="w-full pl-11 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text placeholder:text-[#9CA3AF]"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text placeholder:text-[#9CA3AF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-text-secondary group-hover:text-text transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-primary hover:text-secondary transition-colors font-medium"
                >
                  Forgot password?
                </a>
              </motion.div>

              {/* Error Message */}
              {loginMutation.isError && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#FEE2E2] border border-[#F85555] text-[#F85555] px-4 py-3 rounded-lg text-sm"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>
                      {loginMutation.error?.message || "Invalid email or password"}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loginMutation.isPending}
                className="cursor-pointer w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-text-secondary">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-primary hover:text-secondary font-medium transition-colors"
                >
                  Contact Administrator
                </a>
              </p>
            </motion.div>
          </div>

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white text-sm mt-6"
          >
            © {new Date().getFullYear()} ACT Education & Visa Consultants. All
            rights reserved.
          </motion.p>
        </motion.div>

        {/* Right Side - Animated Icons */}
        <div className="hidden lg:flex flex-col gap-8 items-center justify-center">
          {rightIcons.map(({ Icon, delay }, index) => (
            <motion.div
              key={index}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: delay,
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
            >
              <motion.div
                className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                whileHover={{ scale: 1.1, rotate: -5 }}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  y: {
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Floating Icons Background */}
      <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-5"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <GraduationCap className="w-8 h-8 text-white/20" />
        </motion.div>
        <motion.div
          className="absolute top-32 right-8"
          animate={{
            y: [0, -12, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Globe className="w-10 h-10 text-white/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-8"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Plane className="w-9 h-9 text-white/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-5"
          animate={{
            y: [0, -18, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Award className="w-7 h-7 text-white/20" />
        </motion.div>
      </div>
    </div>
  );
}