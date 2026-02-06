import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import BaseEmailLayout from './BaseEmailLayout'

interface SolicitudAprobadaProps {
    recipientName: string
    recintoName: string
    startDateTime: string
    endDateTime: string
    workerObservations?: string
}

const brandBlue = '#3B82F6'
const successGreen = '#10b981'

export const SolicitudAprobada = ({
    recipientName,
    recintoName,
    startDateTime,
    endDateTime,
    workerObservations,
}: SolicitudAprobadaProps) => {
    return (
        <BaseEmailLayout preview={`Solicitud aprobada - ${recintoName}`}>
            <Heading style={h1}>¡Solicitud Aprobada!</Heading>

            <Text style={text}>Hola {recipientName},</Text>

            <Text style={text}>
                Tenemos excelentes noticias: tu solicitud de recinto ha sido <strong style={{ color: successGreen }}>aprobada</strong> por el equipo municipal.
            </Text>

            <Section style={detailsBox}>
                <Text style={detailRow}>
                    <strong>Recinto:</strong> {recintoName}
                </Text>
                <Text style={detailRow}>
                    <strong>Inicio:</strong> {startDateTime}
                </Text>
                <Text style={detailRow}>
                    <strong>Término:</strong> {endDateTime}
                </Text>
            </Section>

            {workerObservations && (
                <>
                    <Text style={observationsTitle}>
                        <strong>Observaciones del equipo municipal:</strong>
                    </Text>
                    <Section style={observationsBox}>
                        <Text style={observationsText}>{workerObservations}</Text>
                    </Section>
                </>
            )}

            <Text style={text}>
                Ya puedes proceder con la organización de tu curso o evento. Recuerda cumplir con todos los requisitos establecidos.
            </Text>

            <Text style={text}>
                ¡Mucho éxito con tu actividad!
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
    backgroundColor: '#ecfdf5',
    border: `2px solid ${successGreen}`,
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

const observationsTitle = {
    color: '#1f2937',
    fontSize: '16px',
    margin: '24px 0 8px',
}

const observationsBox = {
    backgroundColor: '#f9fafb',
    borderLeft: `4px solid ${brandBlue}`,
    padding: '16px',
    margin: '8px 0 24px',
}

const observationsText = {
    color: '#374151',
    fontSize: '15px',
    lineHeight: '22px',
    margin: '0',
    fontStyle: 'italic' as const,
}

export default SolicitudAprobada
