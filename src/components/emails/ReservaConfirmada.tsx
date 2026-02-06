import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import BaseEmailLayout from './BaseEmailLayout'

interface ReservaConfirmadaProps {
    recipientName: string
    recintoName: string
    startDateTime: string
    endDateTime: string
    ubicacion?: string
    monto: string
}

const brandBlue = '#3B82F6'

export const ReservaConfirmada = ({
    recipientName,
    recintoName,
    startDateTime,
    endDateTime,
    ubicacion,
    monto,
}: ReservaConfirmadaProps) => {
    return (
        <BaseEmailLayout preview={`Confirmación de reserva - ${recintoName}`}>
            <Heading style={h1}>¡Reserva Confirmada!</Heading>

            <Text style={text}>Hola {recipientName},</Text>

            <Text style={text}>
                Hemos recibido el pago de tu reserva. Estos son los detalles:
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
                {ubicacion && (
                    <Text style={detailRow}>
                        <strong>Dirección:</strong> {ubicacion}
                    </Text>
                )}
                <Text style={detailRow}>
                    <strong>Monto:</strong> {monto}
                </Text>
            </Section>

            <Text style={text}>
                Te recomendamos llegar con unos minutos de anticipación y tener a mano esta confirmación.
            </Text>

            <Text style={text}>
                ¡Gracias por utilizar los servicios municipales!
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

export default ReservaConfirmada
