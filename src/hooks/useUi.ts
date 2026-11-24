import { useApp } from './useApp';

/** Layout-shell slice: mobile drawer + desktop collapsed rail. */
export function useUi() {
  const {
    sidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useApp();

  return {
    sidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  };
}
