'use client'

import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Recinto {
    id: number
    name: string
    ubication: string | null
    state: string
}

interface Props {
    recintos: Recinto[]
}

export default function OrganizerRecintosClient({ recintos }: Props) {
    return (
        <>
            {recintos?.length ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recintos.map((recinto) => {
                                const isDisponible = recinto.state === 'Disponible'
                                return (
                                    <TableRow key={recinto.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium">{recinto.name}</TableCell>
                                        <TableCell className="text-secondary">
                                            {recinto.ubication || 'No especificada'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={isDisponible ? "default" : "secondary"}
                                                className={isDisponible ? "bg-success text-success-foreground" : ""}
                                            >
                                                {recinto.state}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isDisponible ? (
                                                <Button asChild size="sm">
                                                    <Link href={`/organizer/solicitudes?recinto=${recinto.id}`}>
                                                        Solicitar
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button disabled size="sm" variant="secondary">
                                                    Solicitar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-secondary">No hay recintos disponibles por el momento.</p>
            )}
        </>
    )
}
