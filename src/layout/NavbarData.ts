/**
 * Navbar configuration — brand, optional action buttons, and user menu entries.
 * Passed from the route shell into `Navbar.tsx` via props (no literals inside the component).
 */
import type { NavbarConfig } from './Navbar'

export interface NavbarAction {
  id: string
  label: string
  icon: 'NotificationsOutlined' // Add more icon names as needed
}

export interface UserMenuItem {
  id: string
  label: string
  dividerBefore?: boolean
}

export const navbarConfig: NavbarConfig = {
  brandTitle: 'AR HyperAutomation',
  actions: [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'NotificationsOutlined',
    },
  ],
  userMenu: [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
    { id: 'logout', label: 'Log out', dividerBefore: true },
  ],
}