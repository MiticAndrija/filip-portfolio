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
    slug: "no-signal", title: "NO SIGNAL", category: "Underground music festival", discipline: "Events", year: "2026",
    color: "#ff4d1c", background: "#171715", tagline: "Disconnect. Turn up.",
    description: "A gathering for the sounds that don’t fit the mainstream. One warehouse. Three stages. A whole new frequency.",
    direction: "An identity built on interference. Distorted waveforms, uncompromising typography and emergency orange translate the energy of a live crowd into a visual system.",
    deliverables: ["Creative direction", "Event concept", "Campaign identity", "Social content"], artwork: "/art/no-signal.svg",
  },
  {
    slug: "after-hours", title: "AFTER HOURS", category: "Music video production", discipline: "Film", year: "2026",
    color: "#bca4ff", background: "#211336", tagline: "The city changes after midnight.",
    description: "A music film following one last journey through a city that never quite sleeps. A story told in light, movement and the space between beats.",
    direction: "Violet sodium light meets analog film. An endless architectural tunnel becomes a visual metaphor for the after-hours state of mind.",
    deliverables: ["Film treatment", "Creative production", "Art direction", "Vertical edits"], artwork: "/art/after-hours.svg",
  },
  {
    slug: "raw-frequency", title: "RAW FREQUENCY", category: "Artist branding & visual identity", discipline: "Identity", year: "2025",
    color: "#c8fa49", background: "#b7dc41", tagline: "Find your own frequency.",
    description: "A identity for an independent artist making beautifully unpredictable noise. A flexible visual language as restless as the music itself.",
    direction: "Acid green, vibrating contours and unfiltered type. A generative waveform is the starting point for every sleeve, stage visual and social asset.",
    deliverables: ["Artist identity", "Cover artwork", "Motion language", "Release campaign"], artwork: "/art/raw-frequency.svg",
  },
  {
    slug: "echo-room", title: "ECHO ROOM", category: "Creative video campaign", discipline: "Film", year: "2025",
    color: "#5379ff", background: "#163ae0", tagline: "An idea that keeps coming back.",
    description: "A film campaign that turns a single gesture into an expanding visual world. Repetition becomes rhythm. Rhythm becomes recognition.",
    direction: "An impossible blue space, circular architecture and repeating forms. Each frame feels like stepping a little deeper into the same idea.",
    deliverables: ["Campaign concept", "Video production", "Motion design", "Digital rollout"], artwork: "/art/echo-room.svg",
  },
  {
    slug: "motion-culture", title: "MOTION CULTURE", category: "Social content production", discipline: "Digital", year: "2026",
    color: "#fc7034", background: "#ef5a23", tagline: "Made to move you.",
    description: "A content series for a new generation of dancers and makers. Short-form stories with a long-lasting feeling.",
    direction: "Liquid metallic shapes against warm orange. Loops, kinetic cuts and a modular approach make every post part of a recognizable world.",
    deliverables: ["Content strategy", "Creative production", "Reels & shorts", "Editorial planning"], artwork: "/art/motion-culture.svg",
  },
  {
    slug: "concrete-stories", title: "CONCRETE STORIES", category: "Graffiti artist digital portfolio", discipline: "Identity", year: "2025",
    color: "#e3444d", background: "#e9e4dc", tagline: "The walls have something to say.",
    description: "A digital exhibition for a street artist whose work gives forgotten spaces a voice. A living archive of marks, layers and urban stories.",
    direction: "Torn paper, expressive red strokes and photocopied textures. Bringing the physical imperfection of the street into a carefully composed digital experience.",
    deliverables: ["Visual identity", "Digital art direction", "Artist storytelling", "Launch content"], artwork: "/art/concrete-stories.svg",
  },
  {
    slug: "nightshift", title: "NIGHTSHIFT", category: "Live event production", discipline: "Events", year: "2026",
    color: "#b3f5eb", background: "#112926", tagline: "For the ones still awake.",
    description: "A late-night live series where sound, light and space share the stage. An intimate room with an outsized atmosphere.",
    direction: "Deep black-green punctuated by electric mint. A laser-inspired visual system carries the live experience from its first announcement to the final encore.",
    deliverables: ["Event production", "Stage concept", "Lighting direction", "Live content"], artwork: "/art/nightshift.svg",
  },
  {
    slug: "framework", title: "FRAMEWORK", category: "Digital brand campaign", discipline: "Digital", year: "2025",
    color: "#ff623d", background: "#e2ded3", tagline: "A new way to see things.",
    description: "A campaign for an independent design collective. A system that makes room for bold ideas, different perspectives and new connections.",
    direction: "Playful geometry with an editorial edge. Primary shapes, tactile paper and a single orange accent build a flexible campaign across every digital format.",
    deliverables: ["Brand concept", "Campaign direction", "Social strategy", "Digital assets"], artwork: "/art/framework.svg",
  },
];

export const expertise = ["Creative Production", "Social Media Strategy", "Video Production", "Event Production", "Artist Branding", "Project Management"];

export function getProject(slug: string) { return projects.find((project) => project.slug === slug); }

export function getNextProject(slug: string) {
  return projects[(projects.findIndex((project) => project.slug === slug) + 1) % projects.length];
}
