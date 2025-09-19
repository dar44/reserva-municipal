"use client";

import { JSX, useEffect, useState } from "react";
import type { PagoEstado } from "@/lib/pagos";

const RETRY_DELAY_MS = 2000;
const MAX_ATTEMPTS = 10;

const TERMINAL_ESTADOS: PagoEstado[] = [
  "pagado",
  "fallido",
  "reembolsado",
  "cancelado"
];

type Props = {
  pagoId: string;
  tipo: "inscripcion" | "reserva";
};

type ApiResponse = {
  estado?: string | null;
  error?: string | null;
};

function normalizeEstado(value: unknown): PagoEstado {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (
      normalized === "pagado" ||
      normalized === "pendiente" ||
      normalized === "fallido" ||
      normalized === "reembolsado" ||
      normalized === "cancelado"
    ) {
      return normalized as PagoEstado;
    }
  }
  return "pendiente";
}

function isTerminal(estado: PagoEstado): boolean {
  return TERMINAL_ESTADOS.includes(estado);
}

export function PagoStatusWatcher({ pagoId, tipo }: Props): JSX.Element {
  const [estado, setEstado] = useState<PagoEstado | null>(null);
  const [syncing, setSyncing] = useState<boolean>(true);
  const [attempts, setAttempts] = useState<number>(0);
  const [finalError, setFinalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const poll = async () => {
      if (!active) return;
      attempt += 1;
      setAttempts(attempt);

      try {
        const response = await fetch(`/api/pagos/${encodeURIComponent(pagoId)}`, {
          cache: "no-store"
        });
        const payload = (await response.json().catch(() => ({}))) as ApiResponse;
        if (!active) return;

        const nextEstado = normalizeEstado(payload.estado);
        setEstado(nextEstado);

        if (!response.ok) {
          if (attempt >= MAX_ATTEMPTS) {
            setSyncing(false);
            const message =
              typeof payload.error === "string"
                ? payload.error
                : `Error ${response.status}`;
            setFinalError(message);
          } else {
            setFinalError(null);
            setSyncing(true);
            timeout = setTimeout(poll,  RETRY_DELAY_MS);
          }
          return;
        }

        if (isTerminal(nextEstado)) {
          setSyncing(false);
          setFinalError(null);
          return;
        }

        if (attempt >= MAX_ATTEMPTS) {
          setSyncing(false);
          setFinalError(null);
          return;
        }

        setFinalError(null);
        setSyncing(true);
        timeout = setTimeout(poll, RETRY_DELAY_MS);
      } catch (error) {
        if (!active) return;
        if (attempt >= MAX_ATTEMPTS) {
          setSyncing(false);
          const message =
            error instanceof Error ? error.message : "sync_failed";
          setFinalError(message);
        } else {
          setFinalError(null);
          setSyncing(true);
          timeout = setTimeout(poll, RETRY_DELAY_MS);
        }
      }
    };

    poll();

    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [pagoId]);

  const tipoLabel = tipo === "inscripcion" ? "inscripción" : "reserva";

  if (!estado) {
    return (
      <p className="text-sm text-gray-400">
        Estamos confirmando el estado del pago...
      </p>
    );
  }

  let message = "";
  let colorClass = "text-sm ";

  switch (estado) {
    case "pagado":
      message = `La ${tipoLabel} ya aparece como pagada en el panel.`;
      colorClass += "text-green-500";
      break;
    case "pendiente":
      if (syncing) {
        message = `Estamos sincronizando la ${tipoLabel} con la pasarela. Se actualizará automáticamente en unos instantes.`;
        colorClass += "text-amber-400";
      } else {
        message = "No hemos podido confirmar el estado del pago automáticamente. Actualiza esta página más tarde para comprobar si se registró correctamente.";
        colorClass += "text-red-400";
      }
      break;
    case "reembolsado":
      message = "El pago figura como reembolsado en la pasarela.";
      colorClass += "text-blue-400";
      break;
    case "fallido":
      message = "El pago aparece como fallido en la pasarela.";
      colorClass += "text-red-500";
      break;
    case "cancelado":
      message = "El pago aparece cancelado en la pasarela.";
      colorClass += "text-red-400";
      break;
  }

  return (
    <div className="space-y-2">
      <p className={colorClass}>{message}</p>
      {syncing && estado === "pendiente" && (
        <p className="text-xs text-gray-400">
          Intento {attempts} de {MAX_ATTEMPTS}. Puedes mantener esta página abierta mientras finalizamos la sincronización.
        </p>
      )}
      {finalError && (
        <p className="text-xs text-red-400">
          Error al sincronizar con la pasarela: {finalError}
        </p>
      )}
    </div>
  );
}