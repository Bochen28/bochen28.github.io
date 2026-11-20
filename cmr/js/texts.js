// Printed texts of the CMR consignment note, in every language the form can be printed in.
// Box numbers follow the standard IRU layout of the CMR note.

export const LANGS = {
  en: "English",
  pl: "Polski",
  de: "Deutsch",
  fr: "Français",
};

// Up to this many languages fit in the boxes of an A4 note.
export const MAX_LANGS = 3;

export const T = {
  title: {
    en: "INTERNATIONAL CONSIGNMENT NOTE",
    pl: "MIĘDZYNARODOWY SAMOCHODOWY LIST PRZEWOZOWY",
    de: "INTERNATIONALER FRACHTBRIEF",
    fr: "LETTRE DE VOITURE INTERNATIONALE",
  },
  clause: {
    en: "This carriage is subject, notwithstanding any clause to the contrary, to the Convention on the Contract for the International Carriage of Goods by Road (CMR).",
    pl: "Niniejszy przewóz podlega, bez względu na jakąkolwiek przeciwną klauzulę, postanowieniom Konwencji o umowie międzynarodowej przewozu drogowego towarów (CMR).",
    de: "Diese Beförderung unterliegt trotz einer gegenteiligen Abmachung den Bestimmungen des Übereinkommens über den Beförderungsvertrag im internationalen Straßengüterverkehr (CMR).",
    fr: "Ce transport est soumis, nonobstant toute clause contraire, à la Convention relative au contrat de transport international de marchandises par route (CMR).",
  },
  no: { en: "No.", pl: "Nr", de: "Nr.", fr: "No" },

  b1: {
    en: "Sender (name, address, country)",
    pl: "Nadawca (nazwisko lub nazwa, adres, kraj)",
    de: "Absender (Name, Anschrift, Land)",
    fr: "Expéditeur (nom, adresse, pays)",
  },
  b2: {
    en: "Consignee (name, address, country)",
    pl: "Odbiorca (nazwisko lub nazwa, adres, kraj)",
    de: "Empfänger (Name, Anschrift, Land)",
    fr: "Destinataire (nom, adresse, pays)",
  },
  b3: {
    en: "Place of delivery of the goods (place, country)",
    pl: "Miejsce przeznaczenia (miejscowość, kraj)",
    de: "Auslieferungsort des Gutes (Ort, Land)",
    fr: "Lieu prévu pour la livraison de la marchandise (lieu, pays)",
  },
  b4: {
    en: "Place and date of taking over the goods (place, country, date)",
    pl: "Miejsce i data załadowania (miejscowość, kraj, data)",
    de: "Ort und Tag der Übernahme des Gutes (Ort, Land, Datum)",
    fr: "Lieu et date de la prise en charge de la marchandise (lieu, pays, date)",
  },
  b5: {
    en: "Documents attached",
    pl: "Załączone dokumenty",
    de: "Beigefügte Dokumente",
    fr: "Documents annexés",
  },
  b6: { en: "Marks and Nos", pl: "Cechy i numery", de: "Kennzeichen und Nummern", fr: "Marques et numéros" },
  b7: { en: "Number of packages", pl: "Ilość sztuk", de: "Anzahl der Packstücke", fr: "Nombre des colis" },
  b8: { en: "Method of packing", pl: "Sposób opakowania", de: "Art der Verpackung", fr: "Mode d'emballage" },
  b9: { en: "Nature of the goods", pl: "Rodzaj towaru", de: "Bezeichnung des Gutes", fr: "Nature de la marchandise" },
  b10: { en: "Statistical number", pl: "Numer statystyczny", de: "Statistiknummer", fr: "No statistique" },
  b11: { en: "Gross weight, kg", pl: "Waga brutto w kg", de: "Bruttogewicht in kg", fr: "Poids brut, kg" },
  b12: { en: "Volume, m³", pl: "Objętość w m³", de: "Umfang in m³", fr: "Cubage, m³" },
  goodsTotal: { en: "Total", pl: "Razem", de: "Summe", fr: "Total" },

  adr: { en: "ADR", pl: "ADR", de: "ADR", fr: "ADR" },
  adrUn: { en: "UN No.", pl: "UN nr", de: "UN-Nr.", fr: "No ONU" },
  adrName: { en: "Proper shipping name", pl: "Nazwa", de: "Benennung", fr: "Désignation officielle" },
  adrLabel: { en: "Label model No.", pl: "Nr wzoru nalepki", de: "Gefahrzettelmuster", fr: "Modèle d'étiquette" },
  adrGroup: { en: "Packing group", pl: "Grupa pakowania", de: "Verpackungsgruppe", fr: "Groupe d'emballage" },

  b13: {
    en: "Sender's instructions (customs and other formalities)",
    pl: "Instrukcje nadawcy (formalności celne i inne)",
    de: "Anweisungen des Absenders (Zoll- und sonstige amtliche Behandlung)",
    fr: "Instructions de l'expéditeur (formalités douanières et autres)",
  },
  b14: {
    en: "Instructions as to payment for carriage",
    pl: "Postanowienia odnośnie przewoźnego",
    de: "Frachtzahlungsanweisungen",
    fr: "Prescriptions d'affranchissement",
  },
  paid: { en: "Carriage paid", pl: "Przewoźne zapłacone", de: "Frei", fr: "Franco" },
  forward: { en: "Carriage forward", pl: "Przewoźne nie zapłacone", de: "Unfrei", fr: "Non franco" },
  b15: { en: "Cash on delivery", pl: "Zapłata", de: "Rückerstattung", fr: "Remboursement" },
  b16: {
    en: "Carrier (name, address, country)",
    pl: "Przewoźnik (nazwisko lub nazwa, adres, kraj)",
    de: "Frachtführer (Name, Anschrift, Land)",
    fr: "Transporteur (nom, adresse, pays)",
  },
  b17: {
    en: "Successive carriers (name, address, country)",
    pl: "Kolejni przewoźnicy (nazwisko lub nazwa, adres, kraj)",
    de: "Nachfolgende Frachtführer (Name, Anschrift, Land)",
    fr: "Transporteurs successifs (nom, adresse, pays)",
  },
  b18: {
    en: "Carrier's reservations and observations",
    pl: "Zastrzeżenia i uwagi przewoźnika",
    de: "Vorbehalte und Bemerkungen der Frachtführer",
    fr: "Réserves et observations du transporteur",
  },
  b19: {
    en: "Special agreements",
    pl: "Postanowienia specjalne",
    de: "Besondere Vereinbarungen",
    fr: "Conventions particulières",
  },
  b20: { en: "To be paid by", pl: "Do zapłacenia przez", de: "Zu zahlen vom", fr: "À payer par" },
  paySender: { en: "Sender", pl: "Nadawcę", de: "Absender", fr: "Expéditeur" },
  payCurrency: { en: "Currency", pl: "Waluta", de: "Währung", fr: "Monnaie" },
  payConsignee: { en: "Consignee", pl: "Odbiorcę", de: "Empfänger", fr: "Destinataire" },
  carriage: { en: "Carriage charges", pl: "Cena przewozu", de: "Fracht", fr: "Prix de transport" },
  deductions: { en: "Deductions", pl: "Bonifikaty", de: "Ermäßigungen", fr: "Réductions" },
  balance: { en: "Balance", pl: "Saldo", de: "Zwischensumme", fr: "Solde" },
  supplements: { en: "Supplementary charges", pl: "Dopłaty", de: "Zuschläge", fr: "Suppléments" },
  other: { en: "Other charges", pl: "Koszty dodatkowe", de: "Nebengebühren", fr: "Frais accessoires" },
  misc: { en: "Miscellaneous", pl: "Inne", de: "Sonstiges", fr: "Divers" },
  total: { en: "Total", pl: "Razem", de: "Gesamtsumme", fr: "Total" },

  b21: { en: "Established in", pl: "Wystawiono w", de: "Ausgefertigt in", fr: "Établie à" },
  on: { en: "on", pl: "dnia", de: "am", fr: "le" },
  b22: {
    en: "Signature and stamp of the sender",
    pl: "Podpis i stempel nadawcy",
    de: "Unterschrift und Stempel des Absenders",
    fr: "Signature et timbre de l'expéditeur",
  },
  b23: {
    en: "Signature and stamp of the carrier",
    pl: "Podpis i stempel przewoźnika",
    de: "Unterschrift und Stempel des Frachtführers",
    fr: "Signature et timbre du transporteur",
  },
  b24: { en: "Goods received", pl: "Przesyłkę otrzymano", de: "Gut empfangen", fr: "Marchandises reçues" },
  place: { en: "Place", pl: "Miejscowość", de: "Ort", fr: "Lieu" },
  b24sign: {
    en: "Signature and stamp of the consignee",
    pl: "Podpis i stempel odbiorcy",
    de: "Unterschrift und Stempel des Empfängers",
    fr: "Signature et timbre du destinataire",
  },
  b25: { en: "Registration number", pl: "Nr rejestracyjny", de: "Amtl. Kennzeichen", fr: "Immatriculation" },
  truck: { en: "Truck", pl: "Samochód", de: "Kfz", fr: "Véhicule" },
  trailer: { en: "Trailer", pl: "Naczepa", de: "Anhänger", fr: "Remorque" },
  note: {
    en: "Boxes 1–15, 19, 21 and 22 are completed by the sender. Boxes in bold lines are completed by the carrier.",
    pl: "Rubryki 1–15 oraz 19, 21 i 22 wypełnia nadawca. Rubryki obwiedzione grubą linią wypełnia przewoźnik.",
    de: "Die Rubriken 1–15 sowie 19, 21 und 22 füllt der Absender aus. Die fett umrandeten Rubriken füllt der Frachtführer aus.",
    fr: "Les cases 1 à 15, 19, 21 et 22 sont remplies par l'expéditeur. Les cases encadrées en gras sont remplies par le transporteur.",
  },
};

