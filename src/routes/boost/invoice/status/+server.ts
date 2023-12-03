import { LNBITS_API_KEY, LNBITS_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import axios from 'axios';

// check the status of an invoice
// @ts-expect-error
export async function GET({ url }) {
	const hash = url.searchParams.get('hash');

	const headers = {
		'X-API-Key': `${LNBITS_API_KEY}`,
		'Content-type': 'application/json'
	};

	const status = await axios
		.get(`https://${LNBITS_URL}/api/v1/payments/${hash}`, { headers })
		.then(function (response) {
			return response.data;
		})
		.catch(function (err) {
			console.log(err);
			throw error(400, 'Could not check invoice status, please try again or contact BTC Map.');
		});

	return new Response(JSON.stringify(status));
}
