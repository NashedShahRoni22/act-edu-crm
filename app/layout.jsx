import "./globals.css";
import { AppProvider } from "@/context/context";
import QueryProvider from "@/providers/QueryProvider";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "ACT CRM",
  description: "Education & Visa Consultants Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <QueryProvider>
          <AppProvider>
            {children}
          </AppProvider>
          <Toaster/>
        </QueryProvider>
      </body>
    </html>
  );
}