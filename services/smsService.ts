import { db } from './db';

// SMS სერვისი OrbiTrip-ისთვის (smsoffice.ge API V2)
const SENDER_NAME = 'localltrip'; 
const FALLBACK_ADMIN_PHONE = '995593456876'; 

export const smsService = {
    /**
     * ასუფთავებს ნომერს ზედმეტი სიმბოლოებისგან და აკეთებს ფორმატირებას (995...)
     */
    cleanPhoneNumber: (phone: string): string => {
        if (!phone) return '';
        let clean = phone.replace(/\D/g, ''); 
        
        // თუ 9 ნიშნაა და იწყება 5-ით (მაგ: 593...)
        if (clean.length === 9 && clean.startsWith('5')) {
            return '995' + clean;
        }
        // თუ 10 ნიშნაა და იწყება 05-ით
        if (clean.length === 10 && clean.startsWith('05')) {
            return '995' + clean.substring(1);
        }
        return clean;
    },

    /**
     * ძირითადი ფუნქცია SMS-ის გასაგზავნად
     */
    sendSms: async (destination: string, text: string, type: 'ADMIN_NOTIFY' | 'DRIVER_NOTIFY'): Promise<boolean> => {
        let apiKey = '';
        let isEnabled = true;

        try {
            const settings = await db.settings.get();
            apiKey = settings.smsApiKey || '';
            isEnabled = settings.smsEnabled !== false;
        } catch (e) {
            console.warn('[SMS Service] Error fetching settings:', e);
        }

        if (!isEnabled) {
            console.log("[SMS Service] SMS sending is disabled in settings.");
            return false;
        }

        if (!apiKey) {
            // თუ გასაღები ბაზაში არაა, აქ ჩაწერე შენი დეფოლტ გასაღები
            apiKey = '34272d646d9446b2b5aa45ee83571538'; 
        }

        const cleanDest = smsService.cleanPhoneNumber(destination);
        const encodedContent = encodeURIComponent(text);
        const url = `https://smsoffice.ge/api/v2/send/?key=${apiKey}&destination=${cleanDest}&sender=${SENDER_NAME}&content=${encodedContent}&urgent=true`;
        
        const logId = Date.now().toString();

        try {
            // ლოგირება ბაზაში (მცდელობა)
            await db.smsLogs.log({ 
                id: logId, 
                recipient: cleanDest, 
                content: text, 
                status: 'TRYING', 
                timestamp: Date.now(), 
                type 
            });

            // გაგზავნა (no-cors აუცილებელია ბრაუზერისთვის)
            await fetch(url, { method: 'GET', mode: 'no-cors' });
            
            await db.smsLogs.log({ 
                id: logId, 
                recipient: cleanDest, 
                content: text, 
                status: 'SENT', 
                timestamp: Date.now(), 
                type 
            });
            return true;
        } catch (error: any) {
            console.error('[SMS Service] Fetch failed:', error);
            await db.smsLogs.log({ 
                id: logId, 
                recipient: cleanDest, 
                content: `Error: ${error.message}`, 
                status: 'FAILED', 
                timestamp: Date.now(), 
                type 
            });
            return false;
        }
    },

    /**
     * ადმინისტრატორის შეტყობინება
     */
    sendAdminNotification: async (data: { 
        id: string, 
        tourTitle: string, 
        date: string, 
        price: string, 
        customerName: string, 
        contact: string, 
        driverName: string 
    }): Promise<boolean> => {
        let adminPhone = FALLBACK_ADMIN_PHONE;
        try {
            const settings = await db.settings.get();
            if (settings.adminPhoneNumber) adminPhone = settings.adminPhoneNumber;
        } catch (e) {}

        const shortId = data.id.slice(-6).toUpperCase();
        const text = `[ADMIN] Javshani #${shortId}!\nKlienti: ${data.customerName}\nTel: ${data.contact}\nMzgoli: ${data.driverName}\nTuri: ${data.tourTitle.substring(0, 15)}\nFasi: ${data.price}`;
        
        return smsService.sendSms(adminPhone, text, 'ADMIN_NOTIFY');
    },

    /**
     * მძღოლის შეტყობინება
     */
    sendDriverNotification: async (driverPhone: string, data: { 
        id: string, 
        tourTitle: string, 
        date: string, 
        price: string 
    }): Promise<boolean> => {
        const shortId = data.id.slice(-6).toUpperCase();
        const text = `OrbiTrip: Axali Shekveta #${shortId}!\nRoute: ${data.tourTitle.substring(0, 20)}\nDate: ${data.date}\nPrice: ${data.price}`;
        
        return smsService.sendSms(driverPhone, text, 'DRIVER_NOTIFY');
    },

    /**
     * გაუქმების შეტყობინება მძღოლს
     */
    sendDriverCancellationNotification: async (driverPhone: string, data: { id: string, date: string }): Promise<boolean> => {
        const shortId = data.id.slice(-6).toUpperCase();
        const text = `OrbiTrip: Javshani #${shortId} (${data.date}) gaukmeda an gadaeca sxva mzgols.`;
        
        return smsService.sendSms(driverPhone, text, 'DRIVER_NOTIFY');
    }
};
