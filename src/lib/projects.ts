export type Project = {
  slug: string;
  title: string;
  category: string;
  discipline: "Events" | "Film" | "Identity" | "Digital";
  year: string;
  color: string;
  background: string;
  tagline: string;
  description: string;
  direction: string;
  deliverables: string[];
  artwork: string;
};

export const projects: Project[] = [
  {
    slug: "no-signal", title: "LOTOS PREMIUM", category: "Video hrane i pića", discipline: "Film", year: "2026",
    color: "#f05b99", background: "#b91b5b", tagline: "Ukus vredan kadra.",
    description: "Bogata čokolada, sveže maline i prvi gutljaj u glavnim ulogama videa za Lotos Premium.",
    direction: "Krupni kadrovi, tople teksture i jarka ružičasta pozadina stavljaju napitak u prvi plan.",
    deliverables: ["Koncept videa", "Umetnička direkcija", "Snimanje proizvoda", "Montaža za mreže"], artwork: "/design/no-signal.png",
  },
  {
    slug: "after-hours", title: "SHOPE", category: "Dizajn albuma", discipline: "Identity", year: "2026",
    color: "#f25b5e", background: "#53090a", tagline: "Pravo sa juga.",
    description: "Vizuelni identitet albuma za Shope: crvene baklje, ulični portreti i snažna slova u ritmu muzike.",
    direction: "Tamnocrveni i crni tonovi, jak kontrast i puno igralište prenose sirovu energiju albuma.",
    deliverables: ["Dizajn albuma", "Umetnička direkcija", "Vizuali izdanja", "Grafike za mreže"], artwork: "/design/after-hours.png",
  },
  {
    slug: "raw-frequency", title: "WOMEN'S RAP", category: "Muzički festival", discipline: "Events", year: "2026",
    color: "#ff6b9e", background: "#3a2a57", tagline: "Scena koja im pripada.",
    description: "Kampanja za prvi ženski rep festival spaja izvođačice kroz upečatljive plakate i portrete.",
    direction: "Ružičaste siluete i ljubičasti prelivi uokviruju kolaž izvođačica. Svaka dobija svoje lice, ime i mesto na plakatu.",
    deliverables: ["Vizuali festivala", "Plakati programa", "Grafike izvođačica", "Sadržaj za mreže"], artwork: "/design/raw-frequency.png",
  },
  {
    slug: "echo-room", title: "NEW BLOOD", category: "Organizacija događaja", discipline: "Events", year: "2026",
    color: "#ff5959", background: "#8a0203", tagline: "Tik uz binu.",
    description: "Produkcija i praćenje događaja za New Blood Media, uz kadrove izvođača, publike i atmosfere u sali.",
    direction: "Crvena svetla bine, krupni kadrovi i jasna tipografija stavljaju nastup u prvi plan.",
    deliverables: ["Produkcija događaja", "Praćenje nastupa", "Fotografija događaja", "Montaža za mreže"], artwork: "/design/echo-room.png",
  },
  {
    slug: "motion-culture", title: "MIXI FIT", category: "Sadržaj za fitnes studio", discipline: "Digital", year: "2026",
    color: "#f7b200", background: "#54400e", tagline: "Vrati se onome što voliš.",
    description: "Sadržaj za Mixi Fit Studio o pokretu, ravnoteži i malim ritualima zbog kojih trening prija.",
    direction: "Topla žuta boja prati mirne studijske fotografije. Jednostavne kompozicije ostavljaju prostor pokretu i poruci.",
    deliverables: ["Osmišljavanje sadržaja", "Studijsko snimanje", "Grafike za mreže", "Kratki snimci"], artwork: "/design/motion-culture.png",
  },
  {
    slug: "concrete-stories", title: "RADIO KASET", category: "Muzički spot", discipline: "Film", year: "2026",
    color: "#9aafb0", background: "#383d3e", tagline: "Pesma u pokretu.",
    description: "Intiman muzički spot za Radiokaset, zasnovan na izražajnim portretima i energiji živog benda.",
    direction: "Prigušeni sivi tonovi, bliski kadrovi i spontani trenuci daju spotu ličan karakter.",
    deliverables: ["Koncept videa", "Kreativna produkcija", "Snimanje nastupa", "Završna montaža"], artwork: "/design/concrete-stories.png",
  },
  {
    slug: "nightshift", title: "LAZARUS", category: "Video o grafitima", discipline: "Film", year: "2026",
    color: "#8fa9c8", background: "#373f4d", tagline: "Sa zida na ekran.",
    description: "Kratki filmovi o Lazarusovim oslikanim likovima, snažnim bojama i detaljima koji stoje iza svakog rada.",
    direction: "Krupni kadrovi boje, teksture i izražajnih lica prenose rad sa zida na ekran, uz očuvanje njegove grubosti.",
    deliverables: ["Snimanje umetnika", "Kadrovi detalja", "Montaža videa", "Klipovi za mreže"], artwork: "/design/nightshift.png",
  },
  {
    slug: "framework", title: "NISHKI GRAM", category: "Lokalni medijski portal", discipline: "Digital", year: "2026",
    color: "#dfb66f", background: "#89441b", tagline: "Grad iz našeg ugla.",
    description: "Lokalne priče iz Niša o mestima, ljudima i kulturi zbog kojih grad doživljavamo kao dom.",
    direction: "Zlatni i smeđi tonovi uokviruju grad i njegove znamenitosti. Jasna grafika povezuje svakodnevne priče u celinu.",
    deliverables: ["Urednički pravac", "Lokalne priče", "Sadržaj za mreže", "Vizuali portala"], artwork: "/design/framework.png",
  },
];

export const expertise = ["Creative Production", "Social Media Strategy", "Video Production", "Event Production", "Artist Branding", "Project Management"];

export function getProject(slug: string) { return projects.find((project) => project.slug === slug); }

export function getNextProject(slug: string) {
  return projects[(projects.findIndex((project) => project.slug === slug) + 1) % projects.length];
}
