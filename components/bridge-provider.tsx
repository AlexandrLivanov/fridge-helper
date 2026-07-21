"use client";

import { useEffect } from "react";

export function BridgeProvider() {
  useEffect(() => {
    const handler = () => {
      fetch("/api/health").catch(() => {});
    };
    handler();
    const interval = setInterval(handler, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
