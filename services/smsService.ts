import { db } from './db';
import { SmsLog } from '../types';

// SMS Service for OrbiTrip using smsoffice.ge API V2
// Documentation: https://smsoffice.ge/api/v2/send/

// FIX: Updated to match the registered Brand Name in smsoffice.ge dashboard
const SENDER_NAME = 'localltrip'; 
const HARDCODED_API_KEY = 'cdaefb6e20ce4d88b2b7d69873265c4c'; // Updated from user CSV
const HARDCODED_ADMIN_PHONE = '995593456876'; // Updated from user CSV

export const smsService = {
    /**
     * Cleans phone number to format 995577123456
     */
    cleanPhoneNumber: (phone: string): string => {
        let clean = phone.replace(/\D/g, ''); // Remove all non-digits
        
        if (clean.startsWith('995') && clean.length === 12) {
            return clean;
        }
        if (clean.startsWith('5') && clean.length === 9) {
            return '995' + clean;
        }
        if (clean.startsWith('05') && clean.length === 10) {
            return '995' + clean.substring(1);
        }
        
        return clean.length === 9 ? '995' + clean : clean;
    },

    /**
     * Sends an SMS notification to a driver
     */
    sendDriverNotification: async (driverPhone: string, bookingDetails: { tourTitle: string, date: string, price: string }): Promise<boolean> => {
        if (!driverPhone) return false;

        const destination = smsService.cleanPhoneNumber(driverPhone);
        const text = `OrbiTrip: Axali Shekveta!\nTuri: ${bookingDetails.tourTitle.substring(0, 20)}\nTarigi: ${bookingDetails.date}\nFasi: ${bookingDetails.price}\nSheamowmet kabineti.`;
        
        console.log(`[SMS Service] Preparing to send to Driver: ${destination}`);
        return smsService.sendSms(destination, text, 'DRIVER_NOTIFY');
    },

    /**
     * Sends an SMS notification to the Administrator
     */
    sendAdminNotification: async (bookingDetails: { tourTitle: string, date: string, price: string, customerName: string, contact: string, driverName: string }): Promise<boolean> => {
        let adminPhone = HARDCODED_ADMIN_PHONE;
        try {
            const settings = await db.settings.get();
            if (settings.adminPhoneNumber) adminPhone = settings.adminPhoneNumber;
        } catch (e) {
            console.warn('[SMS Service] Could not fetch settings, using hardcoded admin phone.');
        }

        const destination = smsService.cleanPhoneNumber(adminPhone);
        const text = `[ADMIN] Axali Javshani!\nKlienti: ${bookingDetails.customerName}\nTel: ${bookingDetails.contact}\nMzgoli: ${bookingDetails.driverName}\nTuri: ${bookingDetails.tourTitle.substring(0, 15)}\nFasi: ${bookingDetails.price}`;
        
        console.log(`[SMS Service] Preparing to send to Admin: ${destination}`);
        return smsService.sendSms(destination, text, 'ADMIN_NOTIFY');
    },

    /**
     * Core internal function to execute the API call via GET request
     */
    sendSms: async (destination: string, text: string, type: 'ADMIN_NOTIFY' | 'DRIVER_NOTIFY'): Promise<boolean> => {
        // 1. Get API Key
        let apiKey = HARDCODED_API_KEY;
        let source = 'HARDCODED';
        try {
            const settings = await db.settings.get();
            if (settings.smsApiKey && settings.smsApiKey.length > 10) {
                apiKey = settings.smsApiKey;
                source = 'DB_SETTINGS';
            }
        } catch (e) {
            console.warn('[SMS Service] DB fetch failed, using hardcoded API key.');
        }

        console.log(`[SMS Service] Using API Key from: ${source}`);

        // 2. Prepare URL Parameters
        const encodedContent = encodeURIComponent(text);
        const url = `https://smsoffice.ge/api/v2/send/?key=${apiKey}&destination=${destination}&sender=${SENDER_NAME}&content=${encodedContent}&urgent=true`;

        // 3. Log Attempt to DB
        const logId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        
        try {
            await db.smsLogs.log({
                id: logId,
                recipient: destination,
                content: text,
                status: 'TRYING',
                timestamp: Date.now(),
                type
            });
        } catch (dbError) {
            console.error('[SMS Service] Failed to write initial log to DB:', dbError);
        }

        try {
            console.log(`[SMS Service] Sending to URL: ${url}`); 
            
            // NOTE: 'no-cors' prevents reading the response but allows the request to be sent.
            await fetch(url, { 
                method: 'GET',
                mode: 'no-cors' 
            });
            
            console.log(`[SMS Service] Request sent successfully to ${destination}`);
            
            // Update Log to Sent
            await db.smsLogs.log({
                id: logId,
                recipient: destination,
                content: text,
                status: 'SENT',
                timestamp: Date.now(),
                type
            });

            return true;

        } catch (error: any) {
            console.error('[SMS Service] Failed to send:', error);
            
            // Update Log to Failed
            await db.smsLogs.log({
                id: logId,
                recipient: destination,
                content: `Error: ${error.message || 'Network Error'}`,
                status: 'FAILED',
                timestamp: Date.now(),
                type
            });
            
            return false;
        }
    }
};