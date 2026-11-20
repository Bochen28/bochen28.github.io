// The copies of the CMR note. The form is the IRU CMR Model 2007 (French / English); each copy is printed
// in its own colour, as IRU describes: red for the sender, blue for the consignee, green for the carrier,
// black for further copies. Each name is a list of [text, bold] parts, like the heading printed on the form.

const COPIES = [
  { fr: [["Exemplaire de l'", false], ["expéditeur", true]], en: [["Copy for ", false], ["sender", true]], color: "#ED1C24", short: "Sender" },
  { fr: [["Exemplaire du ", false], ["destinataire", true]], en: [["Copy for ", false], ["consignee", true]], color: "#0072BC", short: "Consignee" },
  { fr: [["Exemplaire du ", false], ["transporteur", true]], en: [["Copy for ", false], ["carrier", true]], color: "#00A651", short: "Carrier" },
];
const EXTRA = { fr: [["Exemplaire ", false], ["supplémentaire", true]], en: [["Additional", true], [" copy", false]], color: "#231F20", short: "Extra copy" };

export function copyInfo(index) {
  return { number: index + 1, ...(COPIES[index] || EXTRA) };
}
