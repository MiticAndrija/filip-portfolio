export function Footer({ className = "" }: { className?: string }) {
  return <footer className={`site-footer ${className}`} role="contentinfo">
    <span>© 2026 Filip Radojković</span>
    <span>Niš, Serbia</span>
  </footer>;
}
