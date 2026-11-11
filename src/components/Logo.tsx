/** HOMELOTTERY mark: an admission ticket stub (the "lottery" ticket of a private show). */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="logo-mark">
      <path d="M6 7h20a2 2 0 0 1 2 2v3.2a3.8 3.8 0 0 0 0 7.6V23a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.2a3.8 3.8 0 0 0 0-7.6V9a2 2 0 0 1 2-2z" fill="var(--brass)" />
      <path d="M11.5 11.5v9M18.5 11.5v9M11.5 16h7" stroke="var(--velvet-0)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className={'wordmark ' + size}>
      <LogoMark size={size === 'lg' ? 40 : 26} />
      <span className="wm-text">Homelottery</span>
    </span>
  );
}
