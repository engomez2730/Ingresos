"use client";

import { useEffect } from "react";
import { Button, Result } from "antd";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Result
        status="500"
        title="Ocurrió un error"
        subTitle={error.message || "Error inesperado al cargar la página."}
        extra={
          <Button type="primary" onClick={reset}>
            Reintentar
          </Button>
        }
      />
    </div>
  );
}
