import { z } from 'zod';

/**
 * Validation schema for the application's environment variables.
 */
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.coerce.number().int().default(3000),

    SERVICE_ACCOUNT_EMAIL: z.email({ message: "Invalid service account email" }),
    GOOGLE_CREDENTIALS_B64: z.string().min(1, { message: "GOOGLE_CREDENTIALS_B64 cannot be empty" }),

    SPACE_NAME: z.string().min(1, { message: "SPACE_NAME" }),
    THREAD_NAME: z.string().min(1, { message: "THREAD_NAME" }),
});

/**
 * Parsed and validated environment variables.
 * The app will fail to start if the environment variables are invalid.
 */
export const env = envSchema.parse(process.env);
