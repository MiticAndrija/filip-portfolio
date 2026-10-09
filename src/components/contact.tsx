"use client";

import { ArrowDownToLine, ArrowUpRight, Check, Copy } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { TransitionLink } from "./site-shell";
import { Footer } from "./footer";
import { usePageMotion } from "@/lib/page-motion";

export function Contact() {
  const root = useRef<HTMLElement>(null);
  usePageMotion(root);
  const form = useRef<HTMLFormElement>(null);
  const [ready,setReady] = useState(false);
  const [copied,setCopied] = useState(false);
  const [copyError,setCopyError] = useState(false);
  const [brief,setBrief] = useState("");
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  const createBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const content = `PROJECT BRIEF — FILIP RADOJKOVIĆ\n\nName: ${values.get("name")}\nEmail: ${values.get("email")}\nProject: ${values.get("type")}\n\nTHE IDEA\n${values.get("message")}\n\nPrepared with Creative Orbit.\n`;
    setBrief(content); setReady(true); setCopied(false); setCopyError(false);
    const url = URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));
    const link = document.createElement("a"); link.href=url; link.download="creative-orbit-project-brief.txt"; link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const copyBrief = async () => {
    try { await navigator.clipboard.writeText(brief); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  };

  return <main id="main" ref={root} className="contact-page"><section className="contact-intro"><h1 className="page-reveal">LET’S MAKE<br />SOME <span className="outline-type">NOISE.</span></h1><p className="page-reveal">An idea, a project, a possibility.<br />Give it a little space to grow.</p></section>
    <section className="contact-workspace"><div className="contact-note" data-reveal><h2>Start somewhere.<br />Make something.</h2><p>{email ? "Prepare a project brief, then send it over. Let’s find the right frequency." : "Prepare a project brief to take your idea from a feeling to a starting point."}</p><span className="contact-privacy">Your details stay in this browser. Downloading a brief does not send a message.</span>{email && <a href={`mailto:${email}`} className="text-link">{email}<ArrowUpRight size={17} /></a>}</div>
      <form ref={form} className="contact-form" onSubmit={createBrief} data-reveal><div className="form-pair"><label>Your name<input name="name" required autoComplete="name" placeholder="How should I call you?" maxLength={100} /></label><label>Your email<input name="email" type="email" required autoComplete="email" placeholder="you@yourworld.com" maxLength={200} /></label></div><label>What’s the frequency?<select name="type" defaultValue="Creative production"><option>Creative production</option><option>Social media & content</option><option>Music video</option><option>Live event</option><option>Artist branding</option><option>Something unexpected</option></select></label><label>A little about your idea<textarea name="message" required rows={4} placeholder="The big picture. The small details. Whatever you have in mind." maxLength={5000} /></label><button className="brief-button" type="submit"><span>{ready ? "DOWNLOAD BRIEF AGAIN" : "CREATE MY PROJECT BRIEF"}</span><ArrowDownToLine size={21} /></button><p className="form-status" aria-live="polite">{ready ? "Your project brief is ready. Download started — nothing was sent." : "A starting point for a conversation. Saved as a text file."}</p>{ready && <div className="brief-actions"><button type="button" onClick={copyBrief}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Brief copied" : "Copy brief"}</button>{email && <a href={`mailto:${email}?subject=${encodeURIComponent("Let’s make something — project brief")}&body=${encodeURIComponent(brief)}`}>Open email draft<ArrowUpRight size={15} /></a>}{copyError && <span role="status">Clipboard unavailable. Your downloaded brief contains the same text.</span>}</div>}</form></section>
    <div className="contact-overview"><TransitionLink href="/" className="text-link">Back to the creative orbit<ArrowUpRight size={17} /></TransitionLink></div>
    <Footer />
  </main>;
}
