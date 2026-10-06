import { json, type PagesContext } from '../../_shared';

export async function onRequestGet(context: PagesContext) {
  const customKey = (context.env.NASA_API_KEY || '').trim();
  return json({
    status: 'online',
    hasCustomNasaKey: customKey.length > 0 && customKey !== 'DEMO_KEY',
    activeProvider: 'NASA Open APIs & OpenNotify',
    runtime: 'Cloudflare Pages Functions',
    serverTime: new Date().toISOString(),
  });
}
