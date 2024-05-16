<script lang="ts">
	import { locale, locales, type MLocale } from '$lib/i18n';
	import type { DropdownLink } from '$lib/types';
	import { localeFlags } from 'omni18n';
	import OutClick from 'svelte-outclick';

	function selfLocale(locale: string) {
		return new Intl.DisplayNames(locale, { type: 'language' }).of(locale) || '???';
	}
	let localeDescriptions;
	$: localeDescriptions = locales
		.filter((l) => $locale !== l)
		.map((locale) => ({
			locale,
			flag: localeFlags(locale)[0],
			text: selfLocale(locale)
		}));
	let flag: string;
	$: flag = localeFlags($locale)[0];

	function setLocale(newLocale: MLocale) {
		locale.set(newLocale);
		show = false;
	}

	let show = false;
</script>

<!-- dropdown menu -->
<div class="relative">
	<button
		id="dropdown-languages"
		on:click={() => (show = !show)}
		class="{show
			? 'dark:!text-link'
			: ''} mr-4 mt-4 flex items-center text-xl font-semibold text-link transition-colors hover:text-hover dark:text-white dark:hover:text-link md:mr-0 md:mt-0"
	>
		{flag}
	</button>

	<!-- dropdown items -->
	{#if show}
		<OutClick excludeQuerySelectorAll={`#dropdown-languages`} on:outclick={() => (show = false)}>
			<div class="absolute right-0 top-8 w-[125px] rounded-2xl shadow-lg">
				{#each localeDescriptions as desc}
					<button
						on:click={() => setLocale(desc.locale)}
						class="{$locale === desc.locale
							? 'dark:!text-link'
							: ''}mr-4 mt-4 flex items-center text-xl font-semibold text-link transition-colors hover:text-hover dark:text-white dark:hover:text-link md:mr-0 md:mt-0"
					>
						{desc.flag}
						{desc.text}
					</button>
				{/each}
			</div>
		</OutClick>
	{/if}
</div>
