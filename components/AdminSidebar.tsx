'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingBag, Users, Settings, Home, X, ExternalLink, Mail } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  { href: '/admin/products',  icon: Package,    label: 'Products' },
  { href: '/admin/orders',    icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/customers', icon: Users,       label: 'Customers' },
  { href: '/admin/subscribers', icon: Mail,        label: 'Subscribers' },
  { href: '/admin/settings',    icon: Settings,    label: 'Settings' },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <Logo width={62} height={20} />
          <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 px-3 mb-2">Menu</p>
          {LINKS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-200">
          <Link href="/" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
            <Home className="w-4 h-4 shrink-0" />
            View Store
            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
          </Link>
          <p className="text-[10px] text-gray-400 px-3 pt-3">Eppa&apos;s Shop Admin</p>
        </div>
      </aside>
    </>
  );
}
