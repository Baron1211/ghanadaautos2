import { createFileRoute } from "@tanstack/react-router";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — RRR Auto Export" },
      { name: "description", content: "How RRR Auto Export collects, uses, shares, stores and protects personal information across vehicle sales, imports, rentals, repairs and parts services." },
      { property: "og:title", content: "Privacy Policy — RRR Auto Export" },
      { property: "og:description", content: "How RRR Auto Export handles personal information, cookies, data retention and your privacy rights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const sections: LegalSection[] = [
  {
    title: "Information We May Collect",
    blocks: [
      "Depending on how you interact with RRR Auto Export, we may collect:",
      { sub: "Identity Information" },
      { list: [
        "Full name",
        "Date of birth where necessary",
        "Government-issued identification where required for a transaction",
        "Driver's licence information where required for rentals, test drives or other services",
      ] },
      { sub: "Contact Information" },
      { list: ["Telephone number", "Email address", "Residential or delivery address", "WhatsApp contact information"] },
      { sub: "Vehicle Information" },
      { list: [
        "Vehicle make and model",
        "Vehicle identification number (VIN)",
        "Registration information",
        "Mileage",
        "Vehicle condition",
        "Repair and service history provided to us",
      ] },
      { sub: "Transaction Information" },
      { list: [
        "Vehicle enquiries", "Purchases", "Reservations", "Deposits", "Payments", "Invoices",
        "Shipping transactions", "Service and repair history",
      ] },
      { sub: "Financing Information" },
      "If you apply for financing, information necessary to process your application may be collected or transmitted to an authorised financing provider.",
      "This may include identification, employment, income and financial information where required.",
      { sub: "Technical Information" },
      "When you use our website, certain technical information may be collected automatically, including:",
      { list: [
        "IP address", "Browser type", "Device type", "Operating system", "Pages visited",
        "Referring website", "Website interaction information", "Cookie identifiers",
      ] },
    ],
  },
  {
    title: "How We Collect Information",
    blocks: [
      "Information may be collected when you:",
      { list: [
        "Visit our website", "Create an account", "Contact us", "Submit a vehicle enquiry", "Request a quotation",
        "Purchase or reserve a vehicle", "Request vehicle sourcing", "Apply for financing", "Rent a vehicle",
        "Book repairs or maintenance", "Purchase spare parts", "Request shipping or clearing services",
        "Subscribe to marketing communications", "Communicate with us through WhatsApp or social media",
      ] },
      "We may also receive information from service providers involved in completing a transaction where lawful and necessary.",
    ],
  },
  {
    title: "Why We Use Your Information",
    blocks: [
      "We may process personal information to:",
      { list: [
        "Respond to enquiries", "Process vehicle purchases and reservations", "Source vehicles",
        "Arrange vehicle importation", "Coordinate shipping and delivery", "Provide clearing and forwarding services",
        "Process rental bookings", "Provide repairs and maintenance", "Supply spare parts", "Process payments",
        "Facilitate financing applications", "Verify identity", "Prevent fraud", "Maintain transaction records",
        "Provide customer support", "Improve our website and services",
        "Send marketing communications where permitted", "Meet legal and regulatory obligations",
      ] },
    ],
  },
  {
    title: "Consent and Other Lawful Processing",
    blocks: [
      "Where consent is required, we will seek appropriate consent before processing personal information.",
      "Certain information may also need to be processed where necessary to perform a contract, meet a legal obligation or for another lawful purpose permitted under applicable law.",
    ],
  },
  {
    title: "Marketing Communications",
    blocks: [
      "Where required, we will obtain your consent before sending direct electronic marketing communications.",
      "Marketing messages should provide an appropriate method for opting out.",
      "You may ask us to stop sending marketing communications at any time.",
      "Transactional messages relating to an existing enquiry, purchase, shipment, rental, repair or other service are different from promotional marketing communications.",
    ],
  },
  {
    title: "Sharing Personal Information",
    blocks: [
      "We do not sell customers' personal information.",
      "Where reasonably necessary to provide our services or comply with the law, information may be shared with appropriate third parties such as:",
      { list: [
        "Banks and payment processors", "Financing providers", "Insurance providers", "Shipping companies",
        "Freight forwarders", "Customs and port service providers", "Vehicle inspection providers",
        "Government authorities", "Professional advisers", "Website and IT service providers",
      ] },
      "Third parties may process information according to their own legal obligations and privacy policies.",
    ],
  },
  {
    title: "International Data Transfers",
    blocks: [
      "Because certain RRR Auto Export activities may involve both Ghana and China, information may need to be processed or transmitted internationally.",
      "Where this occurs, we will take reasonable steps required by applicable law to safeguard personal information.",
    ],
  },
  {
    title: "Cookies and Website Technologies",
    blocks: [
      "Our website may use cookies and similar technologies to:",
      { list: [
        "Keep the website functioning", "Remember user preferences", "Measure website performance",
        "Understand how visitors use the website", "Improve advertising and marketing",
      ] },
      "Users may control certain cookies through their browser or any cookie-management tools provided on the website.",
    ],
  },
  {
    title: "Data Security",
    blocks: [
      "We use reasonable administrative, technical and organisational safeguards designed to protect personal information from unauthorised access, disclosure, alteration, loss or misuse.",
      "No internet-based system can guarantee absolute security.",
    ],
  },
  {
    title: "Data Retention",
    blocks: [
      "We retain personal information only for as long as reasonably necessary for the purpose for which it was collected and to meet applicable accounting, contractual, legal, regulatory and dispute-resolution requirements.",
      "Information that is no longer required will be securely deleted, destroyed or anonymised where appropriate.",
    ],
  },
  {
    title: "Your Privacy Rights",
    blocks: [
      "Subject to applicable law, you may have rights relating to your personal information, including rights to:",
      { list: [
        "Request information about how your data is processed.",
        "Request access to personal information held about you.",
        "Request correction of inaccurate information.",
        "Object to certain processing.",
        "Withdraw consent where processing is based on consent.",
        "Object to direct marketing.",
      ] },
      "Certain rights may be subject to lawful limitations.",
    ],
  },
  {
    title: "Children's Privacy",
    blocks: [
      "Our automotive services are generally intended for adults capable of entering into vehicle and service transactions.",
      "We do not knowingly seek to collect children's personal information through our website except where legally appropriate and necessary.",
    ],
  },
  {
    title: "Third-Party Websites",
    blocks: [
      "Our website may contain links to websites operated by third parties.",
      "RRR Auto Export is not responsible for the privacy practices of independent third-party websites.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    blocks: [
      "We may update this Privacy Policy to reflect changes in our services, technology, business practices or applicable law.",
      "The current version will be published on our website.",
    ],
  },
  {
    title: "Contact Us",
    blocks: [
      "For questions, access requests, corrections, objections or other privacy-related matters, contact us using the details below.",
    ],
  },
];

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      effectiveDate="24 August 2026"
      lastUpdated="24 August 2026"
      intro={[
        "RRR Auto Export respects your privacy and is committed to handling personal information responsibly and securely.",
        "This Privacy Policy explains how we collect, use, store, disclose and protect personal information when you visit www.ghanadaautos.com, contact us or use our automotive services.",
      ]}
      sections={sections}
    />
  );
}
