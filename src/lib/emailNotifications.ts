import { getResendClient } from "./resend";
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

function getFromEmail(): string | null {
  const value = process.env.RESEND_FROM_EMAIL?.trim();
  return value ? value : null;
}

function isEmailConfigured(): boolean {
  return Boolean(getFromEmail() && process.env.RESEND_API_KEY?.trim());
}

function logMissingConfig(): void {
  if (!isEmailConfigured()) {
    console.warn("Resend no está configurado. Define RESEND_API_KEY y RESEND_FROM_EMAIL para enviar correos.");
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

async function sendEmailMessage({ to, subject, html, text }: { to: string; subject: string; html: string; text: string; }): Promise<boolean> {
  const fromEmail = getFromEmail();
  const resend = getResendClient();

  if (!fromEmail || !resend) {
    logMissingConfig();
    console.warn('[EMAIL] Skipped (config):', { from: fromEmail, to, subject })
    return false;
  }
  console.log('[EMAIL] Sending via Resend:', { from: fromEmail, to, subject })
  try {
    const res = await resend.emails.send({ from: fromEmail, to, subject, html, text });
    console.log('[EMAIL] Resend OK:', res?.data?.id ?? res)
    return true;
  } catch (error) {
    console.error('[EMAIL] Resend ERROR:', error)
    return false;
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
  if (!isEmailConfigured()) {
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
  const priceLabel = formatCurrency(amount, currency);
  const startLabel = formatDateTime(reserva.start_at) ?? reserva.start_at;
  const endLabel = formatDateTime(reserva.end_at) ?? reserva.end_at;
  const recintoName = reserva.recintos?.name ?? "tu reserva";
  const recintoAddress = reserva.recintos?.ubication ?? "";

  const html = await render(ReservaConfirmada({
    recipientName,
    recintoName,
    startDateTime: startLabel,
    endDateTime: endLabel,
    ubicacion: recintoAddress,
    monto: priceLabel,
  }));

  await sendEmailMessage({
    to: user.email,
    subject: `Reserva confirmada - ${recintoName}`,
    html,
    text: "Confirmación de tu reserva",
  });
  console.log(`[EMAIL] Resend OK: reserva confirmada enviado a ${user.email}`);
}

export async function sendInscripcionPagoConfirmadoEmail(
  inscripcionId: number
): Promise<void> {
  if (!isEmailConfigured()) {
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
  const location = curso.location ?? "";
  const startDate = formatDate(curso.begining_date) ?? "";
  const endDate = formatDate(curso.end_date) ?? "";
  const amount = Number(curso.price ?? 0);
  const currency = getConfiguredCurrency();
  const priceLabel = formatCurrency(amount, currency);

  const html = await render(InscripcionConfirmada({
    recipientName,
    cursoName,
    fechaInicio: startDate,
    fechaFin: endDate,
    ubicacion: location,
    monto: priceLabel,
  }));

  await sendEmailMessage({
    to: user.email,
    subject: `Inscripción confirmada - ${cursoName}`,
    html,
    text: "Confirmación de tu inscripción",
  });
  console.log(`[EMAIL] Resend OK: inscripción confirmada enviado a ${user.email}`);
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
 * Envía un email de confirmación de registro cuando un usuario se registra.
 * Versión directa: recibe los datos del usuario ya disponibles (sin consultar la BD).
 * Usar esta versión desde /api/signup para evitar la race condition con el trigger
 * de inserción en public.users (que puede no haberse ejecutado aún en producción).
 */
export async function sendRegistroConfirmadoEmailDirect(user: {
  email: string;
  name?: string;
  surname?: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    logMissingConfig();
    return;
  }

  const recipientName = getRecipientName({
    email: user.email,
    name: user.name ?? null,
    surname: user.surname ?? null,
  });

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
 * Envía un email de confirmación de registro cuando un usuario se registra.
 * Versión legacy: consulta la BD por uid. Puede fallar en producción por race
 * condition con el trigger — usar sendRegistroConfirmadoEmailDirect en su lugar.
 */
export async function sendRegistroConfirmadoEmail(userUid: string): Promise<void> {
  if (!isEmailConfigured()) {
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
 * Envía un email cuando un trabajador aprueba una solicitud de recinto de un organizador.
 * Versión directa: recibe los datos ya disponibles sin consultar la BD.
 */
export async function sendSolicitudAprobadaEmailDirect(opts: {
  organizerEmail: string;
  organizerName: string | null;
  organizerSurname: string | null;
  recintoName: string;
  startAt: string;
  endAt: string;
  observations: string | null;
}): Promise<void> {
  if (!isEmailConfigured()) {
    logMissingConfig();
    return;
  }

  const recipientName = getRecipientName({
    email: opts.organizerEmail,
    name: opts.organizerName,
    surname: opts.organizerSurname,
  });
  const startDateTime = formatDateTime(opts.startAt) ?? opts.startAt;
  const endDateTime = formatDateTime(opts.endAt) ?? opts.endAt;
  const recintoName = opts.recintoName || 'Recinto solicitado';

  const html = await render(SolicitudAprobada({
    recipientName,
    recintoName,
    startDateTime,
    endDateTime,
    workerObservations: opts.observations || undefined,
  }));

  const subject = `Solicitud aprobada - ${recintoName}`;
  const text = `Hola ${recipientName},\n\nTu solicitud de recinto ha sido aprobada.\n\nRecinto: ${recintoName}\nInicio: ${startDateTime}\nTérmino: ${endDateTime}\n\n¡Mucho éxito con tu actividad!`;

  await sendEmailMessage({ to: opts.organizerEmail, subject, html, text });
}

/**
 * Envía un email cuando un trabajador aprueba una solicitud de recinto de un organizador.
 * Versión legacy: consulta la BD. Usar sendSolicitudAprobadaEmailDirect en su lugar.
 */
export async function sendSolicitudAprobadaEmail(reservaId: number): Promise<void> {
  if (!isEmailConfigured()) {
    logMissingConfig();
    return;
  }

  // Obtener datos de la curso_reserva
  const { data: reserva, error } = await supabaseAdmin
    .from('curso_reservas')
    .select('id,organizer_uid,recinto_id,start_at,end_at,observations,recintos(name)')
    .eq('id', reservaId)
    .maybeSingle();

  if (error) {
    console.error('Error obteniendo datos de curso_reserva para email', error);
    return;
  }

  if (!reserva || !reserva.organizer_uid) {
    console.warn('No se pudo enviar email de aprobación: reserva sin organizador');
    return;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email,name,surname')
    .eq('uid', reserva.organizer_uid)
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
 * Envía un email cuando un trabajador rechaza una solicitud de recinto de un organizador.
 * Versión directa: recibe los datos ya disponibles sin consultar la BD.
 */
export async function sendSolicitudRechazadaEmailDirect(opts: {
  organizerEmail: string;
  organizerName: string | null;
  organizerSurname: string | null;
  recintoName: string;
  startAt: string;
  endAt: string;
  observations: string | null;
}): Promise<void> {
  if (!isEmailConfigured()) {
    logMissingConfig();
    return;
  }

  const recipientName = getRecipientName({
    email: opts.organizerEmail,
    name: opts.organizerName,
    surname: opts.organizerSurname,
  });
  const startDateTime = formatDateTime(opts.startAt) ?? opts.startAt;
  const endDateTime = formatDateTime(opts.endAt) ?? opts.endAt;
  const recintoName = opts.recintoName || 'Recinto solicitado';

  const html = await render(SolicitudRechazada({
    recipientName,
    recintoName,
    startDateTime,
    endDateTime,
    rejectReason: opts.observations || undefined,
  }));

  const subject = `Actualización de tu solicitud - ${recintoName}`;
  const text = `Hola ${recipientName},\n\nTu solicitud de recinto ha sido rechazada.\n\nRecinto: ${recintoName}\nInicio: ${startDateTime}\nTérmino: ${endDateTime}\n\nTe invitamos a revisar los requisitos y presentar una nueva solicitud.`;

  await sendEmailMessage({ to: opts.organizerEmail, subject, html, text });
}

/**
 * Envía un email cuando un trabajador rechaza una solicitud de recinto de un organizador.
 * Versión legacy: consulta la BD. Usar sendSolicitudRechazadaEmailDirect en su lugar.
 */
export async function sendSolicitudRechazadaEmail(reservaId: number): Promise<void> {
  if (!isEmailConfigured()) {
    logMissingConfig();
    return;
  }

  // Obtener datos de la curso_reserva
  const { data: reserva, error } = await supabaseAdmin
    .from('curso_reservas')
    .select('id,organizer_uid,recinto_id,start_at,end_at,observations,recintos(name)')
    .eq('id', reservaId)
    .maybeSingle();

  if (error) {
    console.error('Error obteniendo datos de curso_reserva para email', error);
    return;
  }

  if (!reserva || !reserva.organizer_uid) {
    console.warn('No se pudo enviar email de rechazo: reserva sin organizador');
    return;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email,name,surname')
    .eq('uid', reserva.organizer_uid)
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
): Promise<boolean> {
  if (!isEmailConfigured()) {
    logMissingConfig();
    return false;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email,name,surname')
    .eq('uid', userUid)
    .maybeSingle<UserRecord>();

  if (userError) {
    console.error('Error obteniendo datos del usuario para email de cuenta creada', userError);
    return false;
  }

  if (!user || !user.email) {
    console.warn('No se pudo enviar email de cuenta creada: usuario sin email');
    return false;
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
    return false;
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

  return sendEmailMessage({
    to: user.email,
    subject,
    html,
    text,
  });
}

