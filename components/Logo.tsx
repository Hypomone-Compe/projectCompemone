/* Monogram Sandbox: huruf S dibentuk dari dua busur setengah lingkaran,
   dengan satu titik aksen di ujung atas. Sengaja tanpa kotak. */
export function LogoMark({ size = 24, dot = 'var(--red)' }: { size?: number; dot?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ flex: 'none', overflow: 'visible' }}
    >
      <path
        d="M42 22 A10 10 0 1 0 32 32 A10 10 0 1 1 22 42"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="42" cy="22" r="3.6" fill={dot} />
    </svg>
  );
}

export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <span className="brand">
      <LogoMark size={size} />
      Sandbox
    </span>
  );
}
