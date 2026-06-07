import { z } from 'zod';

const name  = z.string().min(2, 'Укажите имя').max(100);
const phone = z.string().min(6, 'Укажите телефон').max(30).regex(/^[\d\s\+\-\(\)]+$/, 'Неверный формат телефона');
const email = z.string().email('Неверный email').max(200).optional().or(z.literal(''));
const msg   = z.string().max(2000).optional().or(z.literal(''));
const hp    = z.string().max(0, 'bot').optional(); // honeypot must be empty

export const callbackSchema = z.object({ name, phone, hp });
export const priceRequestSchema = z.object({ name, phone, email, product: z.string().max(200).optional(), hp });
export const reviewsRequestSchema = z.object({ name, phone, company: z.string().max(200).optional(), hp });
export const designRequestSchema = z.object({ name, phone, email, message: msg, hp });
