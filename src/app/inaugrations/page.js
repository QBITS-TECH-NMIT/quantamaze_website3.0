"use client";

import dynamic from "next/dynamic";

const Inaugurations = dynamic(() => import("../../../inaugrations"), {
  ssr: false,
});

export default function InaugrationsPage() {
  return <Inaugurations />;
}
