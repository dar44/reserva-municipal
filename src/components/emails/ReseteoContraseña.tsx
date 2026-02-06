import { Button, Heading, Text, Section } from '@react-email/components'
import * as React from 'react'
import BaseEmailLayout from './BaseEmailLayout'

interface ReseteoContraseñaProps {
    recipientName?: string
    resetPasswordUrl: string
}

const brandBlue = '#3B82F6'
const warningAmber = '#f59e0b'

export const ReseteoContraseña = ({
    recipientName,
    resetPasswordUrl,
}: ReseteoContraseñaProps) => {
    return (
        <BaseEmailLayout preview="Restablecer tu contraseña - ServiMunicipal">
            <Heading style={h1}>Restablecer Contraseña</Heading>

            <Text style={text}>
                {recipientName ? `Hola ${recipientName},` : 'Hola,'}
            </Text>

            <Text style={text}>
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ServiMunicipal.
            </Text>

            <Button
                href={resetPasswordUrl}
                style={button}
            >
                Restablecer Mi Contraseña
            </Button>

            <Section style={securityBox}>
                <Text style={securityTitle}>
                    Información de Seguridad
                </Text>
                <Text style={securityText}>
                    • Este enlace es válido solo por <strong>24 horas</strong> por tu seguridad
                </Text>
                <Text style={securityText}>
                    • Si no solicitaste este cambio, simplemente ignora este correo
                </Text>
                <Text style={securityText}>
                    • Tu contraseña actual seguirá funcionando si no usas este enlace
                </Text>
            </Section>

            <Text style={warningText}>
                <strong>¿No fuiste tú?</strong> Si no solicitaste restablecer tu contraseña, alguien más pudo haber ingresado tu correo por error. Tu cuenta sigue segura y puedes ignorar este mensaje.
            </Text>

            <Text style={text}>
                Si tienes problemas con el botón de arriba, copia y pega este enlace en tu navegador:
            </Text>

            <Text style={linkText}>
                {resetPasswordUrl}
            </Text>

            <Text style={text}>
                ¿Necesitas ayuda? Contáctanos respondiendo a este correo.
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

const securityBox = {
    backgroundColor: '#f0fdf4',
    border: '2px solid #22c55e',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
}

const securityTitle = {
    color: '#166534',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 12px',
}

const securityText = {
    color: '#15803d',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '6px 0',
}

const warningText = {
    color: '#92400e',
    backgroundColor: '#fef3c7',
    padding: '16px',
    borderRadius: '6px',
    fontSize: '15px',
    lineHeight: '22px',
    margin: '24px 0',
    borderLeft: `4px solid ${warningAmber}`,
}

const linkText = {
    color: brandBlue,
    fontSize: '13px',
    lineHeight: '18px',
    margin: '8px 0',
    wordBreak: 'break-all' as const,
    fontFamily: 'monospace',
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '4px',
}

export default ReseteoContraseña
