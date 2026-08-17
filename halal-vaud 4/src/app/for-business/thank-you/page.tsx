export const metadata = { title: "Thank you" };

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">Thanks — you&apos;re on the list.</h1>
      <p className="mt-3 text-ink-soft">
        Your shop was submitted for verification. Our team will reach out shortly to help
        you set up your product catalogue and go live.
      </p>
      <a href="/" className="mt-8 inline-block rounded-full bg-pine px-6 py-3 text-sm font-semibold text-linen hover:opacity-90">
        Back to Halal Vaud
      </a>
    </div>
  );
}
