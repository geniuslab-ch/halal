// Pricing is configurable here rather than hard-coded in components,
// so it can later be moved into the database / admin panel.
export const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "forever",
    features: ["Basic profile", "Address & opening hours", "Phone number", "Basic listing"],
    highlighted: false,
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: 49,
    period: "month",
    features: ["Full shop profile", "Product catalogue", "Promotions", "WhatsApp button", "Analytics", "SEO page"],
    highlighted: true,
  },
  {
    id: "PRO",
    name: "Pro",
    price: 99,
    period: "month",
    features: [
      "Everything in Growth",
      "Advanced analytics",
      "Demand insights",
      "Featured offers",
      "Priority visibility",
      "Promotional campaigns",
    ],
    highlighted: false,
  },
] as const;
