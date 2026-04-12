import { Fragment, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { SvgIconComponent } from '@mui/icons-material'

// Types for navbar configuration
interface NavbarAction {
  id: string
  icon: keyof typeof NAVBAR_ACTION_ICONS
  label: string
}



interface UserMenuItem {
  id: string
  label: string
  dividerBefore?: boolean
}

// Navbar.tsx - add export to the interface
export interface NavbarConfig {
  brandTitle: string
  actions?: NavbarAction[]
  userMenu?: UserMenuItem[]
}

interface NavbarProps {
  config: NavbarConfig
  onMenuClick: () => void
  sidebarOpen?: boolean
}

/** Action bar icons keyed by `navbarConfig.actions[].icon` */
const NAVBAR_ACTION_ICONS: Record<string, SvgIconComponent> = {
  NotificationsOutlined: NotificationsOutlinedIcon,
}

/**
 * Top app bar: hamburger (toggles sidebar on all breakpoints), brand, actions, user menu.
 * `position="fixed"` + full width; Layout renders a `<Toolbar />` spacer so content clears the bar.
 */
function Navbar({ config, onMenuClick, sidebarOpen = false }: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const userMenuOpen = Boolean(anchorEl)

  const handleUserOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleUserClose = () => setAnchorEl(null)

  return (
    <AppBar
      position="fixed"
      elevation={0}
      className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md dark:border-slate-700/90 dark:bg-slate-950/85"
      sx={{
        color: 'text.primary',
        width: '100%',
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar className="min-h-14 gap-2 px-3 sm:px-4">
        <IconButton
          edge="start"
          color="inherit"
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sidebarOpen}
          onClick={onMenuClick}
          className="mr-1"
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          className="flex-1 font-semibold tracking-tight text-left truncate"
        >
          {config.brandTitle}
        </Typography>

        <Box className="flex items-center gap-0.5 sm:gap-1">
          {config.actions?.map((action) => {
            const ActionIcon = NAVBAR_ACTION_ICONS[action.icon]
            if (!ActionIcon) return null
            return (
              <Tooltip title={action.label} key={action.id}>
                <IconButton color="inherit" aria-label={action.label} size="medium">
                  <ActionIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          })}

          <Tooltip title="Account">
            <IconButton
              onClick={handleUserOpen}
              color="inherit"
              aria-label="account menu"
              aria-controls={userMenuOpen ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuOpen ? 'true' : undefined}
              size="medium"
            >
              <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                <AccountCircleIcon fontSize="small" />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={userMenuOpen}
          onClose={handleUserClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { className: 'mt-1 min-w-48' } }}
        >
        {config.userMenu?.flatMap((item) => {
        const elements = []

        if (item.dividerBefore) {
          elements.push(
            <Divider key={`${item.id}-divider`} />
          )
        }

        elements.push(
          <MenuItem
            key={item.id}
            onClick={handleUserClose}
            dense
            className="text-sm"
          >
            {item.label}
          </MenuItem>
        )

        return elements
      })}
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar