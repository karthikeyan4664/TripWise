'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Explore', href: '/' },
  { label: 'My Trip', href: '/my-trip' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E1D7] bg-[#F8F5EF]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] rounded-lg p-1 -ml-1 transition-opacity"
          aria-label="TripWise Home"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[#193B2C] text-white shadow-xs transition-transform group-hover:scale-105">
            <Compass className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </div>
          <span className="font-semibold text-base sm:text-lg tracking-tight text-[#242823]">
            TripWise
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1.5"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] ${
                  isActive
                    ? 'text-[#193B2C] bg-[#193B2C]/10 font-semibold'
                    : 'text-[#6C7069] hover:text-[#242823] hover:bg-[#E8E1D7]/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#6C7069] hover:text-[#242823] hover:bg-[#E8E1D7]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C]"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-menu"
          className="md:hidden border-t border-[#E8E1D7] bg-[#F8F5EF] px-4 pt-3 pb-4 space-y-1.5 shadow-sm"
          aria-label="Mobile Navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] ${
                  isActive
                    ? 'text-[#193B2C] bg-[#193B2C]/10 font-semibold'
                    : 'text-[#6C7069] hover:text-[#242823] hover:bg-[#E8E1D7]/40'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
