import Logo from '../../assets/desktop_logo_v2.svg';

type HeaderProps = {
  error?: string | null;
};

export default function Header({ error }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-blue border-b border-white/10 flex items-center px-4 z-[60]">
      <img src={Logo} alt="Logo" className="h-8 w-auto" />
      <h1 className="ml-3 text-sm font-semibold tracking-wide uppercase text-white/80">
        Live Scores Dashboard
      </h1>
      {error && (
        <span className="ml-auto text-[11px] text-red-400 truncate max-w-[240px]">
          {error}
        </span>
      )}
    </header>
  );
}
