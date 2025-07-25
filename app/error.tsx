"use client"

import Custom404 from "./not-found/page";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  console.error("Error Boundary Caught:", error);

  return <Custom404 errorType="server" />;
}