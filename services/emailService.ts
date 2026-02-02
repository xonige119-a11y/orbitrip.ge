
import emailjs from '@emailjs/browser';
import { Booking, Tour, Language } from '../types';
import { db } from './db';

// Safe Environment Access Helper
const getEnv = (key: string, fallback: string) => {
    try {
        // @ts-ignore
        const val = import.meta.env[key] || (window.process && window.process.env && window.process.env[key]);
        return val && val.length > 5 ? val.trim() : fallback.trim();
    } catch (e) {
        return fallback.trim();
    }
};

// Default Fallbacks from Env (if not in DB)
const ENV_DEFAULTS = {
    SERVICE_ID: getEnv('VITE_EMAILJS_SERVICE_ID', ''),
    TEMPLATE_ID: getEnv('VITE_EMAILJS_TEMPLATE_ID', ''),
    PUBLIC_KEY: getEnv('VITE_EMAILJS_PUBLIC_KEY', ''),
};

const ADMIN_NOTIFICATION_EMAIL = 'support@orbitrip.ge'; // Target email for Admin notifications

export const emailService = {
    /**
     * Helper to get active configuration (DB has priority over Env)
     */
    getConfig: async () => {
        try {
            const settings = await db.settings.get();
            // Check if DB settings are valid (non-empty), otherwise use ENV
            const serviceId = settings.emailServiceId && settings.emailServiceId.length > 2 ? settings.emailServiceId : ENV_DEFAULTS.SERVICE_ID;
            const templateId = settings.emailTemplateId && settings.emailTemplateId.length > 2 ? settings.emailTemplateId : ENV_DEFAULTS.TEMPLATE_ID;
            const publicKey = settings.emailPublicKey && settings.emailPublicKey.length > 5 ? settings.emailPublicKey : ENV_DEFAULTS.PUBLIC_KEY;

            return {
                SERVICE_ID: serviceId,
                TEMPLATE_ID: templateId,
                PUBLIC_KEY: publicKey
            };
        } catch (e) {
            console.warn("[EmailService] Failed to load settings from DB, using defaults.");
            return ENV_DEFAULTS;
        }
    },

    /**
     * Sends a detailed confirmation email to the customer using EmailJS.
     */
    sendBookingConfirmation: async (booking: Booking, tour: Tour | null, language: Language = Language.EN): Promise<boolean> => {
        
        const config = await emailService.getConfig();
        console.log(`[EmailService] Init. Key: ${config.PUBLIC_KEY ? config.PUBLIC_KEY.slice(0,4) + '***' : 'MISSING'}`);

        if (!config.PUBLIC_KEY || config.PUBLIC_KEY === 'undefined') {
            console.error('[EmailService] CRITICAL: Public Key missing or invalid.');
            return false;
        }

        // --- EMAIL EXTRACTION LOGIC ---
        // Robustly extract email from contactInfo string regardless of formatting
        const extractEmail = (text: string): string | null => {
            const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
            const match = text.match(emailRegex);
            return match ? match[0] : null;
        };

        const recipientEmail = extractEmail(booking.contactInfo);
        
        if (!recipientEmail) {
            console.warn(`[EmailService] No valid email found in contact info: ${booking.contactInfo}`);
            // We proceed anyway to send to Admin/Driver notification if configured, but cannot send to user.
            return false; 
        }

        try {
            const isEn = language === Language.EN;
            const bookingIdShort = booking.id.slice(-6).toUpperCase();
            
            // --- OPTIMIZED HTML TEMPLATE (Customer) ---
            const htmlContent = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #333; width: 100%;">
                
                <!-- MAIN CONTAINER -->
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    
                    <!-- HEADER (Gradient) -->
                    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
                        <div style="font-size: 24px; font-weight: 900; letter-spacing: 4px; margin-bottom: 10px; opacity: 0.9;">ORBITRIP</div>
                        
                        <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">${isEn ? "Booking Confirmed" : "Бронирование Подтверждено"}</h1>
                        <div style="margin-top: 15px;">
                            <span style="background-color: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; letter-spacing: 1px;">#${bookingIdShort}</span>
                        </div>
                    </div>

                    <!-- GREETING & NEXT STEPS -->
                    <div style="padding: 30px 40px 20px 40px; text-align: center;">
                        <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 20px;">${isEn ? `Hello, ${booking.customerName}` : `Здравствуйте, ${booking.customerName}`}</h2>
                        <p style="margin: 0; color: #4b5563; line-height: 1.6; font-size: 16px; font-weight: 500;">
                            ${isEn 
                                ? "Your driver has received the order and will contact you via <strong style='color:#25D366'>WhatsApp</strong> shortly to coordinate the pickup." 
                                : "Водитель принял ваш заказ и свяжется с вами через <strong style='color:#25D366'>WhatsApp</strong> в ближайшее время для уточнения деталей встречи."}
                        </p>
                    </div>

                    <!-- DETAILS BOX -->
                    <div style="padding: 10px 40px;">
                        <div style="background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px;">
                            <!-- ROUTE -->
                            <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                                <div style="font-size: 11px; color: #9ca3af; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${isEn ? "Route" : "Маршрут"}</div>
                                <div style="font-size: 18px; color: #111827; font-weight: 700; margin-top: 5px;">${booking.tourTitle}</div>
                            </div>
                            <!-- GRID INFO -->
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="50%" style="padding-bottom: 15px; vertical-align: top;">
                                        <div style="font-size: 11px; color: #9ca3af; font-weight: bold; text-transform: uppercase;">${isEn ? "Date & Time" : "Дата и Время"}</div>
                                        <div style="font-size: 14px; color: #374151; font-weight: 600; margin-top: 2px;">${booking.date}</div>
                                    </td>
                                    <td width="50%" style="padding-bottom: 15px; vertical-align: top;">
                                        <div style="font-size: 11px; color: #9ca3af; font-weight: bold; text-transform: uppercase;">${isEn ? "Driver" : "Водитель"}</div>
                                        <div style="font-size: 14px; color: #374151; font-weight: 600; margin-top: 2px;">${booking.driverName || "Standard Driver"}</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- PRICE BOX -->
                    <div style="padding: 20px 40px;">
                        <div style="background-color: #ecfdf5; border-radius: 12px; border: 2px solid #d1fae5; padding: 20px; text-align: center;">
                            <div style="font-size: 12px; color: #065f46; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${isEn ? "Fixed Price (Cash to Driver)" : "Фиксированная цена (Наличными водителю)"}</div>
                            <div style="font-size: 32px; font-weight: 900; color: #059669; margin-top: 5px;">${booking.totalPrice}</div>
                            <div style="font-size: 12px; color: #065f46; margin-top: 5px; opacity: 0.8;">
                                ${isEn ? "No hidden fees. Includes fuel & waiting." : "Без скрытых комиссий. Топливо и ожидание включено."}
                            </div>
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div style="background-color: #1f2937; padding: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                        <p style="margin-bottom: 10px;">
                            ${isEn ? "Need help? Contact us 24/7" : "Нужна помощь? Свяжитесь с нами 24/7"}
                        </p>
                        <a href="mailto:support@orbitrip.ge" style="color: #ffffff; text-decoration: none; font-weight: bold;">support@orbitrip.ge</a>
                        <p style="margin-top: 20px; opacity: 0.5;">© 2025 OrbiTrip Georgia.</p>
                    </div>
                </div>
            </div>
            `;

            // Prepare Parameters
            const templateParams = {
                to_email: recipientEmail, 
                to_name: booking.customerName,
                message_html: htmlContent, 
                booking_id: bookingIdShort,
                tour_title: booking.tourTitle,
                total_price: booking.totalPrice
            };

            await emailjs.send(
                config.SERVICE_ID,
                config.TEMPLATE_ID,
                templateParams,
                config.PUBLIC_KEY
            );

            console.log(`[EmailService] Customer confirmation sent to: ${recipientEmail}`);
            return true;

        } catch (error) {
            console.error('[EmailService] FAILED to send customer email:', error);
            return false;
        }
    },

    /**
     * Sends a "Driver Changed" notification email to the CUSTOMER.
     * Used when admin forces a driver change.
     */
    sendDriverChangedNotification: async (booking: Booking, newDriverName: string): Promise<boolean> => {
        const config = await emailService.getConfig();
        if (!config.PUBLIC_KEY) return false;

        const extractEmail = (text: string): string | null => {
            const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
            const match = text.match(emailRegex);
            return match ? match[0] : null;
        };

        const recipientEmail = extractEmail(booking.contactInfo);
        if (!recipientEmail) return false;

        try {
            // Assume EN for template simplicity or pass language if available
            const htmlContent = `
            <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border-top: 5px solid #f59e0b;">
                    <div style="padding: 30px; text-align: center;">
                        <h2 style="color: #1f2937;">Important Update / Важное обновление</h2>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                            Due to unforeseen circumstances (force majeure), your driver has been changed.<br/>
                            По техническим причинам ваш водитель был заменен.
                        </p>
                        
                        <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 15px; margin: 20px 0; border-radius: 8px;">
                            <strong>New Driver / Новый водитель:</strong><br/>
                            <span style="font-size: 18px; color: #92400e;">${newDriverName}</span>
                        </div>

                        <p style="font-size: 14px; color: #6b7280;">
                            The service remains guaranteed. The new driver will contact you shortly via WhatsApp.<br/>
                            We apologize for the inconvenience.<br/><br/>
                            Сервис гарантирован. Новый водитель свяжется с вами в ближайшее время.<br/>
                            Приносим извинения за неудобства.
                        </p>
                        
                        <div style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                            Booking ID: #${booking.id.slice(-6).toUpperCase()}<br/>
                            Price remains unchanged: ${booking.totalPrice}
                        </div>
                    </div>
                </div>
            </div>
            `;

            await emailjs.send(
                config.SERVICE_ID,
                config.TEMPLATE_ID,
                {
                    to_email: recipientEmail,
                    to_name: booking.customerName,
                    message_html: htmlContent,
                    booking_id: booking.id.slice(-6),
                    tour_title: "Driver Update",
                    total_price: ""
                },
                config.PUBLIC_KEY
            );
            return true;
        } catch (error) {
            console.error('[EmailService] Failed to send driver update email:', error);
            return false;
        }
    },

    /**
     * Sends a booking notification email to the ADMINISTRATOR.
     */
    sendAdminBookingEmail: async (booking: Booking): Promise<boolean> => {
        const config = await emailService.getConfig();
        if (!config.PUBLIC_KEY) return false;

        try {
            const bookingIdShort = booking.id.slice(-6).toUpperCase();
            
            const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f0f0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-left: 5px solid #4f46e5;">
                    <h2 style="color: #4f46e5; margin-top: 0;">[ADMIN] New Booking Alert #${bookingIdShort}</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold; color: #666;">Route:</td>
                            <td style="padding: 10px; font-size: 16px;">${booking.tourTitle}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold; color: #666;">Date:</td>
                            <td style="padding: 10px; font-size: 16px;">${booking.date}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold; color: #666;">Client:</td>
                            <td style="padding: 10px; font-size: 16px;">${booking.customerName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold; color: #666;">Contact:</td>
                            <td style="padding: 10px; font-size: 16px; color: #2563eb;">${booking.contactInfo}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold; color: #666;">Price:</td>
                            <td style="padding: 10px; font-size: 18px; font-weight: bold; color: #059669;">${booking.totalPrice}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold; color: #666;">Assigned Driver:</td>
                            <td style="padding: 10px;">${booking.driverName || 'UNASSIGNED'} (ID: ${booking.driverId || 'N/A'})</td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px; text-align: center;">
                        <a href="https://orbitrip.ge/admin" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Open Admin Panel</a>
                    </div>
                </div>
            </div>
            `;

            await emailjs.send(
                config.SERVICE_ID,
                config.TEMPLATE_ID,
                {
                    to_email: ADMIN_NOTIFICATION_EMAIL,
                    to_name: "Admin",
                    message_html: htmlContent,
                    booking_id: bookingIdShort,
                    tour_title: booking.tourTitle,
                    total_price: booking.totalPrice
                },
                config.PUBLIC_KEY
            );
            console.log(`[EmailService] Admin Notification Sent to ${ADMIN_NOTIFICATION_EMAIL}`);
            return true;
        } catch (error) {
            console.error('[EmailService] Failed to send Admin email:', error);
            return false;
        }
    },

    /**
     * Sends a booking notification email directly to the driver.
     */
    sendDriverBookingEmail: async (driverEmail: string, booking: Booking): Promise<boolean> => {
        const config = await emailService.getConfig();
        if (!config.PUBLIC_KEY) return false;

        try {
            const bookingIdShort = booking.id.slice(-6).toUpperCase();
            
            const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
                <div style="max-width: 500px; margin: 0 auto; background-color: white; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
                        <h2 style="margin: 0;">New Booking! / ახალი ჯავშანი!</h2>
                        <p style="margin: 5px 0 0 0;">#${bookingIdShort}</p>
                    </div>
                    <div style="padding: 20px;">
                        <p style="font-weight: bold; margin-bottom: 5px; color: #6b7280;">ROUTE / მარშრუტი:</p>
                        <p style="margin-top: 0; font-size: 16px;">${booking.tourTitle}</p>
                        
                        <p style="font-weight: bold; margin-bottom: 5px; color: #6b7280; margin-top: 15px;">DATE / თარიღი:</p>
                        <p style="margin-top: 0; font-size: 16px;">${booking.date}</p>
                        
                        <p style="font-weight: bold; margin-bottom: 5px; color: #6b7280; margin-top: 15px;">CLIENT / კლიენტი:</p>
                        <p style="margin-top: 0; font-size: 16px;">${booking.customerName}</p>
                        <p style="margin-top: 0; font-size: 16px; color: #2563eb;">${booking.contactInfo}</p>
                        
                        <div style="margin-top: 25px; background-color: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center;">
                            <span style="display: block; font-size: 12px; color: #065f46; font-weight: bold;">PRICE (CASH) / თანხა (ქეში):</span>
                            <span style="display: block; font-size: 24px; font-weight: 900; color: #059669;">${booking.totalPrice}</span>
                        </div>
                        
                        <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
                            Please confirm this job in your dashboard immediately.<br/>
                            გთხოვთ დაადასტუროთ ჯავშანი კაბინეტში.
                        </p>
                    </div>
                </div>
            </div>
            `;

            await emailjs.send(
                config.SERVICE_ID,
                config.TEMPLATE_ID,
                {
                    to_email: driverEmail,
                    to_name: booking.driverName || 'Partner',
                    message_html: htmlContent,
                    booking_id: bookingIdShort,
                    tour_title: booking.tourTitle,
                    total_price: booking.totalPrice
                },
                config.PUBLIC_KEY
            );
            console.log(`[EmailService] Driver Notification Sent to ${driverEmail}`);
            return true;
        } catch (error) {
            console.error('[EmailService] Failed to send driver email:', error);
            return false;
        }
    },

    sendTestEmail: async (recipient: string): Promise<{ success: boolean, msg: string }> => {
        const config = await emailService.getConfig();
        if (!config.PUBLIC_KEY) return { success: false, msg: 'API Key Missing' };

        try {
            await emailjs.send(
                config.SERVICE_ID,
                config.TEMPLATE_ID,
                {
                    to_email: recipient,
                    to_name: "Test Admin",
                    message_html: "<h1>Test Email</h1><p>If you see this, OrbiTrip email system is working.</p>",
                    booking_id: "TEST-001"
                },
                config.PUBLIC_KEY
            );
            return { success: true, msg: 'Test Sent OK' };
        } catch (e: any) {
            return { success: false, msg: e.text || e.message };
        }
    }
};
