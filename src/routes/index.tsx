import { createFileRoute } from "@tanstack/react-router";
import HomeV1 from "@/components/home/HomeV1";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RRR Auto Export — Cars, Parts, Rentals & Tracking" },
      { name: "description", content: "Buy cars, shop spare parts, book rentals, request repairs and track RRR Auto Export shipments between China and Ghana." },
      { property: "og:title", content: "RRR Auto Export — Cars, Parts, Rentals & Tracking" },
      { property: "og:description", content: "A complete automotive platform for vehicle sales, spare parts, rentals, repairs, imports and shipment tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV1,
});