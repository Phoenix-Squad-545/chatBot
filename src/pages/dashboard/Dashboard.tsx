import { Paper, Typography } from '@mui/material'
import GridOnIcon from '@mui/icons-material/GridOn'

/**
 * Dashboard landing — replace cards/metrics with real widgets as the product grows.
 */
function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Typography variant="h4" component="h1" className="font-semibold tracking-tight">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Overview of your activity — extend this page with charts and KPIs.
        </Typography>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Overview', 'Activity', 'Insights'].map((label) => (
          <Paper
            key={label}
            elevation={0}
            className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700/80"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300">
              <GridOnIcon fontSize="small" />
              <Typography variant="subtitle2" className="font-semibold">
                {label}
              </Typography>
            </div>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Placeholder module — hook up data from your API or state layer.
            </Typography>
          </Paper>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
