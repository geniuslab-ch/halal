import { PLANS } from "@/lib/plans";
import { createShopLead } from "@/app/actions/shop";
import { Check } from "lucide-react";

export const metadata = { title: "For businesses" };

const BENEFITS = [
  { title: "Get discovered", body: "Appear when customers search for products and shops near them." },
  { title: "Showcase your products", body: "Create a professional digital catalogue in minutes." },
  { title: "Promote your offers", body: "Publish promotions that link straight to your shop." },
  { title: "Receive customers", body: "One tap to WhatsApp, call, or get directions to your shop." },
  { title: "Understand demand", body: "See what customers nearby are actually searching for." },
];

export default function ForBusinessPage() {
  return (
    <div>
      <section className="hv-texture border-b border-line">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
            Your shop deserves to be found online.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">
            Halal Vaud helps independent halal retailers get discovered by customers
            searching for products, shops and offers near them.
          </p>
          <a href="#add-shop" className="mt-8 inline-block rounded-full bg-pine px-7 py-3 text-sm font-semibold text-linen hover:opacity-90">
            Add my shop
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-line bg-paper p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-3xl font-semibold text-ink">Plans</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 ${plan.highlighted ? "border-pine bg-pine text-linen" : "border-line bg-paper"}`}
            >
              <p className="font-display text-xl font-semibold">{plan.name}</p>
              <p className="mt-2">
                <span className="font-display text-3xl font-semibold">
                  {plan.price === 0 ? "CHF 0" : `CHF ${plan.price}`}
                </span>
                <span className={plan.highlighted ? "text-linen/70" : "text-ink-soft"}> /{plan.period}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-ink-soft">
          MVP pricing shown for reference — no payment is required to join today.
        </p>
      </section>

      <section id="add-shop" className="mx-auto max-w-xl px-5 pb-20">
        <h2 className="font-display text-2xl font-semibold text-ink">Add my shop</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Takes two minutes. Our team will verify your shop before it goes live.
        </p>
        <form action={createShopLead} className="mt-6 space-y-4">
          <Field label="Shop name" name="name" required />
          <Field label="City" name="city" required placeholder="Lausanne" />
          <Field label="Address" name="address" placeholder="Rue de la Gare 12" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" name="phone" placeholder="+41 21 000 00 00" />
            <Field label="WhatsApp" name="whatsapp" placeholder="+41 79 000 00 00" />
          </div>
          <Field label="Contact email" name="email" type="email" required />
          <div>
            <label className="text-sm font-medium text-ink">Description</label>
            <textarea
              name="description"
              rows={3}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-pine"
              placeholder="Halal supermarket specialising in East-African products…"
            />
          </div>
          <button type="submit" className="w-full rounded-full bg-pine px-6 py-3 text-sm font-semibold text-linen hover:opacity-90">
            Submit for verification
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink">
        {label} {required && <span className="text-clay">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-pine"
      />
    </div>
  );
}
