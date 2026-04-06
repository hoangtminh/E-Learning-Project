"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { publicApiUrl } from "@/lib/env";

export function useSocket(enabled = true) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const url = useMemo(() => publicApiUrl.replace(/\/$/, ""), []);

  useEffect(() => {
    if (!enabled) return;

    const s = io(url, {
      transports: ["websocket"],
      autoConnect: true,
    });
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [enabled, url]);

  return socket;
}
