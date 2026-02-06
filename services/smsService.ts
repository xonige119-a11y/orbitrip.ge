
import { db } from './db';
import { SmsLog } from '../types';

// SMS Service for OrbiTrip using smsoffice.ge API V2
// Documentation: https://smsoffice.ge/api/v2/send/

// IMPORTANT: This Sender Name must be registered and active in your smsoffice.ge account.
// If 'localltrip' is not active, change this to 'smsoffice' (default sender).
const SENDER_NAME = 'localltrip'; 

// The specific admin number requested
const HARDCODED_ADMIN_PHONE = '995593456876'; 

export const smsService = {
    /**
     * Cleans phone number to format compatible with API (International format without + or 00).
     * Example: +995 593 12 34 56 -> 995593123456
     */
    cleanPhoneNumber: (phone: string): string => {
        if (!phone) return '';
        
        // Remove all non-digit characters
        let clean = phone.replace(/\D/g, ''); 
        
        // Georgia Specific Logic
        // If it starts with '5' and is 9 digits (e.g. 593123456), add '995' -> 995593123456
        if (clean.length === 9 && clean.startsWith('5')) {
            return '995' + clean;
        }
        
        // If it starts with '05' (e.g. 0593...), remove '0' and add '995'
        if (clean.length === 10 && clean.startsWith('05')) {
            return '995' + clean.substring(1);
        }

        // If it's already 12 digits starting with 995, return as is
        if (clean.length === 12 && clean.startsWith('995')) {
            return clean;
        }

        // If it's just the country code + number but missing logic above (fallback)
        return clean;
    },

    /**
     * Sends notification to the Driver (New Booking)
     */
    sendDriverNotification: async (driverPhone: string, bookingDetails: { id: string, tourTitle: string, date: string, price: string }): Promise<boolean> => {
        if (!driverPhone) return false;
        
        const destination = smsService.cleanPhoneNumber(driverPhone);
        const shortId = bookingDetails.id.slice(-6).toUpperCase();
        
        // Construct Message (Added ID)
        const text = `OrbiTrip: Axali Shekveta #${shortId}!\nTuri: ${bookingDetails.tourTitle.substring(0, 20)}\nTarigi: ${bookingDetails.date}\nFasi: ${bookingDetails.price}\nSheamowmet kabineti.`;
        
        return smsService.sendSms(destination, text, 'DRIVER_NOTIFY');
    },

    /**
     * Sends CANCELLATION notification to the Driver (When re-assigned or cancelled)
     */
    sendDriverCancellationNotification: async (driverPhone: string, bookingDetails: { id: string, date: string }): Promise<boolean> => {
        if (!driverPhone) return false;
        
        const destination = smsService.cleanPhoneNumber(driverPhone);
        const shortId = bookingDetails.id.slice(-6).toUpperCase();
        
        const text = `OrbiTrip: Javshani #${shortId} (${bookingDetails.date}) gaukmeda an gadaeca sxva mzgols.`;
        
        return smsService.sendSms(destination, text, 'DRIVER_NOTIFY');
    },

    /**
     * Sends notification to the Administrator
     */
    sendAdminNotification: async (bookingDetails: { id?: string, tourTitle: string, date: string, price: string, customerName: string, contact: string, driverName: string }): Promise<boolean> => {
        let adminPhone = HARDCODED_ADMIN_PHONE;
        
        // Try to get from DB, but fallback to hardcoded if empty
        try {
            const settings = await db.settings.get();
            if (settings.adminPhoneNumber && settings.adminPhoneNumber.length > 5) {
                adminPhone = settings.adminPhoneNumber;
            }
        } catch (e) {
            console.warn('[SMS Service] Could not fetch settings, using hardcoded admin phone.');
        }

        const destination = smsService.cleanPhoneNumber(adminPhone);
        const shortId = bookingDetails.id ? bookingDetails.id.slice(-6).toUpperCase() : 'NEW';
        
        const text = `[ADMIN] Javshani #${shortId}!\nKlienti: ${bookingDetails.customerName}\nTel: ${bookingDetails.contact}\nMzgoli: ${bookingDetails.driverName}\nTuri: ${bookingDetails.tourTitle.substring(0, 15)}\nFasi: ${bookingDetails.price}`;
        
        return smsService.sendSms(destination, text, 'ADMIN_NOTIFY');
    },

    /**
     * Core Sender Function using smsoffice.ge API
     */
    sendSms: async (destination: string, text: string, type: 'ADMIN_NOTIFY' | 'DRIVER_NOTIFY'): Promise<boolean> => {
        let apiKey = '';
        try {
            const settings = await db.settings.get();
            if (settings.smsEnabled === false) {
                console.log("[SMS Service] SMS sending is GLOBALLY DISABLED in Settings.");
                return false;
            }
            if (settings.smsApiKey && settings.smsApiKey.length > 5) {
                apiKey = settings.smsApiKey;
            }
        } catch (e) {
            console.warn('[SMS Service] DB fetch failed.');
        }

        if (!apiKey) {
            console.warn("[SMS Service] CRITICAL: No API Key configured in Admin Panel. Cannot send SMS.");
            return false;
        }

        // URL Encode the content
        const encodedContent = encodeURIComponent(text);
        
        // Construct URL according to documentation
        // GET /api/v2/send/?key=...&destination=...&sender=...&content=...&urgent=true
        const url = `https://smsoffice.ge/api/v2/send/?key=${apiKey}&destination=${destination}&sender=${SENDER_NAME}&content=${encodedContent}&urgent=true`;
        
        const logId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        
        console.log(`[SMS Service] Attempting to send to ${destination}. URL (masked): ${url.replace(apiKey, '***')}`);

        try {
            // Log Attempt in DB
            await db.smsLogs.log({ id: logId, recipient: destination, content: text, status: 'TRYING', timestamp: Date.now(), type });
            
            // Execute Request
            // Note: mode: 'no-cors' is used because smsoffice.ge typically does not support CORS for browser-side calls.
            // This means we won't get a readable JSON response in the browser, but the request WILL be sent.
            await fetch(url, { method: 'GET', mode: 'no-cors' });
            
            // Assume success if no network error threw
            console.log(`[SMS Service] Request sent successfully to ${destination}`);
            await db.smsLogs.log({ id: logId, recipient: destination, content: text, status: 'SENT', timestamp: Date.now(), type });
            return true;

        } catch (error: any) {
            console.error('[SMS Service] FAILED to send:', error);
            await db.smsLogs.log({ id: logId, recipient: destination, content: `Error: ${error.message}`, status: 'FAILED', timestamp: Date.now(), type });
            return false;
        }
    }
};
