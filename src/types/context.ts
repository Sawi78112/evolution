// Context Types

export type Theme = "light" | "dark";

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

export type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}; 