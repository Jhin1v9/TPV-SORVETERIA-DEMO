interface TropicaleLogoProps {
  className?: string;
  size?: number;
}

export default function TropicaleLogo({ className = '', size = 48 }: TropicaleLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sun circle background */}
      <circle cx="50" cy="50" r="46" fill="url(#sunGradient)" opacity="0.15" />
      
      {/* Palm tree trunk */}
      <path
        d="M48 85 C48 75 45 65 42 55 C40 48 38 42 36 38"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Palm fronds - left side */}
      <path
        d="M36 38 C28 32 20 34 16 40"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 38 C30 28 22 26 18 30"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Palm fronds - center/top */}
      <path
        d="M36 38 C36 28 34 20 30 16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 38 C42 28 46 22 50 18"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Palm fronds - right side */}
      <path
        d="M36 38 C44 32 52 30 58 34"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 38 C46 38 54 40 60 44"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Small decorative wave at bottom */}
      <path
        d="M25 88 Q35 83 45 88 Q55 83 65 88"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      
      <defs>
        <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
