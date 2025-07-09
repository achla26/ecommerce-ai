import { Resend } from 'resend';
import config from "@/config";

const mailClient = new Resend(config.RESEND_API_KEY);

const sender = 'Auth <onboarding@resend.dev>';

export { mailClient, sender }