import { createSupabaseServer } from "@/lib/supabaseServer";
import Image from "next/image";
import RecintoActions from "./RecintoActions";
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from "@/lib/recintoImages";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyRecintosState } from "@/components/ui/empty-state"
import { MapPin } from "lucide-react"

export const dynamic = "force-dynamic";

export default async function WorkerRecintosPage() {
  const supabase = await createSupabaseServer();
  const { data: recintos } = await supabase
    .from("recintos")
    .select("id,name,ubication,state,image,image_bucket")
    .order("name");

  const defaultImageUrl = getRecintoDefaultPublicUrl(supabase);

  return (
    <div className="container-padding section-spacing">
      {/* Header with gradient - Refactoring UI: usar jerarquía clara */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Gestión de Recintos Deportivos</h1>
          <p className="text-foreground-secondary">
            Reserva espacios para ciudadanos y consulta la disponibilidad de recintos
          </p>
        </div>
      </div>

      {recintos && recintos.length > 0 ? (
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Ubicación</span>
                  </div>
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recintos.map(r => {
                const imageUrl = getRecintoImageUrl(supabase, r.image, r.image_bucket, defaultImageUrl);
                const isDisponible = r.state === 'Disponible'
                return (
                  <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={r.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-md" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-secondary">{r.ubication}</TableCell>
                    <TableCell>
                      <Badge
                        variant={isDisponible ? "default" : "secondary"}
                        className={isDisponible ? "bg-success text-success-foreground" : ""}
                      >
                        {r.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <RecintoActions id={r.id} state={r.state} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyRecintosState />
      )}
    </div>
  );
}
