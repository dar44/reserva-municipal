import { resend } from "./resend";
import { supabaseAdmin } from "./supabaseAdmin";
import { formatCurrency } from "./currency";
import { getConfiguredCurrency } from "./config";
import type { PagoEstado } from "./pagos";
import { render } from '@react-email/components';
import ReservaConfirmada from '@/components/emails/ReservaConfirmada';
import InscripcionConfirmada from '@/components/emails/InscripcionConfirmada';
import RegistroConfirmado from '@/components/emails/RegistroConfirmado';
import SolicitudAprobada from '@/components/emails/SolicitudAprobada';
import SolicitudRechazada from '@/components/emails/SolicitudRechazada';
import CuentaCreadaPorTrabajador from '@/components/emails/CuentaCreadaPorTrabajador';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const IS_EMAIL_CONFIGURED = Boolean(FROM_EMAIL && process.env.RESEND_API_KEY);

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "full",
  timeStyle: "short"
});

const DATE_FORMAT = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "long"
});

type ReservaEmailRecord = {
  id: number | string;
  user_uid: string | null;
  start_at: string;
  end_at: string;
  price: number | string | null;
  recintos: {
    name: string | null;
    ubication: string | null;
  } | null;
};

type UserRecord = {
  email: string | null;
  name: string | null;
  surname: string | null;
};

type InscripcionEmailRecord = {
  id: number | string;
  user_uid: string | null;
  cursos: {
    name: string | null;
    location: string | null;
    begining_date: string | null;
    end_date: string | null;
    price: number | string | null;
  } | null;
};

function logMissingConfig(): void {
  if (!IS_EMAIL_CONFIGURED) {
    console.warn("Resend no está configurado. Se omite el envío de correos.");
  }
}

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return DATE_TIME_FORMAT.format(date);
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return DATE_FORMAT.format(date);
}

function getRecipientName(user: UserRecord): string {
  const parts = [user.name, user.surname].filter(Boolean);
  if (parts.length === 0) {
    return user.email ?? "";
  }
  return parts.join(" ");
}

async function sendEmailMessage({ to, subject, html, text }: { to: string; subject: string; html: string; text: string; }): Promise<void> {
  if (!IS_EMAIL_CONFIGURED || !FROM_EMAIL) {
    logMissingConfig();
    console.warn('[EMAIL] Skipped (config):', { from: FROM_EMAIL, to, subject })
    return;
  }
  console.log('[EMAIL] Sending via Resend:', { from: FROM_EMAIL, to, subject })
  try {
    const res = await resend.emails.send({ from: FROM_EMAIL, to, subject, html, text });
    console.log('[EMAIL] Resend OK:', res?.data?.id ?? res)
  } catch (error) {
    console.error('[EMAIL] Resend ERROR:', error)
  }
}


