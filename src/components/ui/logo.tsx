import cn from 'classnames';
import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import routes from '@/config/routes';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useIsDarkMode } from '@/lib/hooks/use-is-dark-mode';
import { siteSettings } from '@/data/static/site-settings';

export default function Logo({
  className = 'w-40',
  ...props
}: React.AnchorHTMLAttributes<{}>) {
  const isMounted = useIsMounted();
  const { isDarkMode } = useIsDarkMode();
  const { lightLogo, darkLogo } = siteSettings;
  return (
    <AnchorLink
      href={routes.home}
      className={cn(
        'relative flex items-center text-dark focus:outline-none dark:text-light',
        className
      )}
      {...props}
    >
      <span
        className="relative overflow-hidden"
        style={{
          width: siteSettings?.width,
          height: siteSettings?.height,
        }}
      >
        {isMounted && isDarkMode && (
          <Image
            src={darkLogo}
            fill
            loading="eager"
            alt="SANCAN"
            className="object-contain"
          />
        )}
        {isMounted && !isDarkMode && (
          <Image
            src={lightLogo}
            fill
            loading="eager"
            alt="SANCAN"
            className="object-contain"
          />
        )}
      </span>
    </AnchorLink>
  );
}
