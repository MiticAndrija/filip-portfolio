import Link from "next/link";
export default function NotFound() {
  return <main className="not-found"><p className="eyebrow">OUT OF ORBIT / 404</p><h1>This space is empty.</h1><Link href="/" className="text-link">Return to the creative orbit ↗</Link></main>;
}
