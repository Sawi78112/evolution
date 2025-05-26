import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertIcon,
  GridIcon,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon, 
  GroupIcon,
  LockIcon,
  EyeIcon,
  PencilIcon,
  DocsIcon,
  HourglassIcon,
  UserCircleIcon,
  ElectronicCommIcon,
} from "@/assets/icons/index";

// Menu config copied from AppSidebar
const navItems = [
  {
    icon: <AlertIcon />,
    name: "Alerts",
    path: "/alerts",
  },
  {
    icon: <ListIcon />,
    name: "Cases",
    subItems: [
      { name: "Create Case", path: "/add-case", pro: false },
      { name: "Cases List", path: "/cases", pro: false },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "People",
    path: "/people",
  },
  {
    icon: <EyeIcon />,
    name: "Deep Fakes",
    path: "/deepfakes",
  },
  {
    icon: <ElectronicCommIcon />,
    name: "Electronic Communications",
    path: "/electronic-communications",
  },
  {
    icon: <DocsIcon />,
    name: "Risk Assessments",
    path: "/risk-assessments",
  },
  {
    icon: <HourglassIcon />,
    name: "Scheduling",
    path: "/scheduling",
  },
  {
    icon: <PieChartIcon />,
    name: "Reporting",
    path: "/reporting",
  },
  {
    icon: <PencilIcon />,
    name: "Keywords",
    path: "/keywords",
  },
  {
    icon: <LockIcon />,
    name: "Security",
    path: "/security",
  },
  {
    icon: <PageIcon />,
    name: "AI Agent Library",
    path: "/ai-agent-library",
  },
];

const othersItems = [
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

// Define profile related paths
const profilePaths = [
  "/profile", 
  "/edit-profile", 
  "/account-settings", 
  "/support"
];

function findMenuMatch(pathname: string) {
  // Try to find a match in navItems and othersItems
  const allMenus = [...navItems, ...othersItems];
  for (const menu of allMenus) {
    if ('path' in menu && menu.path && menu.path === pathname) {
      return { icon: menu.icon, main: menu.name, sub: null, mainPath: menu.path };
    }
    if (menu.subItems) {
      for (const sub of menu.subItems) {
        if (sub.path === pathname) {
          return { 
            icon: menu.icon, 
            main: menu.name, 
            sub: sub.name, 
            subPath: sub.path, 
            mainPath: 'path' in menu ? menu.path : undefined 
          };
        }
      }
    }
  }
  // Try partial match for nested routes
  for (const menu of allMenus) {
    if (menu.subItems) {
      for (const sub of menu.subItems) {
        if (pathname.startsWith(sub.path) && sub.path !== "/") {
          return { 
            icon: menu.icon, 
            main: menu.name, 
            sub: sub.name, 
            subPath: sub.path, 
            mainPath: 'path' in menu ? menu.path : undefined 
          };
        }
      }
    }
  }
  return null;
}

const isProfilePath = (pathname: string) => {
  return profilePaths.some(path => pathname.startsWith(path));
};

const BreadcrumbWithIcon: React.FC = () => {
  const pathname = usePathname();
  const match = findMenuMatch(pathname);
  
  // Special case for Dashboard (root path)
  if (pathname === "/") {
    return (
      <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
        <span className="flex items-center text-gray-400 mr-1">
          <GridIcon />
        </span>
        <span className="font-semibold text-gray-800 dark:text-white">Dashboard</span>
      </nav>
    );
  }
  
  // Special case for Profile pages
  if (isProfilePath(pathname)) {
    return (
      <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
        <span className="flex items-center text-gray-400 mr-1">
          <UserCircleIcon />
        </span>
        <span className="font-semibold text-gray-800 dark:text-white">Profile</span>
        {/* Add submenu if present */}
        {match && match.sub && (
          <>
            <span className="mx-1 text-gray-300">/</span>
            <span className="font-semibold text-gray-800 dark:text-white">{match.sub}</span>
          </>
        )}
      </nav>
    );
  }
  
  // If no match found for other pages, return null
  if (!match) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
      {/* Dashboard as first item for non-dashboard pages */}
      <span className="flex items-center text-gray-400 mr-1">
        <GridIcon />
      </span>
      <Link href="/" className="text-gray-500 hover:text-primary-500">
        Dashboard
      </Link>
      <span className="mx-1 text-gray-300">/</span>
      
      {/* Current section icon and name */}
      <span className="flex items-center text-gray-400 mr-1">{match.icon}</span>
      {match.sub ? (
        <Link href={match.mainPath || match.subPath || "/"} className="text-gray-500 hover:text-primary-500">
          {match.main}
        </Link>
      ) : (
        <span className="font-semibold text-gray-800 dark:text-white">{match.main}</span>
      )}
      
      {/* Submenu item if applicable */}
      {match.sub && (
        <>
          <span className="mx-1 text-gray-300">/</span>
          <span className="font-semibold text-gray-800 dark:text-white">{match.sub}</span>
        </>
      )}
    </nav>
  );
};

export default BreadcrumbWithIcon; 