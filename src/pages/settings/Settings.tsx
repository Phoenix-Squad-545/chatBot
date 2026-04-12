import { Paper, Switch, Typography } from '@mui/material'
import { useState } from 'react'

/**
 * Settings page — demonstrates form-like controls; expand with sections as needed.
 */
function Settings() {
  const [notifications, setNotifications] = useState<boolean>(true)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Typography variant="h4" component="h1" className="font-semibold tracking-tight">
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Manage preferences for this workspace.
        </Typography>
      </div>

      <Paper
        elevation={0}
        className="rounded-2xl border border-slate-200/80 p-4 sm:p-6 dark:border-slate-700/80"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="subtitle1" className="font-medium">
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Receive product updates and alerts.
            </Typography>
          </div>
          <Switch
            checked={notifications}
            onChange={(_, v) => setNotifications(v)}
            inputProps={{ 'aria-label': 'Enable notifications' }}
          />
        </div>
      </Paper>
    </div>
  )
}

export default Settings
