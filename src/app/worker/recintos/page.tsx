import { createSupabaseServer } from "@/lib/supabaseServer";
import Image from "next/image";
import RecintoActions from "./RecintoActions";
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from "@/lib/recintoImages";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
      <h1 className="mb-8">Gestión de Recintos Deportivos</h1>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recintos?.map(r => {
              const imageUrl = getRecintoImageUrl(supabase, r.image, r.image_bucket, defaultImageUrl);
              const isDisponible = r.state === 'Disponible'
              return (
                <TableRow key={r.id}>
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
                  <TableCell className="text-right">
                    <RecintoActions id={r.id} state={r.state} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}