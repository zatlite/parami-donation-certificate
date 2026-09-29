// Fixed certificate text, derived from notes.md.
// `en` = English-only certificate, `my` = Burmese-only certificate.
// User-entered field values (name, address, towards, amount, date) are rendered as typed.

export const CONTENT = {
  en: {
    templeName: "Pāramī Dhamma Centre",
    address: "18 Hilwa St, Villawood, NSW, Australia",
    title: "Certificate of Appreciation for Offering of The Four Requisites",
    labels: {
      date: "Date",
    },
    body: [
      { text: "Having received a donation from " },
      { field: "name" },
      { text: " of " },
      { field: "address" },
      { text: " towards " },
      { field: "towards" },
      { text: " the amount of " },
      { field: "amount" },
      {
        text: ", we gratefully acknowledge the contribution and offer our blessings and words of appreciation \u201CS\u0101dhu\u201D to all the donors.",
      },
    ],
    signatures: ["Received by", "Monastery Trustee Board"],
    quotes: [
      "\u201COffering to the Sangha yields great benefit\u201D",
      "\u201CD\u0101na is the essence of wealth. S\u012Bla is the essence of body. Bh\u0101van\u0101 is the essence of life.\u201D",
    ],
    logoLabels: ["Logo", "Logo"],
  },
  my: {
    templeName: "ပါရမီဓမ္မရိပ်သာ",
    address: "18 Hilwa St, Villawood, NSW, Australia",
    title: "စတုပစ္စယအလှူတော် အနုမောဒနာမှတ်တမ်းလွှာ",
    labels: {
      date: "နေ့စွဲ",
    },
    body: [
      {
        text: "မြတ်ဗုဒ္ဓသာသနာတော်ကြီး အရှည်တည်တံ့ ထွန်းကား ပြန့်ပွါးစေရန် စိတ်ရည်သန်၍ တည်ထောင်ဖွင့်လှစ်အပ်သော ပါရမီဓမ္မရိပ်သာသို့ ",
      },
      { field: "name" },
      { text: " နေရပ်လိပ်စာ " },
      { field: "address" },
      { text: " ထံမှ " },
      { field: "towards" },
      { text: " အတွက် အလှူတော်ငွေ " },
      { field: "amount" },
      { text: " ကို လက်ခံရရှိပါသဖြင့် အလှူရှင်အပေါင်းအား ကောင်းချီးနုမော် သာဓုခေါ်ဆို၍ မှတ်တမ်းတင်အပ်ပါသည်။" },
    ],
    signatures: ["အလှူငွေကောက်ခံသူ", "ကျောင်းအကျိုးတော်ဆောင်အဖွဲ့"],
    quotes: [
      "\u201Cသံဃာတော်အား ပေးကမ်းလှူဒါန်းခြင်းသည် များသောအကျိုးရှိ၏\u201D",
      "\u201Cဥစ္စာပစ္စည်း၏အနှစ်သည် ဒါန၊ မိမိခန္ဓာကိုယ်၏အနှစ်သည် သီလ၊ မိမိအသက်၏အနှစ်သည် ဘာဝနာ\u201D",
    ],
    logoLabels: ["လိုဂို", "လိုဂို"],
  },
};

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "my", label: "မြန်မာ (Burmese)" },
];
