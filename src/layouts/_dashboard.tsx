import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/layouts/_header';
import Sidebar from '@/layouts/_dashboard-sidebar';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
const BottomNavigation = dynamic(() => import('@/layouts/_bottom-navigation'));

export default function DashboardLayout({
  children,
}: React.PropsWithChildren<{}>) {
  const breakpoint = useBreakpoint();
  const isMounted = useIsMounted();
  return (
    <motion.div
      initial="exit"
      animate="enter"
      exit="exit"
      className="app-shell flex min-h-full flex-col lg:min-h-[auto]"
    >
      <Header />
      <motion.div
        variants={fadeInBottom()}
        className="container mx-auto my-6 w-full max-w-[1320px] flex-1 pt-14 md:my-8 sm:pt-[58px]"
      >
        <div className="app-surface-panel flex w-full flex-col lg:min-h-[70vh] lg:flex-row 2xl:min-h-[630px]">
          <Sidebar />
          <main className="flex w-full flex-grow flex-col lg:flex-grow-0 lg:bg-app-surface lg:layout-block-24 xl:layout-block-32">
            <AnimatePresence
              mode="wait"
              initial={false}
              onExitComplete={() => window.scrollTo(0, 0)}
            >
              {children}
            </AnimatePresence>
          </main>
        </div>
      </motion.div>
      {isMounted && breakpoint === 'xs' && <BottomNavigation />}
    </motion.div>
  );
}
