export default function CheckAnimated() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="100%" stopColor="#FBC02D" />
        </linearGradient>
      </defs>

      {/* Círculo animado */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="url(#yellowGradient)"
        strokeWidth="4"
        strokeDasharray="251"
        strokeDashoffset="251"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="251"
          to="0"
          dur="1.2s"
          fill="freeze"
          begin="0s"
        />
      </circle>

      {/* Check animado */}
      <path
        d="M32 52 L44 64 L68 38"
        fill="none"
        stroke="url(#yellowGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="60"
        strokeDashoffset="60"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="60"
          to="0"
          dur="0.6s"
          begin="1s"
          fill="freeze"
        />
      </path>
    </svg>
  );
}
