import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Text,
    Heading,
    Hr,
    Link,
} from '@react-email/components'
import * as React from 'react'

interface BaseEmailLayoutProps {
    preview: string
    children: React.ReactNode
}

// Color azul del dark mode para consistencia
const brandBlue = '#3B82F6'

export const BaseEmailLayout = ({ preview, children }: BaseEmailLayoutProps) => {
    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header con branding */}
                    <Section style={header}>
                        <Heading style={headerTitle}>ServiMunicipal</Heading>
                    </Section>

                    {/* Contenido principal */}
                    <Section style={content}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Hr style={hr} />
                    <Section style={footer}>
                        <Text style={footerText}>
                            Este correo electrónico fue enviado por ServiMunicipal
                        </Text>
                        <Text style={footerText}>
                            Si tienes alguna pregunta, contáctanos respondiendo a este correo
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}

// Estilos
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
}

const header = {
    padding: '32px 32px 20px',
    backgroundColor: brandBlue,
}

const headerTitle = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
    padding: '0',
    textAlign: 'center' as const,
}

const content = {
    padding: '0 32px',
}

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
}

const footer = {
    padding: '0 32px',
}

const footerText = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '4px 0',
    textAlign: 'center' as const,
}

export default BaseEmailLayout
