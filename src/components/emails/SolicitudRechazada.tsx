import { Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import BaseEmailLayout from './BaseEmailLayout'

interface SolicitudRechazadaProps {
    recipientName: string
    recintoName: string
    startDateTime: string
    endDateTime: string
    rejectReason?: string
}

const brandBlue = '#3B82F6'
const warningRed = '#ef4444'

export const SolicitudRechazada = ({
    recipientName,
    recintoName,
    startDateTime,
    endDateTime,
    rejectReason,
}: SolicitudRechazadaProps) => {
    return (
        <BaseEmailLayout preview={`Solicitud rechazada - ${recintoName}`}>
            <Heading style={h1}>Actualización de tu Solicitud</Heading>

            <Text style={text}>Hola {recipientName},</Text>

            <Text style={text}>
                Lamentamos informarte que tu solicitud de recinto ha sido <strong style={{ color: warningRed }}>rechazada</strong> en esta ocasión.
            </Text>

            <Section style={detailsBox}>
                <Text style={detailRow}>
                    <strong>Recinto solicitado:</strong> {recintoName}
                </Text>
                <Text style={detailRow}>
                    <strong>Fecha/hora solicitada (inicio):</strong> {startDateTime}
                </Text>
                <Text style={detailRow}>
                    <strong>Fecha/hora solicitada (término):</strong> {endDateTime}
                </Text>
            </Section>

            {rejectReason && (
                <>
                    <Text style={reasonTitle}>
                        <strong>Motivo del rechazo:</strong>
                    </Text>
                    <Section style={reasonBox}>
                        <Text style={reasonText}>{rejectReason}</Text>
                    </Section>
                </>
            )}

            <Text style={text}>
                Te invitamos a revisar los requisitos y presentar una nueva solicitud considerando las observaciones mencionadas. Estamos aquí para ayudarte a mejorar tu propuesta.
            </Text>

            <Text style={text}>
                Si tienes preguntas o necesitas orientación, no dudes en contactarnos.
            </Text>

            <Text style={text}>
                Saludos cordiales.
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
    backgroundColor: '#fef2f2',
    border: `2px solid ${warningRed}`,
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

const reasonTitle = {
    color: '#1f2937',
    fontSize: '16px',
    margin: '24px 0 8px',
}

const reasonBox = {
    backgroundColor: '#fff7ed',
    borderLeft: `4px solid ${warningRed}`,
    padding: '16px',
    margin: '8px 0 24px',
}

const reasonText = {
    color: '#9a3412',
    fontSize: '15px',
    lineHeight: '22px',
    margin: '0',
    fontWeight: '500' as const,
}

export default SolicitudRechazada
