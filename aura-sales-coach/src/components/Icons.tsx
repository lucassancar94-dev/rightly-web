type P = { className?: string };
const base = (path: React.ReactNode, className = "h-6 w-6") => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {path}
  </svg>
);

export const IconCoach = ({ className }: P) => base(<><path d="M12 2a7 7 0 0 0-7 7v3l-2 4h18l-2-4V9a7 7 0 0 0-7-7z" /><path d="M9 20a3 3 0 0 0 6 0" /></>, className);
export const IconBox = ({ className }: P) => base(<><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></>, className);
export const IconChat = ({ className }: P) => base(<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />, className);
export const IconHistory = ({ className }: P) => base(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>, className);
export const IconPlus = ({ className }: P) => base(<path d="M12 5v14M5 12h14" />, className);
export const IconSend = ({ className }: P) => base(<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>, className);
export const IconMic = ({ className }: P) => base(<><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5" /></>, className);
export const IconStop = ({ className }: P) => base(<rect x="6" y="6" width="12" height="12" rx="2" />, className);
export const IconCopy = ({ className }: P) => base(<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>, className);
export const IconCheck = ({ className }: P) => base(<path d="M20 6 9 17l-5-5" />, className);
export const IconAlert = ({ className }: P) => base(<><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></>, className);
export const IconSearch = ({ className }: P) => base(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>, className);
export const IconChevron = ({ className }: P) => base(<path d="m6 9 6 6 6-6" />, className);
export const IconTrash = ({ className }: P) => base(<><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></>, className);
export const IconRefresh = ({ className }: P) => base(<><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>, className);
export const IconSettings = ({ className }: P) => base(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>, className);
