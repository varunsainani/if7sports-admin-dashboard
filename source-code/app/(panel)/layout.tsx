import { TooltipProvider } from '@/components/ui/dropdown-menu'
import { Toaster } from '@/components/ui/toast'
import { DemoProvider } from '@/lib/demo-context'
import { BusquedaProvider } from '@/components/shell/command-palette'
import { DemoControls } from '@/components/shell/demo-controls'
import { Shell } from '@/components/shell/shell'

/**
 * The persistent shell wrapping every screen except Login and the error pages.
 *
 * The sidebar is fixed and the content column is offset by its width, so the
 * navigation never scrolls away from a long table and the header stays put
 * above it.
 */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <TooltipProvider delayDuration={300}>
        <BusquedaProvider>
          <Shell>{children}</Shell>

          <DemoControls />
          <Toaster />
        </BusquedaProvider>
      </TooltipProvider>
    </DemoProvider>
  )
}
