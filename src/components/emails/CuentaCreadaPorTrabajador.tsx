import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import BaseEmailLayout from './BaseEmailLayout'

interface CuentaCreadaPorTrabajadorProps {
    recipientName: string
    email: string
    context: 'reserva' | 'inscripcion'
    resetPasswordUrl: string
}

const brandBlue = '#3B82F6'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const CuentaCreadaPorTrabajador = ({
    recipientName,
    email,
    context,
    resetPasswordUrl,
}: CuentaCreadaPorTrabajadorProps) => {
    const contextText = context === 'reserva' ? 'una reserva' : 'una inscripción a un curso'

    return (
        <BaseEmailLayout preview="Bienvenido a ServiMunicipal - Configura tu cuenta">
            <Heading style={h1}>¡Bienvenido a ServiMunicipal!</Heading>

            <Text style={text}>Hola {recipientName},</Text>

            <Text style={text}>
                Un funcionario municipal ha creado una cuenta para ti mientras procesaba {contextText}.
                ¡Excelentes noticias! Esto te permitirá acceder a todos nuestros servicios en línea.
            </Text>

            <Section style={infoBox}>
                <Text style={infoText}>
                    <strong>Tu correo electrónico:</strong> {email}
                </Text>
                <Text style={infoText}>
                    Para proteger tu cuenta, necesitas establecer tu propia contraseña.
                </Text>
            </Section>

            <Button
                href={resetPasswordUrl}
                style={button}
            >
                Establecer Mi Contraseña
            </Button>

            <Text style={text}>
                Una vez que hayas establecido tu contraseña, podrás:
            </Text>

            <ul style={list}>
                <li style={listItem}>Gestionar tus reservas e inscripciones</li>
                <li style={listItem}>Realizar nuevas reservas de recintos</li>
                <li style={listItem}>Inscribirte en cursos y talleres</li>
                <li style={listItem}>Ver el historial de todos tus servicios</li>
            </ul>

            <Text style={noteText}>
                <strong>Nota importante:</strong> El enlace para establecer tu contraseña expira en 24 horas por seguridad.
            </Text>

            <Text style={text}>
                Si tienes alguna pregunta, estamos aquí para ayudarte.
            </Text>

            <Text style={text}>
                ¡Bienvenido a la comunidad!
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

const infoBox = {
    backgroundColor: '#eff6ff',
    border: `2px solid ${brandBlue}`,
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
}

const infoText = {
    color: '#1e40af',
    fontSize: '15px',
    lineHeight: '22px',
    margin: '8px 0',
}

const button = {
    backgroundColor: brandBlue,
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '14px 36px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    margin: '24px 0',
}

const list = {
    margin: '16px 0',
    paddingLeft: '20px',
}

const listItem = {
    color: '#374151',
    fontSize: '15px',
    lineHeight: '24px',
    margin: '6px 0',
}

const noteText = {
    color: '#92400e',
    backgroundColor: '#fef3c7',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '24px 0',
}

export default CuentaCreadaPorTrabajador
