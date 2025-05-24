"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { getUser, signOut } from "@/lib/supabase";
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

    // Initial check for scroll position
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Disable body scroll when mobile menu is open
  useEffect(() => {
    const handleBodyScroll = () => {
      if (mobileMenuOpen) {
        // Lock scrolling
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
      } else {
        // Unlock scrolling and restore position
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
        }
      }
    };
    
    handleBodyScroll();
    
    return () => {
      // Cleanup when component unmounts
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [mobileMenuOpen]);

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
        "fixed w-full z-[1000] transition-all duration-300 py-4", // Added py-4 here for consistent padding
        isScrolled || mobileMenuOpen
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md"
          : "bg-background" // Changed from bg-transparent
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex lg:hidden z-[1000]">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex lg:flex-1 mx-auto lg:mx-0"
          >
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">AI Humanizer</span>
              <div className="flex items-center gap-2">
                <PenLine className="h-8 w-8 text-[#4A90E2]" />
                <span className="font-bold text-xl">AI Humanizer</span>
              </div>
            </Link>
          </motion.div>
          <div className="w-10 lg:hidden"></div> {/* This creates balance on the right side */}
        </div>
        <div className="hidden lg:flex lg:gap-x-12 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
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
                try {
                  await signOut();
                  setUser(null);
                  window.location.href = '/';
                } catch (error) {
                  console.error('Sign out error:', error);
                }
              }}
            >
              Sign Out
            </Button>
          )}
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[999] bg-white dark:bg-gray-900" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', overflowY: 'auto' }}>
          <div className="min-h-screen flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="invisible">
                {/* This creates balance */}
                <X className="h-6 w-6" aria-hidden="true" />
              </div>
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
            <div className="flex-1 px-6 py-10">
              <div className="space-y-6">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block rounded-lg px-3 py-4 text-lg font-semibold leading-7 text-center",
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
              <div className="mt-10">
                {!isLoading && !user && (
                  <Button 
                    asChild 
                    className="w-full bg-[#4A90E2] hover:bg-[#3A80D2] py-6 text-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/auth?signup=true">
                      Get Started
                    </Link>
                  </Button>
                )}
                {!isLoading && user && (
                  <Button 
                    variant="outline" 
                    className="w-full border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white py-6 text-lg"
                    onClick={async () => {
                      try {
                        await signOut();
                        setUser(null);
                        setMobileMenuOpen(false);
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Sign out error:', error);
                      }
                    }}
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}