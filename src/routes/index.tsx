import { createFileRoute } from "@tanstack/react-router";
import HomeV1 from "@/components/home/HomeV1";

export const Route = createFileRoute("/")({
  component: HomeV1,
});