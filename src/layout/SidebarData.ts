/**
 * Sidebar navigation model — serializable-only data (paths, labels, icon keys).
 * Icon keys are resolved to MUI icons inside `Sidebar.tsx` (keeps data files free of React imports).
 */
import type { SidebarItem } from './Sidebar'

export type SidebarIconName = 'Dashboard' | 'Settings' | 'SmartToy'


export const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'Dashboard',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
  },
  {
    id: 'chatbot',
    label: 'Chatbot',
    path: '/chatbot',
    icon: 'SmartToy',
  },
]