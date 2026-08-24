import { createFileRoute } from "@tanstack/react-router";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping, Delivery & Vehicle Import Policy — Ghanada Autos" },
      { name: "description", content: "How Ghanada Autos handles Canada-to-Ghana vehicle shipping, customs duties, clearing and forwarding, delivery, collection and transport delays." },
      { property: "og:title", content: "Shipping, Delivery & Vehicle Import Policy — Ghanada Autos" },
      { property: "og:description", content: "Vehicle shipping, importation, clearing, delivery and collection terms for Ghanada Autos customers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShippingPolicyPage,
});

const sections: LegalSection[] = [
  {
    title: "Our Shipping Services",
    blocks: [
      "Depending on the transaction, Ghanada Autos may assist customers with:",
      { list: [
        "Vehicle transportation", "Vehicle export", "International ocean freight", "Container shipping",
        "Roll-on/Roll-off (RoRo) shipping", "Port documentation", "Vehicle importation",
        "Clearing and forwarding coordination", "Inland transportation", "Final delivery",
      ] },
      "Availability depends on the vehicle, origin, destination, shipping provider and applicable regulations.",
    ],
  },
  {
    title: "Canada-to-Ghana Vehicle Shipping",
    blocks: [
      "For vehicles sourced or purchased in Canada for customers in Ghana, the process may include:",
      { list: [
        "Vehicle purchase", "Inspection", "Inland transportation", "Export processing", "Port handling",
        "Ocean shipping", "Arrival in Ghana", "Customs and clearing", "Collection or delivery",
      ] },
      "Customers will receive available information about their transaction as the vehicle progresses through the process.",
    ],
  },
  {
    title: "Shipping Quotations",
    blocks: [
      "Shipping quotations may depend on:",
      { list: [
        "Vehicle size and weight", "Vehicle location", "Departure port", "Destination port", "Shipping method",
        "Inland transportation", "Fuel surcharges", "Port charges", "Documentation requirements",
        "Exchange rates", "Carrier pricing",
      ] },
      "Unless expressly identified as fixed, quotations may be subject to adjustment if third-party charges change before the service is confirmed.",
    ],
  },
  {
    title: "Customs Duties and Taxes",
    blocks: [
      "Customs duties, taxes, levies, inspection fees and other government charges may not be included in the vehicle or shipping price unless expressly stated in writing.",
      "Any customs-duty calculator or estimate provided by Ghanada Autos is for estimation purposes unless the amount represents an official assessment.",
      "The applicable Ghanaian authorities determine final customs assessments.",
    ],
  },
  {
    title: "Estimated Shipping Time",
    blocks: [
      "Shipping and delivery times are estimates.",
      "Timing can vary depending on the origin, shipping line, vessel schedule, destination, customs procedures and other circumstances.",
      "Ghanada Autos will provide the best available estimate when the shipment is arranged.",
    ],
  },
  {
    title: "Shipping Delays",
    blocks: [
      "Delays may occur because of circumstances outside our reasonable control, including:",
      { list: [
        "Vessel schedule changes", "Port congestion", "Customs examinations", "Weather", "Mechanical issues",
        "Government restrictions", "Documentation problems", "Labour disruptions", "Carrier delays", "International emergencies",
      ] },
      "Where practical, we will provide customers with available updates regarding material delays.",
    ],
  },
  {
    title: "Shipping Documentation",
    blocks: [
      "Customers must provide accurate and complete information and documents requested for the shipment.",
      "Depending on the transaction, documentation may include:",
      { list: [
        "Government-issued identification", "Purchase invoice", "Vehicle title or ownership documentation",
        "Shipping information", "Consignee details", "Customs documentation",
        "Other documents required by authorities or carriers",
      ] },
      "Incorrect or incomplete information may delay shipment or clearance and may result in additional charges.",
    ],
  },
  {
    title: "Vehicle Inspection Before Shipping",
    blocks: [
      "Where inspection services are included or separately requested, Ghanada Autos may arrange or conduct an inspection before shipment.",
      "Customers may receive available photographs, videos, condition information or inspection documentation.",
      "An inspection reflects the vehicle's observable condition at the time of inspection and does not necessarily constitute a comprehensive mechanical warranty.",
    ],
  },
  {
    title: "Shipping Insurance",
    blocks: [
      "Marine or transportation insurance may be offered, included or available separately depending on the shipment.",
      "Customers should confirm in writing whether their particular shipment is insured and understand the scope, exclusions and claim procedures of any insurance coverage.",
    ],
  },
  {
    title: "Vehicle Condition During Transportation",
    blocks: [
      "Vehicles are handled by independent transporters, port operators and shipping carriers during portions of international transportation.",
      "Customers should promptly inspect a vehicle upon receipt.",
      "Any apparent transportation damage should be photographed and reported promptly so that any available carrier or insurance claim can be investigated.",
    ],
  },
  {
    title: "Arrival in Ghana",
    blocks: [
      "After a vehicle arrives at the destination port, the customer may be required to complete customs, identification, payment or documentation requirements before the vehicle can be released.",
      "Where Ghanada Autos is engaged to provide clearing or forwarding assistance, we will coordinate the agreed services.",
    ],
  },
  {
    title: "Clearing and Forwarding",
    blocks: [
      "Clearing services may involve third-party agents and government authorities.",
      "Customers remain responsible for providing accurate documentation and paying duties, taxes, levies, storage charges and other applicable costs unless their written quotation expressly includes those amounts.",
    ],
  },
  {
    title: "Port Storage and Demurrage",
    blocks: [
      "Vehicles that are not cleared or collected within applicable time limits may incur:",
      { list: ["Storage charges", "Demurrage", "Terminal charges", "Other port-related penalties"] },
      "Where additional charges result from a customer's failure to provide required documents, payments or instructions on time, those charges may be the customer's responsibility to the extent permitted by law and the applicable agreement.",
    ],
  },
  {
    title: "Local Delivery",
    blocks: [
      "Where local delivery is available, delivery charges depend on the destination, vehicle and transportation method.",
      "Customers must provide a safe and accessible delivery location.",
      "The person receiving the vehicle may be required to provide identification and acknowledge receipt.",
    ],
  },
  {
    title: "Collection",
    blocks: [
      "Customers collecting vehicles must comply with identification, payment and release-document requirements.",
      "A vehicle may not be released until outstanding amounts and required documentation have been completed.",
    ],
  },
  {
    title: "Delivery Inspection",
    blocks: [
      "Customers should inspect the vehicle as soon as reasonably possible upon collection or delivery.",
      "Any apparent transportation damage or material discrepancy should be reported promptly together with photographs or other available evidence.",
    ],
  },
  {
    title: "Failed Delivery",
    blocks: [
      "If delivery cannot be completed because the customer:",
      { list: [
        "Provides an incorrect address,",
        "Is unavailable,",
        "Refuses delivery without lawful justification, or",
        "Fails to provide required documentation,",
      ] },
      "additional transportation or storage charges may apply where legally permitted.",
    ],
  },
  {
    title: "Cancellation After Shipping Has Started",
    blocks: [
      "Once a vehicle has been purchased, committed to transportation, delivered to a port, booked with a shipping carrier or shipped internationally, cancellation may not be possible.",
      "Where cancellation remains possible, the customer may be responsible for reasonable non-recoverable costs already incurred, subject to applicable law and the customer's agreement.",
    ],
  },
  {
    title: "Third-Party Shipping Providers",
    blocks: [
      "Ghanada Autos may use independent shipping lines, freight companies, transporters, clearing agents and other logistics providers.",
      "Their own transportation, insurance, liability and operational terms may apply to services they provide.",
    ],
  },
  {
    title: "Force Majeure",
    blocks: [
      "Ghanada Autos will not be responsible for delays caused by events reasonably outside our control, including severe weather, natural disasters, war, civil disturbance, port closures, government restrictions, strikes or major transportation disruptions.",
    ],
  },
  {
    title: "Customer Support",
    blocks: [
      "For questions about shipping, vehicle imports, delivery or clearing, contact us using the details below.",
    ],
  },
];

function ShippingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Shipping, Delivery & Vehicle Import Policy"
      effectiveDate="24 August 2026"
      lastUpdated="24 August 2026"
      intro={[
        "This Shipping, Delivery & Vehicle Import Policy explains how Ghanada Autos handles vehicle transportation, international shipping, delivery and related logistics services.",
      ]}
      sections={sections}
    />
  );
}
