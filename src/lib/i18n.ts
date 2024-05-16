import {
	reports,
	type TContext,
	I18nClient,
	type Locale,
	type Translator
} from 'omni18n';
import { writable } from 'svelte/store';

// PoI: Manage your locales here
export const locales = ['fr', 'en'] as const;
export type MLocale = (typeof locales)[number] & Locale;

export interface TextInfos {}
export interface KeyInfos {}

// Remove duplicates while keeping the order
export function removeDuplicates(arr: MLocale[]) {
	const done = new Set<MLocale>();
	return arr.filter((k) => !done.has(k) && done.add(k));
}

let rq = fetch;
// Used server-side as `fetch` is onto our app, it comes from RequestEvent.fetch
export function setFetch(fn: typeof fetch) {
	rq = fn;
}

export const i18nClient = new I18nClient([], condense);
export const T = writable<Translator>();
export const locale = writable<MLocale>();
let queryLocale: string;
locale.subscribe(async (locale) => {
	if (!locale) return;
	queryLocale = locale;
	await i18nClient.setLocales([locale, ...(<MLocale[]>i18nClient.locales)]);
	initTranslator();
});
Object.assign(reports, {
	error({ key }: TContext, error: string, spec: object) {
		rq(`/i18n?error`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key, error, spec })
		});
		return '[*error*]';
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

export async function condense() {
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
