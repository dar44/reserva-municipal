'use client'

import { useState, Fragment } from "react"
import OpenStreetMapView from "@/components/OpenStreetMapView"
import DeleteButton from './DeleteButton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Tooltip } from "@/components/ui/tooltip"

interface UnifiedItem {
  id: number
  originalId: number
  type: 'Recinto' | 'Curso'
  name: string
  startAt: string
  endAt: string
  price: number
  status: string
  paid: boolean
  ubication?: string
}

interface Props {
  items: UnifiedItem[]
  formattedPrices: Record<number, string>
  formattedDates: Record<number, { start: string; end: string }>
  progressValues: Record<number, number>
}

export default function ActiveReservasTable({ items, formattedPrices, formattedDates, progressValues }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm mb-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha inicio</TableHead>
            <TableHead>Fecha fin</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <Fragment key={`${item.type}-${item.id}`}>
              <TableRow>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-secondary text-xs">{formattedDates[item.id]?.start}</TableCell>
                <TableCell className="text-secondary text-xs">{formattedDates[item.id]?.end}</TableCell>
                <TableCell className="font-medium">{formattedPrices[item.id]}</TableCell>
                <TableCell>
                  {item.type === 'Curso' ? (
                    <ProgressBar
                      value={progressValues[item.id] ?? 0}
                      showPercentage
                      size="sm"
                    />
                  ) : (
                    <Tooltip content="El progreso solo se muestra para cursos inscritos">
                      <span className="text-xs text-muted-foreground cursor-help">—</span>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip content={item.paid ? "Reserva confirmada y pagada" : "Pago pendiente de confirmación"}>
                    <Badge className={item.paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                      {item.paid ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    {item.type === 'Recinto' && item.ubication && (
                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="px-3 py-1 text-xs font-semibold rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
                      >
                        {expandedId === item.id ? 'Cerrar mapa' : 'Ver detalle'}
                      </button>
                    )}
                    {!item.paid && (
                      <DeleteButton id={item.originalId} type={item.type} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedId === item.id && item.ubication && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={8} className="px-4 py-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground mb-1">Cómo llegar a tu reserva</p>
                      <p className="text-xs text-tertiary mb-2">Ubicación de {item.name}: {item.ubication}</p>
                      <OpenStreetMapView
                        address={item.ubication}
                        title={`Ubicación de ${item.name}`}
                        className="h-64"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
