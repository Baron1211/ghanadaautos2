import importAsset from "@/assets/blog/import.jpg";
import oilAsset from "@/assets/blog/oil.jpg";
import buyingAsset from "@/assets/blog/buying.jpg";

export type BlogPost = {
  slug: string;
  tag: string;
  title: string;
  date: string;
  readTime: string;
  img: string;
  excerpt: string;
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "importing-a-car-from-canada",
    tag: "Import Tips",
    title: "5 things to check before importing a car from China",
    date: "July 12, 2026",
    readTime: "6 min read",
    img: importAsset,
    excerpt:
      "From accident history to duty calculations — the essentials every Ghanaian buyer should verify before shipping a Chinese vehicle home.",
    body: [
      "Buying a car from China can save you thousands, but only if you avoid the common traps. Before you commit, work through this five-point checklist with your RRR Auto Export advisor.",
      "1. Verify the accident and title history. Every reputable Chinese dealer will provide a CarFax report. Look for salvage titles, flood damage, and repeat body work.",
      "2. Confirm the model year matches Ghana's import age rules. Vehicles older than 10 years attract heavy penalty duties at Tema and Accra ports.",
      "3. Calculate all landed costs up front — CIF value, import duty, VAT, NHIL, ECOWAS levy and processing fees. RRR Auto Export gives you an all-in quote before you pay.",
      "4. Book roll-on / roll-off (RoRo) shipping through a bonded forwarder. Container shipping is safer for luxury vehicles but doubles the cost.",
      "5. Plan your clearing. Our Accra office handles port clearance, DVLA registration and delivery to your door — usually within 10 working days of arrival.",
    ],
  },
  {
    slug: "how-often-to-change-your-oil",
    tag: "Maintenance",
    title: "How often should you really change your oil?",
    date: "July 5, 2026",
    readTime: "4 min read",
    img: oilAsset,
    excerpt:
      "The old '3,000 miles' rule is dead. Here's what modern engines actually need — and how Ghana's driving conditions change the math.",
    body: [
      "Modern synthetic oils are engineered to last far longer than the mineral oils of the 90s. Most manufacturers now recommend 8,000 – 15,000 km between changes.",
      "But Ghana's driving conditions — heat, dust, stop-and-go Accra traffic — count as 'severe service.' We recommend halving the manufacturer interval if you drive mostly in the city.",
      "Always check the dipstick monthly, use the oil grade your owner's manual specifies, and change the filter every service. Our workshop uses genuine filters and premium synthetic oil on every job.",
    ],
  },
  {
    slug: "new-vs-certified-pre-owned",
    tag: "Buying Advice",
    title: "New vs. certified pre-owned: what fits your budget?",
    date: "June 28, 2026",
    readTime: "5 min read",
    img: buyingAsset,
    excerpt:
      "Certified pre-owned can save you 30 – 40% off sticker — but only when the inspection, warranty and paperwork check out. Here's the breakdown.",
    body: [
      "A brand-new car depreciates roughly 20% the moment you drive it off the lot. Certified pre-owned (CPO) vehicles skip that first drop and still come with a factory-backed warranty.",
      "Look for a documented multi-point inspection, remaining factory warranty (or an extended CPO warranty), and a clean title history report.",
      "At RRR Auto Export every CPO vehicle passes a 150-point workshop inspection, comes with a 12-month powertrain warranty, and includes free first service. Talk to us before you shop anywhere else.",
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}