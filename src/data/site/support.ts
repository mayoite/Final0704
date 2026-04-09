import { SITE_CONTACT } from "@/data/site/contact";

export type VisualIvrActionType = "contact" | "info" | "link";
export type VisualIvrIconId = "user" | "phone" | "info" | "arrow-right";

export type VisualIvrNode = {
  id: string;
  label: string;
  icon?: VisualIvrIconId;
  description?: string;
  options?: VisualIvrNode[];
  action?: {
    type: VisualIvrActionType;
    value: string;
    detail?: string;
  };
};

const OFFICE_SUMMARY = "401 Jagat Trade Centre, Frazer Road, Patna 800013";

export const VISUAL_IVR_TREE: VisualIvrNode = {
  id: "root",
  label: "Support Routing",
  description: "Choose the lane that matches your request.",
  options: [
    {
      id: "sales",
      label: "Sales & Product Requests",
      icon: "user",
      description: "Quotes, product guidance, and workspace planning discussions.",
      options: [
        {
          id: "sales_quote",
          label: "Quotes & Product Advice",
          action: {
            type: "contact",
            value: SITE_CONTACT.salesPhone,
            detail: SITE_CONTACT.salesEmail,
          },
        },
        {
          id: "sales_planning",
          label: "Planning & Layout Help",
          action: {
            type: "link",
            value: "/planner",
            detail: "Open the guided planner or start a layout discussion.",
          },
        },
        {
          id: "sales_visit",
          label: "Office Visit / Contact Desk",
          action: {
            type: "link",
            value: "/contact",
            detail: OFFICE_SUMMARY,
          },
        },
      ],
    },
    {
      id: "support",
      label: "Customer Support",
      icon: "phone",
      description: "Active orders, installation help, warranty, and service follow-up.",
      options: [
        {
          id: "support_order",
          label: "Order Status / Delivery",
          action: {
            type: "contact",
            value: SITE_CONTACT.supportPhone,
            detail: `Keep your order reference ready. ${SITE_CONTACT.openingHours}`,
          },
        },
        {
          id: "support_warranty",
          label: "Warranty / Service Issue",
          action: {
            type: "contact",
            value: SITE_CONTACT.salesEmail,
            detail: "Include photos, invoice details, and the site location.",
          },
        },
        {
          id: "support_docs",
          label: "Manuals / Spare Parts / Documents",
          action: {
            type: "link",
            value: "/contact",
            detail: "Request technical sheets, manuals, or parts support.",
          },
        },
      ],
    },
    {
      id: "general",
      label: "General Inquiry",
      icon: "info",
      description: "Reception, careers, and office information.",
      options: [
        {
          id: "general_switchboard",
          label: "Reception / Switchboard",
          action: {
            type: "contact",
            value: SITE_CONTACT.supportPhone,
            detail: SITE_CONTACT.openingHours,
          },
        },
        {
          id: "general_hr",
          label: "Human Resources / Careers",
          action: {
            type: "link",
            value: "/career",
            detail: "View open positions and share your profile.",
          },
        },
        {
          id: "general_office",
          label: "Corporate Office Details",
          action: {
            type: "info",
            value: OFFICE_SUMMARY,
            detail: "One&Only corporate office, Patna, Bihar, India.",
          },
        },
      ],
    },
  ],
};
