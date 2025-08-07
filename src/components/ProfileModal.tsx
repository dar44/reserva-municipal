'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Props {
  onClose: () => void
  onUpdated: (name: string) => void
}

interface Profile {
  name: string
  surname: string
  dni: string
  phone: string
  image: string
}

const fieldLabels: Record<keyof Profile, string> = {
  name: 'Name',
  surname: 'Surname',
  dni: 'DNI',
  phone: 'Phone',
  image: 'Image'
}
export default function ProfileModal ({ onClose, onUpdated }: Props) {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    surname: '',
    dni: '',
    phone: '',
    image: ''
  })
  const [editing, setEditing] = useState(false)
  const [fieldEditing, setFieldEditing] = useState<keyof Profile | null>(null)
  const [tempValue, setTempValue] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('name,surname,dni,phone,image')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile({
          name: data.name ?? '',
          surname: data.surname ?? '',
          dni: data.dni ?? '',
          phone: data.phone ?? '',
          image: data.image ?? ''
        })
      }
    }
    load()
  }, [])

  const startEdit = (field: keyof Profile) => {
    setFieldEditing(field)
    setTempValue(profile[field])
  }

  const saveField = async (field: keyof Profile) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const value = tempValue
    const { error } = await supabase
      .from('users')
      .update({ [field]: value })
      .eq('id', user.id)
    if (!error) {
      const updated = { ...profile, [field]: value }
      setProfile(updated)
      if (field === 'name') onUpdated(value)
      setFieldEditing(null)
    } else {
      alert('No se pudo actualizar')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white text-gray-900 p-6 rounded w-80 max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-lg font-semibold">Perfil</h2>
        {Object.entries(profile).map(([key, value]) => {
          const field = key as keyof Profile
          const label = fieldLabels[field]
          const displayValue =
            field === 'image'
              ? value ? (
                <img
                  src={value}
                  alt="Imagen de perfil"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span>No hay imagen</span>
              )
              : <span>{value}</span>
          return (
            <div key={key} className="text-sm">
             
              {editing && fieldEditing === field ? (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="w-20 capitalize">{label}</span>
                  <input
                    className="border p-1 flex-1 rounded"
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                  />
                  <button
                    onClick={() => saveField(field)}
                    className="px-2 bg-blue-600 text-white rounded"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setFieldEditing(null)}
                    className="px-2 rounded border"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="capitalize w-20">{label}</span>
                  <div className="flex-1 text-right mr-2">{displayValue}</div>
                  {editing && (
                    <button
                      onClick={() => startEdit(field)}
                      className="text-blue-600 text-xs"
                    >
                      Editar
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div className="flex justify-end space-x-2 pt-2">
          {editing ? (
            <button
              onClick={() => { setEditing(false); setFieldEditing(null) }}
              className="px-2 py-1 text-sm"
            >
              Terminar
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-1 text-sm"
            >
              Modificar perfil
            </button>
          )}
          <button onClick={onClose} className="px-2 py-1 text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}