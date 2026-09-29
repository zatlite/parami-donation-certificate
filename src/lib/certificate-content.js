// Fixed certificate text, derived from notes.md.
// `en` = English-only certificate, `my` = Burmese-only certificate.
// User-entered field values (name, address, towards, amount, date) are rendered as typed.

export const CONTENT = {
	en: {
		location: 'Sydney, New South Wales, Australia',
		templeName: 'Pāramī Santikara Vihāra Dhamma Centre',
		address: '18 Hilwa St, Villawood, NSW, Australia',
		title: 'Certificate of Honor for Offering of The Four Requisites',
		labels: {
			date: 'Date',
			name: 'Name',
			address: 'Address',
			towards: 'Donation Towards',
			amount: 'Amount'
		},
		particles: { from: '', for: '', object: '' },
		acknowledgement:
			'We gratefully acknowledge receipt of the contributions and offer our blessings and words of appreciation \u201CS\u0101dhu\u201D to all the donors.',
		signatures: ['Received by (Collector)', 'Monastery Trustee Board'],
		quotes: [
			'\u201COffering to the Sangha yields great benefit\u201D',
			'\u201CD\u0101na is the essence of Wealth. S\u012Bla is the essence of self body. Bh\u0101van\u0101 is the essence of self life.\u201D'
		],
		logoLabels: ['Logo', 'Logo']
	},
	my: {
		location: 'ဩစတြေးလျနိုင်ငံ နယူးဆော့သ်ဝေးလ်ပြည်နယ် ဆစ်ဒနီမြို့',
		templeName: 'ပါရမီသန္တိကရဝိဟာရဓမ္မရိပ်သာ',
		address: '18 Hilwa St, Villawood, NSW, Australia',
		title: 'စတုပစ္စယအလှူတော် အနုမောဒနာမှတ်တမ်းလွှာ',
		labels: {
			date: 'နေ့စွဲ',
			name: 'အလှူရှင်အမည်',
			address: 'နေရပ်လိပ်စာ',
			towards: '',
			amount: 'အလှူတော်ငွေ'
		},
		particles: { from: 'ထံမှ', for: 'အတွက်', object: 'ကို' },
		acknowledgement:
			'လက်ခံရရှိပါသဖြင့် အလှူရှင်အပေါင်းအား ကောင်းချီးနုမော် သာဓုခေါ်ဆို၍ မှတ်တမ်းတင်အပ်ပါသည်။',
		signatures: ['အလှူငွေကောက်ခံသူ', 'ကျောင်းအကျိုးတော်ဆောင်အဖွဲ့'],
		quotes: [
			'\u201Cသံဃာတော်အား ပေးကမ်းလှူဒါန်းခြင်းသည် များသောအကျိုးရှိ၏\u201D',
			'\u201Cဥစ္စာပစ္စည်း၏အနှစ်သည် ဒါန၊ မိမိခန္ဓာကိုယ်၏အနှစ်သည် သီလ၊ မိမိအသက်၏အနှစ်သည် ဘာဝနာ\u201D'
		],
		logoLabels: ['လိုဂို', 'လိုဂို']
	}
};

export const LANGUAGES = [
	{ id: 'en', label: 'English' },
	{ id: 'my', label: 'မြန်မာ (Burmese)' }
];
