'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { XIcon, HomeIcon, CalendarIcon, TrophyIcon, UserIcon, TargetIcon, ChartBarIcon, UsersIcon } from '@/components/ui/icons';
import { NavItem } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: 'home',
    description: 'Overview and quick stats'
  },
  {
    title: 'Fixtures',
    href: '/fixtures',
    icon: 'calendar',
    description: 'View upcoming matches and results'
  },
  {
    title: 'My Predictions',
    href: '/predictions',
    icon: 'target',
    description: 'Make and manage your predictions'
  },
  {
    title: 'Results',
    href: '/results',
    icon: 'chart',
    description: 'View results and points earned'
  },
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    icon: 'trophy',
    description: 'Rankings and top performers'
  },
  // Hidden for now - keeping components but removing from navigation
  // {
  //   title: 'Analytics',
  //   href: '/analytics',
  //   icon: 'chart',
  //   description: 'Advanced performance insights'
  // },
  // {
  //   title: 'Friends',
  //   href: '/friends',
  //   icon: 'users',
  //   description: 'Connect with other predictors'
  // },
  // {
  //   title: 'Leagues',
  //   href: '/leagues',
  //   icon: 'trophy',
  //   description: 'Private leagues and competitions'
  // },
  {
    title: 'Profile',
    href: '/profile',
    icon: 'user',
    description: 'Your profile and statistics'
  }
];

const getIcon = (iconName: string, className: string = '') => {
  const iconProps = { className, size: 20 };
  
  switch (iconName) {
    case 'home':
      return <HomeIcon {...iconProps} />;
    case 'calendar':
      return <CalendarIcon {...iconProps} />;
    case 'trophy':
      return <TrophyIcon {...iconProps} />;
    case 'user':
      return <UserIcon {...iconProps} />;
    case 'target':
      return <TargetIcon {...iconProps} />;
    case 'chart':
      return <ChartBarIcon {...iconProps} />;
    case 'users':
      return <UsersIcon {...iconProps} />;
    default:
      return <HomeIcon {...iconProps} />;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Check if user is admin
  const isAdmin = session?.user?.email === 'admin@plpredictions.com';
  
  // Add admin navigation if user is admin
  const adminNavItems = isAdmin ? [{
    title: 'Admin Panel',
    href: '/admin',
    icon: 'chart' as const,
    description: 'System administration'
  }] : [];
  
  const allNavItems = [...navigationItems, ...adminNavItems];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Close menu"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {allNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            const colorClass = index % 2 === 0 ? 'green' : 'purple';
            const activeClasses = colorClass === 'green' 
              ? 'bg-green-600 text-white shadow-sm' 
              : 'bg-purple-600 text-white shadow-sm';
            const hoverClasses = colorClass === 'green'
              ? 'text-gray-700 hover:bg-green-50 hover:text-green-900'
              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-900';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isActive ? activeClasses : hoverClasses}
                `}
              >
                <div className="mr-3">
                  {getIcon(item.icon, isActive ? 'text-white' : 'text-gray-500')}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  {item.description && (
                    <div className={`text-xs ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section - Season info */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
              Current Season
            </div>
            <div className="text-sm font-semibold text-gray-900">
              Premier League
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Gameweek 1
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;