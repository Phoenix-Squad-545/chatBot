import { Fragment } from 'react'
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SettingsIcon from '@mui/icons-material/Settings'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { NavLink } from 'react-router-dom'
import { SvgIconComponent } from '@mui/icons-material'

// Types for sidebar items
export interface SidebarItem {
  id: string
  label: string
  path: string
  icon: keyof typeof SIDEBAR_ICONS
}

interface SidebarProps {
  items: SidebarItem[]
  open: boolean
  onClose: () => void
  onNavigate?: () => void
}

/** Maps `icon` string from sidebar data to MUI icon components */
const SIDEBAR_ICONS: Record<string, SvgIconComponent> = {
  Dashboard: DashboardIcon,
  Settings: SettingsIcon,
  SmartToy: SmartToyIcon,
}

export const SIDEBAR_DRAWER_WIDTH = 260

/**
 * Responsive navigation: temporary drawer on small screens (slides under fixed navbar),
 * collapsible column on `md+` (smooth width transition). Content is data-driven via `items`.
 */
function Sidebar({ items, open, onClose, onNavigate }: SidebarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const toolbarMin = theme.mixins.toolbar.minHeight
  const topPx = typeof toolbarMin === 'number' ? `${toolbarMin}px` : toolbarMin
  const drawerPaperMobile = {
    width: SIDEBAR_DRAWER_WIDTH,
    boxSizing: 'border-box' as const,
    top: topPx,
    height:
      typeof toolbarMin === 'number'
        ? `calc(100% - ${toolbarMin}px)`
        : `calc(100% - ${toolbarMin})`,
  }

  const drawerContent = (
    <>
      <Toolbar className="min-h-14 px-4 border-b border-slate-200/80 dark:border-slate-700/80">
        <Typography variant="subtitle1" className="font-semibold tracking-tight">
          Menu
        </Typography>
      </Toolbar>
      <List className="py-2 px-2" component="nav" aria-label="Main navigation">
        {items.map((item) => {
          const Icon = SIDEBAR_ICONS[item.icon] ?? DashboardIcon
          return (
            <ListItemButton
              key={item.id}
              component={NavLink}
              to={item.path}
              end={item.path === '/'}
              onClick={() => {
                if (isMobile) onNavigate?.()
              }}
              className="rounded-lg mb-0.5"
              sx={{
                '&.active': {
                  bgcolor: 'action.selected',
                  fontWeight: 600,
                },
              }}
            >
              <ListItemIcon className="min-w-10">
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          )
        })}
      </List>
      <Divider className="mt-auto" />
    </>
  )

  return (
    <Fragment>
      {/* Mobile / tablet: overlay drawer below fixed AppBar */}
      <Drawer
        component="nav"
        aria-label="Application sidebar"
        variant="temporary"
        open={open && isMobile}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: (t) => t.zIndex.drawer,
          '& .MuiDrawer-paper': drawerPaperMobile,
        }}
      >
        <Box className="flex flex-col h-full bg-slate-50/80 dark:bg-slate-900/40">
          {drawerContent}
        </Box>
      </Drawer>

      {/* Desktop: in-flow column; width animates for collapse/expand */}
      <Box
        className="hidden md:flex flex-col border-r border-slate-200/80 bg-slate-50/80 dark:border-slate-700/80 dark:bg-slate-900/40"
        sx={{
          width: open ? SIDEBAR_DRAWER_WIDTH : 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest,
          }),
          overflow: 'hidden',
          flexShrink: 0,
          alignSelf: 'stretch',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            width: SIDEBAR_DRAWER_WIDTH,
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {drawerContent}
        </Box>
      </Box>
    </Fragment>
  )
}

export default Sidebar