import Link from "next/link";
import { PenLine, GithubIcon, TwitterIcon, InstagramIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="https://github.com" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <span className="sr-only">GitHub</span>
            <GithubIcon className="h-6 w-6" aria-hidden="true" />
          </Link>
          <Link href="https://twitter.com" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <span className="sr-only">Twitter</span>
            <TwitterIcon className="h-6 w-6" aria-hidden="true" />
          </Link>
          <Link href="https://instagram.com" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <span className="sr-only">Instagram</span>
            <InstagramIcon className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <PenLine className="h-6 w-6 text-[#4A90E2]" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">AI Humanizer</span>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 mb-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
              Home
            </Link>
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
              Contact
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
              Terms of Service
            </Link>
          </nav>
          <p className="text-center md:text-left text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AI Humanizer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}