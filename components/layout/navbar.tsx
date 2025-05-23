"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { getUser } from "@/lib/supabase";
import { motion, useScroll } from "framer-motion";

interface NavItem {
  name: string;
  href: string;
  protected?: boolean;
  guest?: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const { scrollY } = useScroll();

  const navigation: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/pricing" },
    { name: "Dashboard", href: "/dashboard", protected: true },
    { name: "Contact", href: "/contact" },
    { name: "Login", href: "/auth", guest: true },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    
    checkUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredNavigation = navigation.filter(item => {
    if (item.protected && !user) return false;
    if (item.guest && user) return false;
    return true;
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md py-4"
          : "bg-transparent py-6"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Global">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex lg:flex-1"
        >
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">AI Humanizer</span>
            <div className="flex items-center gap-2">
              <PenLine className="h-8 w-8 text-[#4A90E2]" />
              <span className="font-bold text-xl hidden sm:block">AI Humanizer</span>
            </div>
          </Link>
        </motion.div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-semibold leading-6 transition-colors duration-200",
                pathname === item.href
                  ? "text-[#4A90E2] dark:text-[#4A90E2]"
                  : "text-gray-700 dark:text-gray-200 hover:text-[#4A90E2] dark:hover:text-[#4A90E2]"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {!isLoading && !user && (
            <Button asChild className="bg-[#4A90E2] hover:bg-[#3A80D2]">
              <Link href="/auth?signup=true">
                Get Started
              </Link>
            </Button>
          )}
          {!isLoading && user && (
            <Button 
              variant="outline" 
              className="border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white"
              onClick={async () => {
                await fetch('/api/auth/signout', {
                  method: 'POST',
                });
                window.location.href = '/';
              }}
            >
              Sign Out
            </Button>
          )}
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900">
          <div className="fixed inset-0 flex">
            <div className="relative flex w-full max-w-sm flex-1 flex-col overflow-y-auto bg-white dark:bg-gray-900 pt-6 pb-4">
              <div className="flex items-center justify-between px-6">
                <Link href="/" className="-m-1.5 p-1.5">
                  <span className="sr-only">AI Humanizer</span>
                  <div className="flex items-center gap-2">
                    <PenLine className="h-8 w-8 text-[#4A90E2]" />
                    <span className="font-bold text-xl">AI Humanizer</span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-8 flow-root">
                <div className="space-y-2 py-6 px-6">
                  {filteredNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7",
                        pathname === item.href
                          ? "text-[#4A90E2] dark:text-[#4A90E2]"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 px-6">
                  {!isLoading && !user && (
                    <Button 
                      asChild 
                      className="w-full bg-[#4A90E2] hover:bg-[#3A80D2]"
                    >
                      <Link href="/auth?signup=true">
                        Get Started
                      </Link>
                    </Button>
                  )}
                  {!isLoading && user && (
                    <Button 
                      variant="outline" 
                      className="w-full border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white"
                      onClick={async () => {
                        await fetch('/api/auth/signout', {
                          method: 'POST',
                        });
                        window.location.href = '/';
                      }}
                    >
                      Sign Out
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}