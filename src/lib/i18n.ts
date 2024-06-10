import {
	reports,
	type TContext,
	I18nClient,
	type Locale,
	type Translator,
	type LocaleFlagsEngine
} from 'omni18n/ts';
import { writable } from 'svelte/store';

// PoI: Manage your locales here
export const locales = ['fr', 'en'] as const;

export interface TextInfos {}
export interface KeyInfos {}

let rq = fetch;
// Used server-side as `fetch` is onto our app, it comes from RequestEvent.fetch
export function setFetch(fn: typeof fetch) {
	rq = fn;
}

export const i18nClient = new I18nClient([], condense);
export const T = writable<Translator>();
export const locale = writable<Locale>();
let queryLocale: string;
locale.subscribe(async (locale) => {
	if (!locale) return;
	queryLocale = locale;
	await i18nClient.setLocales([locale]);
	await initTranslator();
});
Object.assign(reports, {
	error({ key }: TContext, error: string, spec: object) {
		rq(`/i18n?error`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key, error, spec })
		});
		return '[*translation error*]';
	},
	missing({ key }: TContext, fallback: string) {
		rq(`/i18n?missing`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key })
		});
		return fallback || `[${key}]`;
	}
});

async function condense() {
	const response = await rq(`/i18n`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ locale: queryLocale })
	});
	return await response.json();
}
export async function initTranslator() {
	T.set(await i18nClient.enter());
}

export const localeFlags = writable<LocaleFlagsEngine>();
