import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis do .env

// Configuração do transporte SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT), // Converte a porta para número
    secure: false, // STARTTLS usa secure: false
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Pode ser necessário dependendo do provedor
    },
    logger: true, // Log detalhado
    debug: true, // Debug no console
});

// Função para enviar e-mails
export const sendEmail = async (to: string, subject: string, body: string, isHtml: boolean = false) => {
    try {
        const mailOptions = {
            from: `"Suporte" <${process.env.SMTP_USER}>`, // Remetente
            to, // Destinatário
            subject, // Assunto
            text: body.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML para fallback de texto puro
            html: body, // Usa HTML como corpo principal
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("E-mail enviado: " + info.response);
        return { success: true, message: "E-mail enviado com sucesso!" };
    } catch (error: any) {
        console.error("Erro ao enviar e-mail:", error);
        return { success: false, message: `Erro ao enviar e-mail: ${error.message || error}` };
    }

};
