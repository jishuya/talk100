/**
 * TALK 100 Logo Component
 * 음성 인식을 상징하는 사운드 웨이브 로고
 */

const Logo = ({ width = 200, height = 60, animated = false, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="15 8 175 44"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'logo-animated' : ''} ${className}`}
    >
      {/* Sound waves */}
      <rect x="20" y="20" width="4" height="20" fill="#55AD9B" opacity="0.8" className={animated ? 'wave wave1' : ''}/>
      <rect x="28" y="15" width="4" height="30" fill="#55AD9B" opacity="0.9" className={animated ? 'wave wave2' : ''}/>
      <rect x="36" y="17" width="4" height="25" fill="#55AD9B" className={animated ? 'wave wave3' : ''}/>
      <rect x="44" y="12" width="4" height="35" fill="#55AD9B" className={animated ? 'wave wave4' : ''}/>
      <rect x="52" y="20" width="4" height="20" fill="#55AD9B" opacity="0.8" className={animated ? 'wave wave5' : ''}/>

      {/* Text */}
      <text x="70" y="30" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="bold" fill="#428A7B" dominantBaseline="middle">
        TALK 100
      </text>
    </svg>
  );
};

export default Logo;
