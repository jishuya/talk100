/**
 * TALK 100 brand logo.
 * All product surfaces share the transparent /logo.png mascot.
 */
const Logo = ({ width = 200, height = 60, animated = false, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 ${animated ? 'logo-animated' : ''} ${className}`}
    style={{ width, height }}
  >
    <img
      src="/logo.png"
      alt=""
      aria-hidden="true"
      className="h-full w-auto object-contain"
    />
    <span
      className="font-semibold leading-none text-primary"
      style={{ fontFamily: 'Fredoka, sans-serif', fontSize: height * 0.55 }}
    >
      talk100
    </span>
  </span>
);

export default Logo;
