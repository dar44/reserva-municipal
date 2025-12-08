import { NextResponse } from 'next/server'
import { requireAuthAPI } from '@/lib/auth/guard'
import { randomUUID } from 'crypto'
import { COURSE_IMAGE_BUCKET } from '@/lib/cursoImages'

export const dynamic = 'force-dynamic'

function buildUploadPath(filename: string) {
    const extension = filename.split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '')
    const id = randomUUID()
    return extension ? `uploads/${id}.${extension}` : `uploads/${id}`
}

export async function POST(req: Request) {
    const auth = await requireAuthAPI(['organizer', 'admin'])
    if ('error' in auth) {
        return auth.error
    }

    const { supabase } = auth

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        if (buffer.length === 0) {
            return NextResponse.json({ error: 'El archivo está vacío' }, { status: 400 })
        }

        const uploadPath = buildUploadPath(file.name)

        const { data, error } = await supabase.storage
            .from(COURSE_IMAGE_BUCKET)
            .upload(uploadPath, buffer, {
                cacheControl: '3600',
                contentType: file.type || 'application/octet-stream',
                upsert: false,
            })

        if (error) {
            console.error('Upload error:', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            image: data?.path ?? uploadPath,
            image_bucket: COURSE_IMAGE_BUCKET,
        })
    } catch (error) {
        console.error('POST /api/organizer/cursos/upload-image', error)
        const message = error instanceof Error ? error.message : 'Error al subir la imagen'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