function normalizeNumericId(
  value: number | string | null | undefined
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function sendReservaPagoConfirmadoEmail(
  reservaId: number
): Promise<void> {
  if (!IS_EMAIL_CONFIGURED) {
    logMissingConfig();
    return;
  }

  const { data: reserva, error } = await supabaseAdmin
    .from("reservas")
    .select(
      "id,user_uid,start_at,end_at,price,recintos(name,ubication)"
    )
    .eq("id", reservaId)
    .maybeSingle<ReservaEmailRecord>();

  if (error) {
    console.error("Error obteniendo datos de la reserva para email", error);
    return;
  }

  if (!reserva || !reserva.user_uid) {
    return;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("email,name,surname")
    .eq("uid", reserva.user_uid)
    .maybeSingle<UserRecord>();

  if (userError) {
    console.error("Error obteniendo datos del usuario para email", userError);
    return;
  }

  if (!user || !user.email) {
    return;
  }

  const recipientName = getRecipientName(user);
  const currency = getConfiguredCurrency();
  const amount = Number(reserva.price ?? 0);
  const priceLabel = amount > 0 ? formatCurrency(amount, currency) : "Gratis";
  const startLabel = formatDateTime(reserva.start_at);
  const endLabel = formatDateTime(reserva.end_at);
  const recintoName = reserva.recintos?.name ?? "tu reserva";
  const recintoAddress = reserva.recintos?.ubication;

  const subject = `Pago confirmado - ${recintoName}`;
  const htmlLines = [
    `<p>Hola ${recipientName || ""},</p>`,
    "<p>Hemos recibido el pago de tu reserva. Estos son los detalles:</p>",
    "<ul>",
    `<li><strong>Recinto:</strong> ${recintoName}</li>`,
    startLabel ? `<li><strong>Inicio:</strong> ${startLabel}</li>` : null,
    endLabel ? `<li><strong>Término:</strong> ${endLabel}</li>` : null,
    recintoAddress ? `<li><strong>Dirección:</strong> ${recintoAddress}</li>` : null,
    `<li><strong>Monto:</strong> ${priceLabel}</li>`,
    "</ul>",
    "<p>Te recomendamos llegar con unos minutos de anticipación y tener a mano esta confirmación.</p>",
    "<p>¡Gracias por utilizar los servicios municipales!</p>"
  ].filter(Boolean);

  const html = `<div style="font-family: Arial, sans-serif; color: #1f2937;">${htmlLines.join("")}</div>`;

  const textParts = [
    `Hola ${recipientName || ""},`,
    "",
    "Hemos recibido el pago de tu reserva. Estos son los detalles:",
    `- Recinto: ${recintoName}`
  ];
  if (startLabel) textParts.push(`- Inicio: ${startLabel}`);
  if (endLabel) textParts.push(`- Término: ${endLabel}`);
  if (recintoAddress) textParts.push(`- Dirección: ${recintoAddress}`);
  textParts.push(`- Monto: ${priceLabel}`, "", "¡Gracias por utilizar los servicios municipales!");

  await sendEmailMessage({
    to: user.email,
    subject,
    html,
    text: textParts.join("\n")
  });
}

export async function sendInscripcionPagoConfirmadoEmail(
  inscripcionId: number
): Promise<void> {
  if (!IS_EMAIL_CONFIGURED) {
    logMissingConfig();
    return;
  }

  const { data: inscripcion, error } = await supabaseAdmin
    .from("inscripciones")
    .select(
      "id,user_uid,cursos(name,location,begining_date,end_date,price)"
    )
    .eq("id", inscripcionId)
    .maybeSingle<InscripcionEmailRecord>();

  if (error) {
    console.error(
      "Error obteniendo datos de la inscripción para email",
      error
    );
    return;
  }

  if (!inscripcion || !inscripcion.user_uid || !inscripcion.cursos) {
    return;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("email,name,surname")
    .eq("uid", inscripcion.user_uid)
    .maybeSingle<UserRecord>();

  if (userError) {
    console.error("Error obteniendo datos del usuario para email", userError);
    return;
  }

  if (!user || !user.email) {
    return;
  }

  const recipientName = getRecipientName(user);
  const curso = inscripcion.cursos;
  const cursoName = curso.name ?? "tu curso";
  const location = curso.location;
  const startDate = formatDate(curso.begining_date);
  const endDate = formatDate(curso.end_date);
  const amount = Number(curso.price ?? 0);
  const currency = getConfiguredCurrency();
  const priceLabel = amount > 0 ? formatCurrency(amount, currency) : "Gratis";

  const subject = `Pago confirmado - ${cursoName}`;
  const htmlLines = [
    `<p>Hola ${recipientName || ""},</p>`,
    "<p>Tu inscripción ha quedado confirmada. Toma nota de la información del curso:</p>",
    "<ul>",
    `<li><strong>Curso:</strong> ${cursoName}</li>`,
    startDate ? `<li><strong>Comienzo:</strong> ${startDate}</li>` : null,
    endDate ? `<li><strong>Finaliza:</strong> ${endDate}</li>` : null,
    location ? `<li><strong>Lugar:</strong> ${location}</li>` : null,
    `<li><strong>Monto:</strong> ${priceLabel}</li>`,
    "</ul>",
    "<p>Si necesitas reprogramar o cancelar, ponte en contacto con nosotros con anticipación.</p>",
    "<p>¡Te esperamos!</p>"
  ].filter(Boolean);

  const html = `<div style="font-family: Arial, sans-serif; color: #1f2937;">${htmlLines.join("")}</div>`;

  const textParts = [
    `Hola ${recipientName || ""},`,
    "",
    "Tu inscripción ha quedado confirmada. Información del curso:",
    `- Curso: ${cursoName}`
  ];
  if (startDate) textParts.push(`- Comienzo: ${startDate}`);
  if (endDate) textParts.push(`- Finaliza: ${endDate}`);
  if (location) textParts.push(`- Lugar: ${location}`);
  textParts.push(`- Monto: ${priceLabel}`, "", "¡Te esperamos!");

  await sendEmailMessage({
    to: user.email,
    subject,
    html,
    text: textParts.join("\n")
  });
}

export async function notifyPagoSiPagadoOnce(opts: {
  pagoId: string
  estado: PagoEstado
  reservaId?: number | null
  inscripcionId?: number | null
}): Promise<void> {
  const { pagoId, estado, reservaId, inscripcionId } = opts
  if (estado !== 'pagado') return

  const kinds: Array<'pago_reserva' | 'pago_inscripcion'> = []
  if (typeof reservaId === 'number') kinds.push('pago_reserva')
  if (typeof inscripcionId === 'number') kinds.push('pago_inscripcion')
  if (kinds.length === 0) return

  for (const kind of kinds) {
    // ¿ya se envió este correo para este pago?
    const { data: existing, error: existsErr } = await supabaseAdmin
      .from('email_events')
      .select('id')
      .eq('pago_id', pagoId)
      .eq('kind', kind)
      .maybeSingle()

    if (existsErr) {
      console.error('[EMAIL] error comprobando email_events', existsErr)
      continue
    }
    if (existing?.id) {
      // ya enviado; saltar
      continue
    }

    try {
      if (kind === 'pago_reserva' && typeof reservaId === 'number') {
        await sendReservaPagoConfirmadoEmail(reservaId)
      }
      if (kind === 'pago_inscripcion' && typeof inscripcionId === 'number') {
        await sendInscripcionPagoConfirmadoEmail(inscripcionId)
      }

      // Registrar para idempotencia
      await supabaseAdmin.from('email_events').insert({
        pago_id: pagoId,
        kind
      })
    } catch (e) {
      console.error('[EMAIL] fallo enviando email o insertando email_events', { kind, pagoId, e })
    }
  }
}

export async function notifyPagoConfirmado({ previousEstado, nextEstado, reservaId, inscripcionId }: {
  previousEstado: PagoEstado | null;
  nextEstado: PagoEstado;
  reservaId?: number | null;
  inscripcionId?: number | null;
}): Promise<void> {
  console.log('[EMAIL] notifyPagoConfirmado', { previousEstado, nextEstado, reservaId, inscripcionId })

  if (nextEstado !== "pagado" || previousEstado === "pagado") {
    console.log('[EMAIL] no-op (no es transición a pagado)')
    return;
  }

  const tasks: Promise<void>[] = [];
  if (typeof reservaId === "number") tasks.push(sendReservaPagoConfirmadoEmail(reservaId));
  if (typeof inscripcionId === "number") tasks.push(sendInscripcionPagoConfirmadoEmail(inscripcionId));

  if (tasks.length === 0) {
    console.warn('[EMAIL] no recipient ids (reservaId/inscripcionId vacíos). No se envía.')
    return;
  }

  await Promise.all(tasks);
  console.log('[EMAIL] envío(s) lanzado(s)')
}

// ===== Nueva funciones de email con React Email =====

/**
 * Envía un email de confirmación de registro cuando un usuario se registra
 */
export async function sendRegistroConfirmadoEmail(userUid: string): Promise<void> {
  if (!IS_EMAIL_CONFIGURED) {
    logMissingConfig();
    return;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email,name,surname')
    .eq('uid', userUid)
    .maybeSingle<UserRecord>();

  if (userError) {
    console.error('Error obteniendo datos del usuario para email de registro', userError);
    return;
  }

  if (!user || !user.email) {
    console.warn('No se pudo enviar email de registro: usuario sin email');
    return;
  }

  const recipientName = getRecipientName(user);

  const html = await render(RegistroConfirmado({
    recipientName,
    email: user.email,
  }));

  const subject = '¡Bienvenido a ServiMunicipal!';
  const text = `Hola ${recipientName},\n\nTu cuenta ha sido creada exitosamente. Ya puedes acceder a todos nuestros servicios municipales.\n\n¡Bienvenido!`;

  await sendEmailMessage({
    to: user.email,
    subject,
    html,
    text,
  });
}

/**
 * Envía un email cuando un trabajador aprueba una solicitud de recinto de un organizador
 */
export async function sendSolicitudAprobadaEmail(reservaId: number): Promise<void> {
  if (!IS_EMAIL_CONFIGURED) {
    logMissingConfig();
    return;
  }

  // Obtener datos de la curso_reserva
  const { data: reserva, error } = await supabaseAdmin
    .from('curso_reservas')
    .select('id,user_uid,recinto_id,start_at,end_at,observations,recintos(name)')
    .eq('id', reservaId)
    .maybeSingle();

  if (error) {
    console.error('Error obteniendo datos de curso_reserva para email', error);
    return;
  }

  if (!reserva || !reserva.user_uid) {
    console.warn('No se pudo enviar email de aprobación: reserva sin usuario');
    return;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email,name,surname')
    .eq('uid', reserva.user_uid)
    .maybeSingle<UserRecord>();

  if (userError) {
    console.error('Error obteniendo datos del usuario para email de aprobación', userError);
    return;
  }

  if (!user || !user.email) {
    console.warn('No se pudo enviar email de aprobación: usuario sin email');
    return;
  }

  const recipientName = getRecipientName(user);
  // Handle recintos being either an object or array from the join
  const recintos: any = reserva.recintos;
  const recintoName = (recintos && !Array.isArray(recintos) && recintos.name) || 'Recinto solicitado';
  const startDateTime = formatDateTime(reserva.start_at) ?? reserva.start_at;
  const endDateTime = formatDateTime(reserva.end_at) ?? reserva.end_at;

  const html = await render(SolicitudAprobada({
    recipientName,
    recintoName,
    startDateTime,
    endDateTime,
    workerObservations: reserva.observations || undefined,
  }));

  const subject = `Solicitud aprobada - ${recintoName}`;
  const text = `Hola ${recipientName},\n\nTu solicitud de recinto ha sido aprobada.\n\nRecinto: ${recintoName}\nInicio: ${startDateTime}\nTérmino: ${endDateTime}\n\n¡Mucho éxito con tu actividad!`;

  await sendEmailMessage({
    to: user.email,
    subject,
    html,
    text,
  });
}

/**
 * Envía un email cuando un trabajador rechaza una solicitud de recinto de un organizador
 */
export async function sendSolicitudRechazadaEmail(reservaId: number): Promise<void> {
  if (!IS_EMAIL_CONFIGURED) {
    logMissingConfig();
    return;
  }

  // Obtener datos de la curso_reserva
  const { data: reserva, error } = await supabaseAdmin
    .from('curso_reservas')
    .select('id,user_uid,recinto_id,start_at,end_at,observations,recintos(name)')
    .eq('id', reservaId)
    .maybeSingle();

  if (error) {
    console.error('Error obteniendo datos de curso_reserva para email', error);
    return;
  }

  if (!reserva || !reserva.user_uid) {
    console.warn('No se pudo enviar email de rechazo: reserva sin usuario');
    return;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email,name,surname')
    .eq('uid', reserva.user_uid)
    .maybeSingle<UserRecord>();

  if (userError) {
    console.error('Error obteniendo datos del usuario para email de rechazo', userError);
    return;
  }

  if (!user || !user.email) {
    console.warn('No se pudo enviar email de rechazo: usuario sin email');
    return;
  }

  const recipientName = getRecipientName(user);
  // Handle recintos being either an object or array from the join
  const recintos: any = reserva.recintos;
  const recintoName = (recintos && !Array.isArray(recintos) && recintos.name) || 'Recinto solicitado';
  const startDateTime = formatDateTime(reserva.start_at) ?? reserva.start_at;
  const endDateTime = formatDateTime(reserva.end_at) ?? reserva.end_at;

  const html = await render(SolicitudRechazada({
    recipientName,
    recintoName,
    startDateTime,
    endDateTime,
    rejectReason: reserva.observations || undefined,
  }));

  const subject = `Actualización de tu solicitud - ${recintoName}`;
  const text = `Hola ${recipientName},\n\nTu solicitud de recinto ha sido rechazada.\n\nRecinto: ${recintoName}\nInicio: ${startDateTime}\nTérmino: ${endDateTime}\n\nTe invitamos a revisar los requisitos y presentar una nueva solicitud.`;

  await sendEmailMessage({
    to: user.email,
    subject,
    html,
    text,
  });
}

/**
 * Envía un email de bienvenida cuando un trabajador crea una cuenta para un ciudadano
 */
export async function sendCuentaCreadaPorTrabajadorEmail(
  userUid: string,
  context: 'reserva' | 'inscripcion'
): Promise<void> {
  if (!IS_EMAIL_CONFIGURED) {
    logMissingConfig();
    return;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email,name,surname')
    .eq('uid', userUid)
    .maybeSingle<UserRecord>();

  if (userError) {
    console.error('Error obteniendo datos del usuario para email de cuenta creada', userError);
    return;
  }

  if (!user || !user.email) {
    console.warn('No se pudo enviar email de cuenta creada: usuario sin email');
    return;
  }

  const recipientName = getRecipientName(user);

  // Generar el enlace de reseteo de contraseña
  const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Trigger password reset to get the URL
  const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: user.email,
    options: {
      redirectTo: redirectUrl,
    }
  });

  if (resetError || !resetData) {
    console.error('Error generando enlace de reseteo para cuenta creada', resetError);
    // Fall back to regular reset
    await supabaseAdmin.auth.resetPasswordForEmail(user.email, { redirectTo: redirectUrl });
    return;
  }

  const resetPasswordUrl = resetData.properties.action_link;

  const html = await render(CuentaCreadaPorTrabajador({
    recipientName,
    email: user.email,
    context,
    resetPasswordUrl,
  }));

  const contextText = context === 'reserva' ? 'una reserva' : 'una inscripción';
  const subject = 'Bienvenido a ServiMunicipal - Configura tu cuenta';
  const text = `Hola ${recipientName},\n\nUn funcionario municipal ha creado una cuenta para ti mientras procesaba ${contextText}.\n\nPara establecer tu contraseña, visita:\n${resetPasswordUrl}\n\n¡Bienvenido!`;

  await sendEmailMessage({
    to: user.email,
    subject,
    html,
    text,
  });
}

