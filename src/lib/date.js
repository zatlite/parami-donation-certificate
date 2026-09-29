// Format an ISO date (YYYY-MM-DD) into a long, localized date string.
// en -> "29 September 2026" (via Intl en-GB).
// my -> "၂၉ စက်တင်ဘာ ၂၀၂၆" — formatted manually because many browsers ship no ICU
// data for the Myanmar locale (Intl would silently fall back to Latin/English).

const MY_MONTHS = [
	'ဇန်နဝါရီ',
	'ဖေဖော်ဝါရီ',
	'မတ်',
	'ဧပြီ',
	'မေ',
	'ဇွန်',
	'ဇူလိုင်',
	'ဩဂုတ်',
	'စက်တင်ဘာ',
	'အောက်တိုဘာ',
	'နိုဝင်ဘာ',
	'ဒီဇင်ဘာ'
];

const EN_MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

function toMyanmarDigits(value) {
	return String(value).replace(/[0-9]/g, (d) => '၀၁၂၃၄၅၆၇၈၉'[Number(d)]);
}

export function formatCertDate(iso, lang) {
	if (!iso) return '';
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) return iso;
	const year = Number(m[1]);
	const monthIdx = Number(m[2]) - 1;
	const day = Number(m[3]);
	if (monthIdx < 0 || monthIdx > 11) return iso;

	if (lang === 'my') {
		return `${toMyanmarDigits(day)} ${MY_MONTHS[monthIdx]} ${toMyanmarDigits(year)}`;
	}

	const d = new Date(year, monthIdx, day);
	if (Number.isNaN(d.getTime())) return iso;
	try {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(d);
	} catch {
		return `${day} ${EN_MONTHS[monthIdx]} ${year}`;
	}
}
