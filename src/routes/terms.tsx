import { createFileRoute } from "@tanstack/react-router";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Ghanada Autos" },
      { name: "description", content: "Terms and Conditions governing vehicle sales, sourcing, imports, rentals, repairs, spare parts and website use at Ghanada Autos in Ghana and Canada." },
      { property: "og:title", content: "Terms & Conditions — Ghanada Autos" },
      { property: "og:description", content: "The terms governing Ghanada Autos vehicle sales, imports, rentals, repairs and spare parts services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const sections: LegalSection[] = [
  {
    title: "About Ghanada Autos",
    blocks: [
      "Ghanada Autos is an automotive business serving customers in Ghana and, where applicable, facilitating automotive transactions and vehicle sourcing from Canada and other approved markets.",
      "Our services may include:",
      { list: [
        "Vehicle sales",
        "Vehicle sourcing",
        "Vehicle importation",
        "International vehicle shipping",
        "Clearing and forwarding assistance",
        "Vehicle rentals",
        "Vehicle repairs and maintenance",
        "Vehicle diagnostics and inspections",
        "Automotive spare parts and accessories",
        "Vehicle financing assistance, where available",
        "Other automotive-related services",
      ] },
      "Some services may be provided directly by Ghanada Autos, while others may involve independent third-party service providers.",
    ],
  },
  {
    title: "Website Information",
    blocks: [
      "We make reasonable efforts to ensure information displayed on our website is accurate and current.",
      "However, vehicle availability, specifications, mileage, colours, photographs, prices, exchange rates, shipping charges, customs duties, taxes and other information may change.",
      "An error appearing on the website does not automatically require Ghanada Autos to complete a transaction based on an obvious pricing, typographical or technical error.",
      "Customers should confirm important information with Ghanada Autos before making a payment or entering into a transaction.",
    ],
  },
  {
    title: "Vehicle Availability",
    blocks: [
      "All vehicles displayed on our website are subject to availability.",
      "Displaying a vehicle on the website does not guarantee that the vehicle remains available for purchase.",
      "A vehicle may be sold, reserved, withdrawn or otherwise become unavailable before the website listing is updated.",
    ],
  },
  {
    title: "Vehicle Condition",
    blocks: [
      "Unless expressly described as new, vehicles offered by Ghanada Autos may be pre-owned.",
      "Normal wear, mileage and cosmetic imperfections may therefore exist depending on the age and previous use of the vehicle.",
      "We encourage customers to review available photographs, inspection information, vehicle history information and other documentation before purchasing.",
      "Where reasonably possible, customers may request an independent inspection before completing a purchase.",
    ],
  },
  {
    title: "Prices",
    blocks: [
      "Vehicle and service prices may be displayed in Ghanaian Cedis (GHS), Canadian Dollars (CAD), United States Dollars (USD), or another stated currency.",
      "Unless expressly stated otherwise, a displayed vehicle price may not include:",
      { list: [
        "Registration fees", "Insurance", "Customs duties", "Port charges", "Shipping costs",
        "Clearing charges", "Taxes", "Inspection fees", "Delivery charges", "Financing costs",
        "Government levies", "Other third-party charges",
      ] },
      "The customer's quotation, invoice or purchase agreement will identify the charges applicable to the particular transaction.",
    ],
  },
  {
    title: "Deposits and Reservations",
    blocks: [
      "Ghanada Autos may require a deposit to reserve, source, import or purchase a vehicle.",
      "The amount and refundability of the deposit will be communicated to the customer before payment.",
      "A reservation is not confirmed until the required deposit has been received and acknowledged by Ghanada Autos.",
      "Where Ghanada Autos has already incurred costs or committed funds to acquire, transport, inspect, reserve or process a vehicle specifically for a customer, those amounts may be non-refundable to the extent permitted by applicable law and the customer's specific agreement.",
    ],
  },
  {
    title: "Payments",
    blocks: [
      "Payments must be made through payment methods approved by Ghanada Autos.",
      "Customers are responsible for ensuring that payments are made to official Ghanada Autos payment channels.",
      "We will never intentionally require a customer to make payment to an unauthorised personal account.",
      "Customers should contact Ghanada Autos directly if they receive suspicious payment instructions.",
    ],
  },
  {
    title: "Vehicle Sourcing and Special Orders",
    blocks: [
      "Customers may request that Ghanada Autos locate or purchase a particular vehicle on their behalf.",
      "Vehicle sourcing may depend on:",
      { list: [
        "Vehicle availability", "Auction or seller availability", "Customer budget", "Vehicle condition",
        "Shipping availability", "Exchange rates", "Import restrictions", "Customs requirements", "Government regulations",
      ] },
      "Where a vehicle is specially sourced or purchased specifically for a customer, cancellation and refund rights may be subject to the written quotation or sourcing agreement.",
    ],
  },
  {
    title: "Vehicle Importation",
    blocks: [
      "Where Ghanada Autos assists with importing a vehicle, estimated costs and delivery dates are estimates unless expressly guaranteed in writing.",
      "International vehicle transportation may be affected by matters outside our reasonable control, including:",
      { list: [
        "Shipping schedules", "Vessel delays", "Port congestion", "Customs examinations", "Weather",
        "Government action", "Changes in import regulations", "Documentation delays", "Labour disruptions", "Carrier delays",
      ] },
      "Ghanada Autos will make reasonable efforts to keep customers informed of material developments.",
    ],
  },
  {
    title: "Customs Duties and Government Charges",
    blocks: [
      "Import duties, taxes, levies and government charges are determined by the relevant authorities and may change.",
      "Any customs or duty estimate provided through our website, calculator, employee or representative is an estimate unless expressly identified as a final official assessment.",
      "The final assessment of applicable duties and government charges remains subject to the relevant government authority.",
    ],
  },
  {
    title: "Vehicle Delivery",
    blocks: [
      "Delivery dates are estimates unless Ghanada Autos expressly agrees otherwise in writing.",
      "Customers must provide accurate delivery information and cooperate with any documentation or identification requirements necessary to release or deliver a vehicle.",
      "Risk, title and responsibility for a vehicle will transfer according to the customer's applicable purchase, shipping or delivery agreement and applicable law.",
    ],
  },
  {
    title: "Returns, Cancellations and Refunds",
    blocks: [
      "Vehicle purchases, special orders, imported vehicles and customised sourcing transactions may not be returnable merely because a customer changes their mind, subject always to applicable Ghanaian law and the terms communicated before the transaction.",
      "Where Ghanada Autos agrees to a refund, applicable administrative costs, transaction charges, third-party costs and expenses already incurred may be deducted where legally permitted.",
      "Nothing in these Terms removes any statutory rights a customer may have under applicable law.",
    ],
  },
  {
    title: "Vehicle Warranty",
    blocks: [
      "Any warranty applicable to a vehicle will be specifically stated in the relevant purchase agreement, warranty document or vehicle listing.",
      "A manufacturer's or third-party warranty is governed by the terms of that warranty provider.",
      "Customers should not assume that a vehicle carries a warranty unless this has been expressly confirmed.",
    ],
  },
  {
    title: "Repairs and Maintenance",
    blocks: [
      "Customers authorise Ghanada Autos to perform the repair, maintenance or diagnostic services described in the applicable work order.",
      "Additional work requiring a material additional charge should normally be approved by the customer before it is undertaken, except where immediate action is reasonably necessary for safety or to prevent further damage and obtaining approval is impracticable.",
    ],
  },
  {
    title: "Spare Parts",
    blocks: [
      "Customers are responsible for providing accurate vehicle information when ordering parts.",
      "Electrical, electronic, specially ordered or installed parts may be subject to specific return restrictions.",
      "Warranty claims relating to a manufacturer's part may be subject to the manufacturer's warranty conditions.",
    ],
  },
  {
    title: "Vehicle Rentals",
    blocks: [
      "Vehicle rentals are subject to a separate rental agreement.",
      "The rental agreement may establish requirements relating to:",
      { list: [
        "Driver eligibility", "Driver's licence", "Security deposit", "Fuel", "Mileage", "Insurance",
        "Vehicle damage", "Traffic offences", "Late returns", "Additional drivers", "Geographic restrictions",
      ] },
      "Where there is a conflict concerning a rental transaction, the signed rental agreement will govern to the extent permitted by law.",
    ],
  },
  {
    title: "Financing",
    blocks: [
      "Where financing is offered, financing may be provided by an independent financial institution or financing partner.",
      "Submission of an application does not guarantee approval.",
      "Approval, interest rates, repayment terms and credit limits are determined by the applicable financing provider.",
    ],
  },
  {
    title: "Intellectual Property",
    blocks: [
      "The Ghanada Autos name, logo, website design, original photographs, graphics, text and other proprietary materials may not be copied, reproduced, distributed or commercially exploited without permission, except where otherwise permitted by law.",
      "Third-party trademarks remain the property of their respective owners.",
    ],
  },
  {
    title: "Acceptable Website Use",
    blocks: [
      "Users must not:",
      { list: [
        "Attempt unauthorised access to the website or its systems.",
        "Introduce malware or malicious software.",
        "Fraudulently submit applications or enquiries.",
        "Impersonate another person.",
        "Scrape or systematically copy our inventory without authorisation.",
        "Use the website for unlawful activities.",
      ] },
    ],
  },
  {
    title: "Third-Party Services",
    blocks: [
      "Our website or services may integrate or link to third-party providers such as payment processors, finance providers, insurers, shipping companies, customs agents, vehicle-history providers, mapping services and social-media platforms.",
      "Those third parties may operate under their own terms and privacy policies.",
    ],
  },
  {
    title: "Limitation of Liability",
    blocks: [
      "To the maximum extent permitted by applicable law, Ghanada Autos will not be responsible for indirect or consequential losses arising from circumstances beyond our reasonable control.",
      "Nothing in these Terms excludes or limits liability where doing so would be prohibited by applicable law.",
    ],
  },
  {
    title: "Force Majeure",
    blocks: [
      "Ghanada Autos will not be responsible for a delay or failure caused by circumstances reasonably beyond our control, including natural disasters, severe weather, war, civil disturbance, government restrictions, port closures, shipping disruptions, strikes or major system failures.",
    ],
  },
  {
    title: "Privacy",
    blocks: [
      "Personal information submitted through our website or services will be handled in accordance with our Privacy Policy and applicable data-protection law.",
    ],
  },
  {
    title: "Changes to These Terms",
    blocks: [
      "We may update these Terms and Conditions periodically.",
      "The latest version will be published on our website together with its effective or last-updated date.",
    ],
  },
  {
    title: "Governing Law",
    blocks: [
      "These Terms and Conditions are governed by the laws of the Republic of Ghana, subject to any mandatory legal rights or jurisdictional rules that apply to a particular transaction.",
    ],
  },
  {
    title: "Contact Us",
    blocks: [
      "Questions concerning these Terms and Conditions may be directed to our team using the details below.",
    ],
  },
];

function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms and Conditions"
      effectiveDate="24 August 2026"
      lastUpdated="24 August 2026"
      intro={[
        "Welcome to Ghanada Autos. These Terms and Conditions govern your access to and use of our website, products, vehicle listings and automotive services.",
        "By accessing our website, submitting an enquiry, requesting a quotation, making a booking, placing an order, paying a deposit, purchasing a vehicle or otherwise using our services, you acknowledge that you have read and understood these Terms and Conditions.",
      ]}
      sections={sections}
    />
  );
}
