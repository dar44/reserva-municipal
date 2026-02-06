import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import BaseEmailLayout from './BaseEmailLayout'

interface InscripcionConfirmadaProps {
    recipientName: string
    cursoName: string
    fechaInicio?: string
    fechaFin?: string
    ubicacion?: string
    monto: string
}

const brandBlue = '#3B82F6'

export const InscripcionConfirmada = ({
    recipientName,
    cursoName,
    fechaInicio,
    fechaFin,
    ubicacion,
    monto,
}: InscripcionConfirmadaProps) => {
    return (
        <BaseEmailLayout preview={`Confirmación de inscripción - ${cursoName}`}>
            <Heading style={h1}>¡Inscripción Confirmada!</Heading>

            <Text style={text}>Hola {recipientName},</Text>

            <Text style={text}>
                Tu inscripción ha quedado confirmada. Toma nota de la información del curso:
            </Text>

            <Section style={detailsBox}>
                <Text style={detailRow}>
                    <strong>Curso:</strong> {cursoName}
                </Text>
                {fechaInicio && (
                    <Text style={detailRow}>
                        <strong>Comienzo:</strong> {fechaInicio}
                    </Text>
                )}
                {fechaFin && (
                    <Text style={detailRow}>
                        <strong>Finaliza:</strong> {fechaFin}
                    </Text>
                )}
                {ubicacion && (
                    <Text style={detailRow}>
                        <strong>Lugar:</strong> {ubicacion}
                    </Text>
                )}
                <Text style={detailRow}>
                    <strong>Monto:</strong> {monto}
                </Text>
            </Section>

            <Text style={text}>
                Si necesitas reprogramar o cancelar, ponte en contacto con nosotros con anticipación.
            </Text>

            <Text style={text}>
                ¡Te esperamos!
            </Text>
        </BaseEmailLayout>
    )
}

// Estilos
const h1 = {
    color: '#1f2937',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '32px 0 16px',
    padding: '0',
}

const text = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
}

const detailsBox = {
    backgroundColor: '#f9fafb',
    border: `2px solid ${brandBlue}`,
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
}

const detailRow = {
    color: '#1f2937',
    fontSize: '15px',
    lineHeight: '24px',
    margin: '8px 0',
}

export default InscripcionConfirmada
