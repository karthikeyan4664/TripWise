import Link from 'next/link';
import { Compass } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E1D7] bg-[#F8F5EF] transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#193B2C] text-white">
                <Compass className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-semibold text-base tracking-tight text-[#242823]">
                TripWise
              </span>
            </div>
            <p className="text-xs text-[#6C7069] max-w-sm mt-1">
              An editorial travel planner engineered for seamless exploration and thoughtful journeys.
            </p>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex items-center gap-6 text-sm text-[#6C7069]" aria-label="Footer Navigation">
            <Link
              href="/"
              className="hover:text-[#193B2C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] rounded-sm"
            >
              Explore
            </Link>
            <Link
              href="/my-trip"
              className="hover:text-[#193B2C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] rounded-sm"
            >
              My Trip
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-[#E8E1D7]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6C7069]">
          <p>&copy; 2026 TripWise. All rights reserved.</p>
          <p className="text-[11px]">Curated regional intelligence and travel planning.</p>
        </div>
      </div>
    </footer>
  );
}
