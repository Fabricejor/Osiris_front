"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  FileScan,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  Library,
  Download,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
};

const mainNavItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-white',
    iconBg: 'bg-white/20',
  },
  {
    name: 'Data Validation',
    href: '/dashboard/data-validation',
    icon: CheckSquare,
    color: 'text-emerald-300',
    iconBg: 'bg-emerald-400/20',
  },
  {
    name: 'OCR Processing',
    href: '/dashboard/ocr-processing',
    icon: FileScan,
    color: 'text-sky-300',
    iconBg: 'bg-sky-400/20',
  },
  // {
  //   name: 'Patient Record',
  //   href: '/dashboard/patient-record',
  //   icon: FolderOpen,
  //   color: 'text-violet-300',
  //   iconBg: 'bg-violet-400/20',
  // },
  // {
  //   name: 'Operator Performance',
  //   href: '/dashboard/operator-performance',
  //   icon: Activity,
  //   color: 'text-rose-300',
  //   iconBg: 'bg-rose-400/20',
  // },
];

const secondaryNavItems: NavItem[] = [
  // {
  //   name: 'Data Export',
  //   href: '/dashboard/data-export',
  //   icon: Download,
  //   color: 'text-amber-300',
  //   iconBg: 'bg-amber-400/20',
  // },
  // {
  //   name: 'Reports',
  //   href: '/dashboard/reports',
  //   icon: BarChart3,
  //   color: 'text-cyan-300',
  //   iconBg: 'bg-cyan-400/20',
  // },
  {
    name: 'Activity Log',
    href: '/dashboard/activity-log',
    icon: History,
    color: 'text-orange-300',
    iconBg: 'bg-orange-400/20',
  },
];

const adminNavItems: NavItem[] = [
  {
    name: 'Users',
    href: '/dashboard/admin/users',
    icon: Users,
    color: 'text-indigo-300',
    iconBg: 'bg-indigo-400/20',
  },
  {
    name: 'Structures',
    href: '/dashboard/admin/structures',
    icon: Building2,
    color: 'text-pink-300',
    iconBg: 'bg-pink-400/20',
  },
  {
    name: 'Catalogues',
    href: '/dashboard/admin/catalogues',
    icon: Library,
    color: 'text-yellow-300',
    iconBg: 'bg-yellow-400/20',
  },
  {
    name: 'Data Export',
    href: '/dashboard/admin/exports',
    icon: Download,
    color: 'text-amber-300',
    iconBg: 'bg-amber-400/20',
  },
];

const bottomNavItems: NavItem[] = [
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'text-slate-300',
    iconBg: 'bg-slate-400/20',
  },
];

const sidebarVariants = {
  open: { width: 256 },
  closed: { width: 72 },
};

const labelVariants = {
  open: { opacity: 1, x: 0, display: 'block' },
  closed: { opacity: 0, x: -10, transitionEnd: { display: 'none' } },
};

const logoTextVariants = {
  open: { opacity: 1, x: 0, display: 'block' },
  closed: { opacity: 0, x: -15, transitionEnd: { display: 'none' } },
};

function NavLink({
  item,
  isCollapsed,
  isActive,
}: Readonly<{
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}>) {
  const linkContent = (
    <Link
      href={item.href}
      className="relative group flex items-center w-full"
    >
      <div
        className={cn(
          'relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          isActive
            ? 'text-white'
            : 'text-white/65 hover:text-white hover:bg-white/8'
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 8px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)',
            }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          />
        )}

        {/* Icon wrapper */}
        <div
          className={cn(
            'relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0',
            isActive ? item.iconBg : 'group-hover:' + item.iconBg.replace('bg-', 'bg-')
          )}
        >
          <item.icon
            className={cn(
              'w-4 h-4 transition-all duration-200 shrink-0',
              isActive ? item.color : cn('text-white/50 group-hover:' + item.color.replace('text-', 'text-'))
            )}
          />
        </div>

        {/* Label */}
        <motion.span
          variants={labelVariants}
          animate={isCollapsed ? 'closed' : 'open'}
          transition={{ duration: 0.2 }}
          className="relative z-10 whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {item.name}
        </motion.span>
      </div>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          {linkContent}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={12}
            className="bg-[#054e38] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl z-100 whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {item.name}
            <Tooltip.Arrow className="fill-[#054e38]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return linkContent;
}

function SectionLabel({ label, isCollapsed }: Readonly<{ label: string; isCollapsed: boolean }>) {
  return (
    <AnimatePresence>
      {!isCollapsed && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/35 overflow-hidden"
        >
          {label}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Tooltip.Provider delayDuration={0} skipDelayDuration={300}>
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'closed' : 'open'}
      transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
      className="relative h-screen shrink-0 flex flex-col z-50"
      style={{
        background: 'linear-gradient(180deg, #08704F 0%, #065c41 60%, #054e38 100%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Ambient glow top */}
      <div className="absolute top-0 left-0 w-full h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 40% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)' }}
      />

      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[72px] z-50 w-6 h-6 rounded-full bg-[#08704F] border border-white/20 flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-[#065c41] hover:scale-110"
        aria-label={isCollapsed ? 'Ouvrir la sidebar' : 'Fermer la sidebar'}
      >
        {isCollapsed
          ? <ChevronRight className="w-3 h-3 text-white" />
          : <ChevronLeft className="w-3 h-3 text-white" />
        }
      </button>

      {/* Header */}
      <div className={cn(' flex items-center h-[68px] px-4 shrink-0', isCollapsed ? 'justify-center' : 'justify-center mt-2')}>
        {isCollapsed ? (
          <div className="bg-white rounded-lg shadow-md flex items-center justify-center p-1">
            <Image
              src="/images/Osiris Icon.PNG"
              alt="OSIRIS Icon"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md flex items-center justify-center px-4 py-2">
            <Image
              src="/images/Osiris  icon+text.PNG"
              alt="OSIRIS Logo"
              width={140}
              height={40}
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10 shrink-0" />

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5" style={{ scrollbarWidth: 'none' }}>

        <SectionLabel label="Core" isCollapsed={isCollapsed} />
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={pathname === item.href}
          />
        ))}

        <SectionLabel label="Analytics" isCollapsed={isCollapsed} />
        {secondaryNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={pathname === item.href}
          />
        ))}

        <SectionLabel label="Administration" isCollapsed={isCollapsed} />
        {adminNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0">
        <div className="mx-4 h-px bg-white/10" />
        <div className="px-3 py-3 space-y-0.5">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        {/* Footer */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-5 py-3"
            >
              <p className="text-[10px] text-white/25 tracking-widest uppercase text-center">
                © 2025 APHRC
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
    </Tooltip.Provider>
  );
}
