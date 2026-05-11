'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/discover', label: 'Discover' },
];

export function NavBar() {
  const path = usePathname();
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold text-white">Spend</span>
          <span className="text-xl font-bold text-blue-400">Max</span>
          <span className="ml-2 text-[10px] font-semibold text-slate-500 tracking-widest uppercase">v2.0</span>
        </div>
        <div className="flex items-center gap-1">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                path === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
