export function hasNeonDatabase(){return Boolean(process.env.DATABASE_URL)}
export function hasNeonAuth(){return Boolean(process.env.NEON_AUTH_BASE_URL&&process.env.NEON_AUTH_COOKIE_SECRET)}
export function getDatabaseUrl(){const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL is not configured.");return url}
