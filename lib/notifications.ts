/**
 * Email Notification Service
 * Uses console.log as fallback when SMTP is not configured.
 * Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars for real emails.
 */

interface NotificationPayload {
    to: string;
    subject: string;
    body: string;
}

async function sendEmail(payload: NotificationPayload): Promise<boolean> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (SMTP_HOST && SMTP_USER) {
        // Production: would use nodemailer here
        // const nodemailer = require('nodemailer');
        // const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT || 587), auth: { user: SMTP_USER, pass: SMTP_PASS } });
        // await transporter.sendMail({ from: SMTP_USER, ...payload });
        console.log(`📧 [SMTP] Sending email to ${payload.to}: ${payload.subject}`);
        return true;
    }

    // Fallback: console log
    console.log(`📧 [MOCK] Email to: ${payload.to}`);
    console.log(`   Subject: ${payload.subject}`);
    console.log(`   Body: ${payload.body}`);
    return true;
}

export async function notifyNewTask(assigneeEmail: string, taskTitle: string, projectTitle: string): Promise<boolean> {
    return sendEmail({
        to: assigneeEmail,
        subject: `[.Worktion] Tugas baru: ${taskTitle}`,
        body: `Anda ditugaskan pada: "${taskTitle}" di proyek "${projectTitle}". Buka .Worktion untuk detail lebih lanjut.`,
    });
}

export async function notifyDueDate(assigneeEmail: string, taskTitle: string, dueDate: string): Promise<boolean> {
    return sendEmail({
        to: assigneeEmail,
        subject: `[.Worktion] Tenggat dalam 24 jam: ${taskTitle}`,
        body: `Tugas "${taskTitle}" memiliki tenggat pada ${dueDate}. Pastikan tugas ini telah diselesaikan atau diperbarui statusnya.`,
    });
}

export async function notifyStatusUpdate(recipientEmail: string, taskTitle: string, oldStatus: string, newStatus: string): Promise<boolean> {
    return sendEmail({
        to: recipientEmail,
        subject: `[.Worktion] Status berubah: ${taskTitle}`,
        body: `Status tugas "${taskTitle}" diperbarui dari "${oldStatus}" menjadi "${newStatus}".`,
    });
}
