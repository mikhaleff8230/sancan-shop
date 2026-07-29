import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/layouts/_header';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import Copyright from '@/layouts/_copyright';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
const BottomNavigation = dynamic(() => import('@/layouts/_bottom-navigation'));

export default function GeneralLayout({
  children,
}: React.PropsWithChildren<{}>) {
  const breakpoint = useBreakpoint();
  const isMounted = useIsMounted();
  return (
    <motion.div
      initial="exit"
      animate="enter"
      exit="exit"
      className="sancan-ozon-page flex min-h-screen w-full flex-col"
    >
      <Header showHamburger={false} />
      <motion.div
        variants={fadeInBottom()}
        className="flex flex-1 flex-col justify-between"
      >
        <main className="flex w-full flex-grow flex-col">
          <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => window.scrollTo(0, 0)}
          >
            {children}
          </AnimatePresence>
        </main>
        <Copyright />
      </motion.div>
      {isMounted && breakpoint === 'xs' && <BottomNavigation />}
    </motion.div>
  );
}
