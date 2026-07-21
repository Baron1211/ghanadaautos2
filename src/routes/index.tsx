import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import HomeV1 from "@/components/home/HomeV1";
import HomeV2 from "@/components/home/HomeV2";

export const Route = createFileRoute("/")({
  component: HomeSwitcher,
});

function HomeSwitcher() {
  const [version, setVersion] = useState<"v1" | "v2">("v1");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("v");
    const stored = window.localStorage.getItem("ga_home_version") as "v1" | "v2" | null;
    const v = q === "2" ? "v2" : q === "1" ? "v1" : stored ?? "v1";
    setVersion(v);
    setMounted(true);
  }, []);

  const switchTo = (v: "v1" | "v2") => {
    setVersion(v);
    window.localStorage.setItem("ga_home_version", v);
  };

  return (
    <>
      {mounted && (version === "v2" ? <HomeV2 /> : <HomeV1 />)}
      <div className="ga-version-switch" role="group" aria-label="Homepage version">
        <span className="ga-version-label">Design</span>
        <button
          type="button"
          onClick={() => switchTo("v1")}
          className={`ga-version-btn ${version === "v1" ? "is-active" : ""}`}
          aria-pressed={version === "v1"}
        >
          V1
        </button>
        <button
          type="button"
          onClick={() => switchTo("v2")}
          className={`ga-version-btn ${version === "v2" ? "is-active" : ""}`}
          aria-pressed={version === "v2"}
        >
          V2
        </button>
      </div>
    </>
  );
}