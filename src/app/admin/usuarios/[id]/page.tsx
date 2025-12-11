import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { buildStorageUrl } from '@/lib/storage'
import { createSupabaseServer } from '@/lib/supabaseServer'
import DeleteButton from './DeleteButton'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

const roleColors = {
  admin: "bg-error text-error-foreground",
  worker: "bg-warning text-warning-foreground",
  organizer: "bg-info text-info-foreground",
  citizen: "bg-muted text-muted-foreground"
}

export default async function UsuarioDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createSupabaseServer()
  const { data: usuario } = await supabase
    .from('users')
    .select('uid,image,image_bucket,name,surname,email,phone,dni,role')
    .eq('uid', id)
    .single()

  if (!usuario) redirect('/admin/usuarios')

  const avatarUrl = await buildStorageUrl(
    supabaseAdmin,
    usuario.image_bucket,
    usuario.image
  )

  return (
    <div className="container-padding section-spacing max-w-4xl mx-auto">
      <Link href="/admin/usuarios" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Volver a Usuarios
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">Detalles del Usuario</h1>
          <Badge className={roleColors[usuario.role as keyof typeof roleColors] || roleColors.citizen}>
            {usuario.role}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-80 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          <Image
            src={avatarUrl ?? '/defaults/avatar-1.png'}
            alt={usuario.name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">{usuario.name} {usuario.surname}</h2>
            <div className="space-y-3 text-secondary">
              <p><strong className="text-foreground">Email:</strong> {usuario.email}</p>
              <p><strong className="text-foreground">Teléfono:</strong> {usuario.phone || '—'}</p>
              <p><strong className="text-foreground">DNI:</strong> {usuario.dni || '—'}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button asChild>
              <Link href={`/admin/usuarios/${id}/editar`}>Editar Usuario</Link>
            </Button>
            <DeleteButton id={id} />
          </div>
        </div>
      </div>
    </div>
  )
}