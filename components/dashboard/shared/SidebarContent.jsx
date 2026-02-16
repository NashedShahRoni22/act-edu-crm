import { motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { menuItems } from "./MenuItems";
import Link from "next/link";

export default function SidebarContent({
  expandedItems,
  toggleSubmenu,
  onClose,
  isMobile,
  pathname,
}) {
  return (
    <>
      {/* Logo Section */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ACT</span>
          </div>
          <div>
            <h1 className="text-primary font-bold text-sm leading-tight">
              ACT
            </h1>
            <p className="text-[10px] text-gray-500 leading-tight">
              Education & Visa
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <motion.li key={index} whileHover={{ x: 4 }}>
              {item.hasSubmenu ? (
                // Button for submenu items
                <button
                  onClick={() => toggleSubmenu(index)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full ${
                    pathname === item.path
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      pathname === item.path ? "text-white" : "text-gray-600"
                    }`}
                    strokeWidth={1.5}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  <motion.div
                    animate={{
                      rotate: expandedItems.includes(index) ? 90 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </button>
              ) : (
                // Link for regular items
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.path
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      pathname === item.path ? "text-white" : "text-gray-600"
                    }`}
                    strokeWidth={1.5}
                  />
                  <span className="flex-1">{item.label}</span>
                </Link>
              )}

              {/* Submenu */}
              {item.hasSubmenu && expandedItems.includes(index) && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-8 mt-1 space-y-1"
                >
                  <li>
                    <Link
                      href="/settings/account"
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Account Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings/users"
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      User Management
                    </Link>
                  </li>
                </motion.ul>
              )}
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-medium text-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Admin User
            </p>
            <p className="text-xs text-gray-500 truncate">admin@act.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
