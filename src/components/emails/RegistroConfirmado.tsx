import { Button, Heading, Text, Link } from '@react-email/components'
import * as React from 'react'
import BaseEmailLayout from './BaseEmailLayout'

interface RegistroConfirmadoProps {
    recipientName: string
    email: string
}

const brandBlue = '#3B82F6'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const RegistroConfirmado = ({
    recipientName,
    email,
}: RegistroConfirmadoProps) => {
    return (
        <BaseEmailLayout preview="¡Bienvenido a ServiMunicipal!">
            <Heading style={h1}>¡Bienvenido a ServiMunicipal!</Heading>

            <Text style={text}>Hola {recipientName},</Text>

            <Text style={text}>
                Tu cuenta ha sido creada exitosamente. Ya puedes acceder a todos nuestros servicios municipales.
            </Text>

            <Text style={text}>
                <strong>Tu correo registrado:</strong> {email}
            </Text>

            <Text style={text}>
                Ahora puedes:
            </Text>

            <ul style={list}>
                <li style={listItem}>Reservar recintos deportivos y espacios públicos</li>
                <li style={listItem}>Inscribirte en cursos y talleres municipales</li>
                <li style={listItem}>Gestionar tus reservas e inscripciones</li>
            </ul>

            <Button
                href={`${siteUrl}/login`}
                style={button}
            >
                Iniciar Sesión
            </Button>

            <Text style={text}>
                Si tienes alguna pregunta, no dudes en contactarnos.
            </Text>

            <Text style={text}>
                ¡Bienvenido!
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

const list = {
    margin: '16px 0',
    paddingLeft: '20px',
}

const listItem = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '8px 0',
}

const button = {
    backgroundColor: brandBlue,
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '12px 32px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    margin: '24px 0',
}

export default RegistroConfirmado
