import { Tour, Booking, Driver, SystemSettings, SmsLog } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * --- ORBITRIP PRODUCTION DATABASE SERVICE (Supabase) ---
 */

const triggerUpdate = () => {
    window.dispatchEvent(new Event('orbitrip-db-change'));
};

const logError = (context: string, error: any) => {
    console.error(`[DB] ${context}:`, error?.message || JSON.stringify(error));
};

// --- DATA SANITIZERS (STRICT MODE) ---
const safeString = (val: any, def = ''): string => (val === null || val === undefined) ? def : String(val);

const safeNumber = (val: any, def = 0): number => {
    const num = Number(val);
    return isNaN(num) ? def : num;
};

// STRICT ARRAY PARSER
const safeArray = <T>(val: any, def: T[] = []): T[] => {
    if (val === null || val === undefined) return def;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        if (val.trim() === '') return def;
        try { 
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
            return def; 
        } catch (e) { return def; }
    }
    return def;
};

const DEFAULT_SMS_KEY = 'cdaefb6e20ce4d88b2b7d69873265c4c'; // Updated from user CSV
const DEFAULT_ADMIN_PHONE = '995593456876';

export const db = {
    tours: {
        getAll: async (): Promise<Tour[]> => {
            if (!isSupabaseConfigured) return [];
            const { data, error } = await supabase.from('tours').select('*');
            if (error) { logError('Get Tours', error); return []; }
            
            return (data || []).map((t: any) => ({
                id: safeString(t.id),
                titleEn: safeString(t.titleEn, 'Untitled Tour'),
                titleRu: safeString(t.titleRu, 'Тур без названия'),
                descriptionEn: safeString(t.descriptionEn),
                descriptionRu: safeString(t.descriptionRu),
                price: safeString(t.price, '0 GEL'),
                pricePerPerson: safeNumber(t.pricePerPerson),
                duration: safeString(t.duration, '1 Day'),
                image: safeString(t.image, 'https://via.placeholder.com/400'),
                rating: safeNumber(t.rating, 5),
                category: safeString(t.category, 'OTHER'),
                priceOptions: safeArray(t.priceOptions),
                reviews: safeArray(t.reviews),
                highlightsEn: safeArray(t.highlightsEn),
                highlightsRu: safeArray(t.highlightsRu),
                itineraryEn: safeArray(t.itineraryEn),
                itineraryRu: safeArray(t.itineraryRu),
                routeStops: safeArray(t.routeStops)
            }));
        },
        create: async (item: Tour) => {
            if (!isSupabaseConfigured) return item;
            
            // Clean object before insert
            const cleanItem = {
                ...item,
                pricePerPerson: safeNumber(item.pricePerPerson, 0),
                rating: safeNumber(item.rating, 5)
            };

            const { error } = await supabase.from('tours').insert([cleanItem]);
            if (error) logError('Create Tour', error);
            triggerUpdate();
            return item;
        },
        update: async (item: Tour) => {
            if (!isSupabaseConfigured) return item;
            
            const cleanItem = {
                ...item,
                pricePerPerson: safeNumber(item.pricePerPerson, 0),
                rating: safeNumber(item.rating, 5)
            };

            const { error } = await supabase.from('tours').update(cleanItem).eq('id', item.id);
            if (error) logError('Update Tour', error);
            triggerUpdate();
            return item;
        },
        delete: async (id: string) => {
            if (!isSupabaseConfigured) return;
            const { error } = await supabase.from('tours').delete().eq('id', id);
            if (error) logError('Delete Tour', error);
            triggerUpdate();
        },
        seed: async (items: Tour[]) => {
            if (!isSupabaseConfigured) return;
            const { count } = await supabase.from('tours').select('*', { count: 'exact', head: true });
            if (count === 0) {
                const { error } = await supabase.from('tours').insert(items);
                if (error) logError('Seed Tours', error);
                else triggerUpdate();
            }
        }
    },
    drivers: {
        getAll: async (): Promise<Driver[]> => {
            if (!isSupabaseConfigured) return [];
            const { data, error } = await supabase.from('drivers').select('*');
            if (error) { logError('Get Drivers', error); return []; }
            
            return (data || []).map((d: any) => ({
                id: safeString(d.id),
                name: safeString(d.name, 'Unknown Driver'),
                email: safeString(d.email),
                password: safeString(d.password),
                city: safeString(d.city, 'kutaisi'),
                photoUrl: safeString(d.photoUrl, 'https://via.placeholder.com/150'),
                carModel: safeString(d.carModel, 'Standard Car'),
                carPhotoUrl: safeString(d.carPhotoUrl, 'https://via.placeholder.com/400'),
                vehicleType: (['Sedan', 'Minivan', 'SUV', 'Bus'].includes(d.vehicleType) ? d.vehicleType : 'Sedan') as any,
                phoneNumber: safeString(d.phoneNumber),
                status: d.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                rating: safeNumber(d.rating, 5),
                reviewCount: safeNumber(d.reviewCount, 0),
                pricePerKm: safeNumber(d.pricePerKm, 1),
                basePrice: safeNumber(d.basePrice, 50),
                maxPassengers: safeNumber(d.maxPassengers, 4),
                reviews: safeArray(d.reviews),
                languages: safeArray(d.languages),
                features: safeArray(d.features),
                carPhotos: safeArray(d.carPhotos),
                blockedDates: safeArray(d.blockedDates)
            }));
        },
        create: async (item: Driver) => {
            if (!isSupabaseConfigured) return item;
            
            const cleanItem = {
                ...item,
                pricePerKm: safeNumber(item.pricePerKm, 1),
                basePrice: safeNumber(item.basePrice, 30),
                reviewCount: safeNumber(item.reviewCount, 0),
                rating: safeNumber(item.rating, 5),
                maxPassengers: safeNumber(item.maxPassengers, 4)
            };

            const { error } = await supabase.from('drivers').insert([cleanItem]);
            if (error) logError('Create Driver', error);
            triggerUpdate();
            return item;
        },
        update: async (item: Driver) => {
            if (!isSupabaseConfigured) return item;
            
            const cleanItem = {
                ...item,
                pricePerKm: safeNumber(item.pricePerKm, 1),
                basePrice: safeNumber(item.basePrice, 30),
                reviewCount: safeNumber(item.reviewCount, 0),
                rating: safeNumber(item.rating, 5),
                maxPassengers: safeNumber(item.maxPassengers, 4)
            };

            const { error } = await supabase.from('drivers').update(cleanItem).eq('id', item.id);
            if (error) logError('Update Driver', error);
            triggerUpdate();
            return item;
        },
        delete: async (id: string) => {
            if (!isSupabaseConfigured) return;
            const { error } = await supabase.from('drivers').delete().eq('id', id);
            if (error) logError('Delete Driver', error);
            triggerUpdate();
        },
        seed: async (items: Driver[]) => {
            if (!isSupabaseConfigured) return;
            const { count } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
            if (count === 0) {
                const { error } = await supabase.from('drivers').insert(items);
                if (error) logError('Seed Drivers', error);
                else triggerUpdate();
            }
        }
    },
    bookings: {
        getAll: async (): Promise<Booking[]> => {
            if (!isSupabaseConfigured) return [];
            const { data, error } = await supabase.from('bookings').select('*').order('createdAt', { ascending: false });
            if (error) { 
                if (error.code !== '42P01') logError('Get Bookings', error); 
                return []; 
            }
            
            return (data || []).map((b: any) => ({
                id: safeString(b.id),
                tourId: safeString(b.tourId),
                tourTitle: safeString(b.tourTitle, 'Transfer'),
                customerName: safeString(b.customerName, 'Guest'),
                contactInfo: safeString(b.contactInfo),
                date: safeString(b.date),
                vehicle: safeString(b.vehicle, 'Sedan') as any,
                driverName: safeString(b.driverName),
                driverId: b.driverId ? safeString(b.driverId) : undefined,
                totalPrice: safeString(b.totalPrice),
                status: safeString(b.status, 'PENDING') as any,
                guests: safeNumber(b.guests, 1),
                numericPrice: safeNumber(b.numericPrice),
                createdAt: safeNumber(b.createdAt, Date.now()),
                commission: safeNumber(b.commission)
            }));
        },
        create: async (item: Booking) => {
            if (!isSupabaseConfigured) return item;
            
            // Critical Sanatization for Numbers to prevent Supabase 400 errors
            const cleanItem = {
                ...item,
                driverId: (item.driverId && item.driverId !== 'any') ? String(item.driverId) : null,
                driverName: item.driverName || 'Any Driver',
                guests: safeNumber(item.guests, 1),
                numericPrice: safeNumber(item.numericPrice, 0),
                commission: safeNumber(item.commission, 0),
                createdAt: safeNumber(item.createdAt, Date.now())
            };

            console.log('[DB] Creating booking:', cleanItem);

            const { error } = await supabase.from('bookings').insert([cleanItem]);
            
            if (error) {
                console.error('[DB] Create Booking FAILED:', error);
                logError('Create Booking', error);
            } else {
                console.log('[DB] Booking created successfully');
            }
            
            triggerUpdate();
            return item;
        },
        bulkCreate: async (newItems: Booking[]) => {
            if (!isSupabaseConfigured) return;
            const { error } = await supabase.from('bookings').insert(newItems);
            if (error) logError('Bulk Create', error);
            triggerUpdate();
        },
        updateStatus: async (id: string, status: any) => {
            if (!isSupabaseConfigured) return;
            const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
            if (error) logError('Update Status', error);
            triggerUpdate();
        },
        assignDriver: async (bookingId: string, driver: Driver): Promise<boolean> => {
            if (!isSupabaseConfigured) return false;
            
            const { data: existing, error: fetchError } = await supabase
                .from('bookings')
                .select('driverId, status')
                .eq('id', bookingId)
                .single();
            
            if (fetchError || !existing) return false;

            if (existing.driverId && existing.driverId !== driver.id) {
                console.warn('[Race Condition] Booking taken by another driver.');
                return false;
            }

            const { error } = await supabase.from('bookings').update({
                driverId: String(driver.id),
                driverName: driver.name,
                status: 'CONFIRMED'
            }).eq('id', bookingId);

            if (error) {
                logError('Assign Driver', error);
                return false;
            }

            triggerUpdate();
            return true;
        },
        clearAll: async () => {
            if (!isSupabaseConfigured) return;
            const { error } = await supabase.from('bookings').delete().neq('id', '0');
            if (error) logError('Clear DB', error);
            triggerUpdate();
        }
    },
    settings: {
        get: async (): Promise<SystemSettings> => {
            if (!isSupabaseConfigured) {
                // Default fallback for orbitrip.ge until DB connects
                return { id: 'default', smsApiKey: DEFAULT_SMS_KEY, adminPhoneNumber: DEFAULT_ADMIN_PHONE, commissionRate: 0.2278 };
            }
            const { data, error } = await supabase.from('settings').select('*').single();
            
            if (error || !data) {
                return { id: 'default', smsApiKey: DEFAULT_SMS_KEY, adminPhoneNumber: DEFAULT_ADMIN_PHONE, commissionRate: 0.2278 };
            }
            
            return {
                id: safeString(data.id),
                smsApiKey: safeString(data.smsApiKey, DEFAULT_SMS_KEY),
                adminPhoneNumber: safeString(data.adminPhoneNumber, DEFAULT_ADMIN_PHONE),
                commissionRate: safeNumber(data.commissionRate, 0.2278)
            };
        },
        save: async (settings: SystemSettings) => {
            if (!isSupabaseConfigured) return;
            
            const cleanSettings = {
                ...settings,
                commissionRate: safeNumber(settings.commissionRate, 0.2278)
            };

            const { error } = await supabase.from('settings').upsert(cleanSettings);
            if (error) logError('Save Settings', error);
        }
    },
    smsLogs: {
        getAll: async (): Promise<SmsLog[]> => {
            if (!isSupabaseConfigured) return [];
            const { data, error } = await supabase.from('sms_logs').select('*').order('timestamp', { ascending: false }).limit(50);
            if (error) { 
                if (error.code !== '42P01') logError('Get SMS Logs', error); 
                return []; 
            }
            return data || [];
        },
        log: async (log: SmsLog) => {
            if (!isSupabaseConfigured) return;
            const { error } = await supabase.from('sms_logs').upsert([log]);
            if (error) {
                console.error("SMS Log Insert Failed:", error);
            }
        }
    }
};