// Name printed at the top of each copy; copies past the third are extra copies.
const COPY_NAMES = [
  { en: "Copy for sender", pl: "Egzemplarz dla nadawcy", de: "Exemplar für den Absender", fr: "Exemplaire de l'expéditeur" },
  { en: "Copy for consignee", pl: "Egzemplarz dla odbiorcy", de: "Exemplar für den Empfänger", fr: "Exemplaire du destinataire" },
  { en: "Copy for carrier", pl: "Egzemplarz dla przewoźnika", de: "Exemplar für den Frachtführer", fr: "Exemplaire du transporteur" },
];
const EXTRA_COPY = { en: "Additional copy", pl: "Egzemplarz dodatkowy", de: "Zusätzliches Exemplar", fr: "Exemplaire supplémentaire" };

// The usual colours of the CMR copies: red, blue, green, then black.
const COPY_COLORS = ["#d32f2f", "#1565c0", "#2e7d32"];
const EXTRA_COLOR = "#37474f";

// Short names for the screen (in English, like the rest of the app).
const COPY_SHORT = ["Sender", "Consignee", "Carrier"];

export function copyInfo(index) {
  return {
    number: index + 1,
    names: COPY_NAMES[index] || EXTRA_COPY,
    color: COPY_COLORS[index] || EXTRA_COLOR,
    short: COPY_SHORT[index] || "Extra copy",
  };
}
