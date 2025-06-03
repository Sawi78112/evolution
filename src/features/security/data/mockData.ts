import { SecurityEntry } from '../types';

// Division data type
export interface Division {
  id: number;
  name: string;
  abbreviation: string;
  manager: {
    name: string;
    abbreviation: string;
    image: string;
  };
  createdBy: {
    name: string;
    abbreviation: string;
  };
  createdAt: string;
  totalUsers: number;
  status: 'Active' | 'Inactive';
}

// Mock data for divisions
export const divisionsData: Division[] = [
  {
    id: 1,
    name: "Alpha Division",
    abbreviation: "ALPH",
    manager: {
      name: "Maria Pulera",
      abbreviation: "MAPL",
      image: "/images/user/user-01.jpg"
    },
    createdBy: {
      name: "Admin: Alice",
      abbreviation: "ADMN"
    },
    createdAt: "2025-05-20 10:31",
    totalUsers: 12,
    status: 'Active'
  },
  {
    id: 2,
    name: "Beta Division",
    abbreviation: "BETA",
    manager: {
      name: "John Smith",
      abbreviation: "JOSH",
      image: "/images/user/user-02.jpg"
    },
    createdBy: {
      name: "Admin: Bob",
      abbreviation: "ADBO"
    },
    createdAt: "2025-04-15 14:22",
    totalUsers: 8,
    status: 'Active'
  },
  {
    id: 3,
    name: "Gamma Division",
    abbreviation: "GAMM",
    manager: {
      name: "Sarah Johnson",
      abbreviation: "SAJO",
      image: "/images/user/user-03.jpg"
    },
    createdBy: {
      name: "Admin: Carol",
      abbreviation: "ADCA"
    },
    createdAt: "2025-03-10 09:45",
    totalUsers: 15,
    status: 'Active'
  },
  {
    id: 4,
    name: "Delta Division",
    abbreviation: "DELT",
    manager: {
      name: "Mike Wilson",
      abbreviation: "MIWI",
      image: "/images/user/user-04.jpg"
    },
    createdBy: {
      name: "Admin: David",
      abbreviation: "ADDA"
    },
    createdAt: "2025-02-28 16:10",
    totalUsers: 6,
    status: 'Inactive'
  }
];

// Sample security data
export const securityData: SecurityEntry[] = [
  {
    id: 1,
    user: {
      image: "/images/default-avatar.svg",
      name: "Isabella Davis",
      role: "Administrator",
    },
    abbreviation: "LGIN",
    action: "Login Attempt",
    division: "Alpha",
    manager: {
      name: "Maria Pulera",
      abbreviation: "MAPL",
    },
    lastLoginIn: "2025-05-22 09:34:55",
    status: "Active",
    roles: ["Administrator"],
  },
  {
    id: 2,
    user: {
      image: "/images/default-avatar.svg",
      name: "Ethan Brown",
      role: "Analyst",
    },
    abbreviation: "FDWN",
    action: "File Download",
    division: "Beta",
    manager: {
      name: "James Wilson",
      abbreviation: "JAWL",
    },
    lastLoginIn: "2025-05-21 08:45:12",
    status: "Inactive",
    roles: ["Analyst"],
  },
  {
    id: 3,
    user: {
      image: "/images/default-avatar.svg",
      name: "Sophia Martinez",
      role: "Investigator",
    },
    abbreviation: "CACC",
    action: "Case Access",
    division: "Gamma",
    manager: {
      name: "Robert Chen",
      abbreviation: "ROCH",
    },
    lastLoginIn: "2025-05-20 07:30:45",
    status: "Active",
    roles: ["Investigator", "Analyst"],
  },
  {
    id: 4,
    user: {
      image: "/images/default-avatar.svg",
      name: "Abram Schleifer",
      role: "Divisional Manager",
    },
    abbreviation: "PWCH",
    action: "Password Change",
    division: "Delta",
    manager: {
      name: "Sarah Johnson",
      abbreviation: "SAJO",
    },
    lastLoginIn: "2025-05-19 10:15:22",
    status: "Active",
    roles: ["Divisional Manager"],
  },
  {
    id: 5,
    user: {
      image: "/images/default-avatar.svg",
      name: "Charlotte Anderson",
      role: "Analyst",
    },
    abbreviation: "LGIN",
    action: "Login Attempt",
    division: "Alpha",
    manager: {
      name: "Maria Pulera",
      abbreviation: "MAPL",
    },
    lastLoginIn: "2025-05-18 08:10:45",
    status: "Canceled",
    roles: ["Analyst"],
  },
  {
    id: 6,
    user: {
      image: "/images/default-avatar.svg",
      name: "Liam Wilson",
      role: "Administrator",
    },
    abbreviation: "UCRT",
    action: "User Creation",
    division: "Beta",
    manager: {
      name: "James Wilson",
      abbreviation: "JAWL",
    },
    lastLoginIn: "2025-05-17 09:22:33",
    status: "Active",
    roles: ["Administrator"],
  },
  {
    id: 7,
    user: {
      image: "/images/default-avatar.svg",
      name: "Olivia Johnson",
      role: "Investigator",
    },
    abbreviation: "APIC",
    action: "API Access",
    division: "Gamma",
    manager: {
      name: "Robert Chen",
      abbreviation: "ROCH",
    },
    lastLoginIn: "2025-05-16 07:45:12",
    status: "Inactive",
    roles: ["Investigator"],
  },
  {
    id: 8,
    user: {
      image: "/images/default-avatar.svg",
      name: "Noah Garcia",
      role: "Divisional Manager",
    },
    abbreviation: "SYCF",
    action: "System Configuration",
    division: "Delta",
    manager: {
      name: "Sarah Johnson",
      abbreviation: "SAJO",
    },
    lastLoginIn: "2025-05-15 08:30:45",
    status: "Active",
    roles: ["Divisional Manager", "System Support"],
  },
  {
    id: 9,
    user: {
      image: "/images/default-avatar.svg",
      name: "Emma Miller",
      role: "Analyst",
    },
    abbreviation: "LGIN",
    action: "Login Attempt",
    division: "Alpha",
    manager: {
      name: "Maria Pulera",
      abbreviation: "MAPL",
    },
    lastLoginIn: "2025-05-14 09:15:33",
    status: "Transferred",
    roles: ["Analyst", "Investigator"],
  },
  {
    id: 10,
    user: {
      image: "/images/default-avatar.svg",
      name: "William Davis",
      role: "Administrator",
    },
    abbreviation: "PRCH",
    action: "Permission Change",
    division: "Beta",
    manager: {
      name: "James Wilson",
      abbreviation: "JAWL",
    },
    lastLoginIn: "2025-05-13 08:45:22",
    status: "Active",
    roles: ["Administrator"],
  },
]; 