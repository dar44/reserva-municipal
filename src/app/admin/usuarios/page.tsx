import Link from 'next/link'
import Image from 'next/image'

import { createSupabaseServer } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { buildStorageUrl } from '@/lib/storage'
import UsuarioActions from './UsuarioActions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

type Usuario = {
  id: string
  image: string | null
  image_bucket: string | null
  name: string
  email: string
  phone: string
  dni: string
  role: string
  avatarUrl: string | null
}

export default async function AdminUsuariosPage() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('users')
    .select('uid,image,image_bucket,name,email,phone,dni,role')
    .order('name')

  const usuarios: Usuario[] = await Promise.all(
    (data ?? []).map(async u => ({
      id: u.uid,
      image: u.image,
      image_bucket: u.image_bucket,
      name: u.name,
      email: u.email,
      phone: u.phone,
      dni: u.dni,
      role: u.role,
      avatarUrl: await buildStorageUrl(supabaseAdmin, u.image_bucket, u.image)
    }))
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-error text-error-foreground'
      case 'worker': return 'bg-warning text-warning-foreground'
      case 'organizer': return 'bg-info text-info-foreground'
      default: return ''
    }
  }

  return (
    <div className="container-padding section-spacing">
      <div className="flex justify-between items-center mb-8">
        <h1>Usuarios</h1>
        <Button asChild>
          <Link href="/admin/usuarios/nuevo">+ Nuevo Usuario</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios?.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  {u.avatarUrl ? (
                    <Image
                      src={u.avatarUrl}
                      alt={u.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-secondary">{u.email}</TableCell>
                <TableCell className="text-secondary">{u.phone}</TableCell>
                <TableCell className="text-secondary">{u.dni}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(u.role)}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <UsuarioActions id={u.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}