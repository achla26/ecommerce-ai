import { Resend } from 'resend';
import { config } from "@/config";

const emailConfig = config.get('email');

const mailClient = new Resend(emailConfig.resend);

const sender = 'Auth <onboarding@resend.dev>';

export { mailClient, sender }