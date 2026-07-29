import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/layouts/_header';
import Sidebar from '@/layouts/_dashboard-sidebar';
import Copyright from '@/layouts/_copyright';
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
      className="sancan-ozon-page flex min-h-screen flex-col"
    >
      <Header />
      <motion.div
        variants={fadeInBottom()}
        className="sancan-ozon-container my-5 w-full flex-1 sm:my-7 lg:my-8"
      >
        <div className="flex w-full flex-col gap-5 lg:min-h-[70vh]">
          <Sidebar />
          <main className="sancan-ozon-section flex w-full flex-grow flex-col">
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
      <Copyright />
      {isMounted && breakpoint === 'xs' && <BottomNavigation />}
    </motion.div>
  );
}
