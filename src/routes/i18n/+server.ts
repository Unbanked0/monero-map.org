import type { KeyInfos, TextInfos } from '$lib/i18n';
import { i18nServer, i18nSource } from '$lib/i18n.server';
import { error, type RequestHandler } from '@sveltejs/kit';
import type { Locale } from 'omni18n/ts';

function ok() {
	return new Response(null, { status: 204 });
}

//#region Common access

export const POST: RequestHandler = async ({ locals: { i18nClient }, cookies, request, url }) => {
	const body = await request.json();
	// All the reports are managed on the server' I18nClient
	if (url.searchParams.get('missing') !== null) {
		const { key } = body;
		// Fake fallback, we don't care about the return value but without it, the function throws
		i18nClient.missing(key, 'client-side');
		return ok();
	}
	if (url.searchParams.get('error') !== null) {
		const { key, error, spec } = body;
		i18nClient.error(key, error, { ...spec, clientSide: true });
		return ok();
	}
	// Actual `condense` query, occurs on user's language change
	const { locale } = body;
	if (locale && locale !== i18nClient.locales[0]) {
		i18nClient.setLocales([locale, ...i18nClient.locales]);
		cookies.set('language', locale, { path: '/' });
	}
	return Response.json(await i18nServer.condense(i18nClient.locales));
};

//#endregion
//#region Translator's access

export const GET: RequestHandler = async ({ url }) => {
	const locales = url.searchParams.get('locales')?.split('€');
	if (!locales) throw error(400, 'Missing locales');
	return Response.json(await i18nSource.workList(locales));
};

export const PUT: RequestHandler = async ({ request }) => {
	const {
		key,
		locale,
		text,
		infos
	}: { key: string; locale: Locale; text: string; infos?: Partial<TextInfos> } =
		await request.json();
	if (!key || !locale) throw error(400, 'Missing key or locale');
	await i18nSource.modify(key, locale, text, infos);
	return ok();
};

//#endregion
//#region Developer's access

export const PATCH: RequestHandler = async ({ request }) => {
	const { key, zone, infos }: { key: string; zone: string; infos?: KeyInfos } =
		await request.json();
	if (!key) throw error(400, 'Missing key');
	await i18nSource.key(key, zone, infos);
	return ok();
};

export const DELETE: RequestHandler = async ({ request }) => {
	const { key, newKey }: { key: string; newKey: string } = await request.json();
	if (!key) throw error(400, 'Missing key');
	await i18nSource.reKey(key, newKey);
	return ok();
};

//#endregion
