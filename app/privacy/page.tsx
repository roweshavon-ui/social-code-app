export const metadata = {
  title: "Privacy Policy — Social Code",
  description: "How Social Code collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#0D1825" }}
    >
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-white mb-3">1. Who we are</h2>
            <p>
              Social Code is a social skills coaching service operated by Shavon Rowe
              (<a href="mailto:shavi@joinsocialcode.com" className="underline" style={{ color: "#00D9C0" }}>shavi@joinsocialcode.com</a>).
              Our website is <a href="https://joinsocialcode.com" className="underline" style={{ color: "#00D9C0" }}>joinsocialcode.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. What we collect</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Name and email address when you sign up for our email list or purchase a product.</li>
              <li>Answers to our personality questionnaire if you choose to complete it.</li>
              <li>Payment information processed securely by Stripe or Gumroad — we never see your card details.</li>
              <li>Basic usage data (page views, link clicks) collected anonymously via analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. How we use it</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>To send you emails you signed up for (frameworks, coaching tips, product updates).</li>
              <li>To fulfil purchases and deliver digital products.</li>
              <li>To personalise coaching sessions based on your type profile.</li>
              <li>To improve our content and understand what resonates with our audience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. Email communications</h2>
            <p>
              We use Kit (formerly ConvertKit) to manage our email list. Every marketing email
              includes an unsubscribe link. You can also unsubscribe at any time by visiting{" "}
              <a href="https://app.joinsocialcode.com/unsubscribe" className="underline" style={{ color: "#00D9C0" }}>
                app.joinsocialcode.com/unsubscribe
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. Sharing your data</h2>
            <p>
              We do not sell, rent, or trade your personal information. We share data only with
              the third-party tools we use to operate (Kit, Stripe, Gumroad, Resend, Supabase,
              Vercel) and only to the extent necessary to provide our services. Each of these
              services has its own privacy policy and data-processing agreements.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. Data retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to
              provide services. If you unsubscribe from our email list, your email is removed
              from our marketing system within 30 days. You can request full deletion of your
              data at any time by emailing{" "}
              <a href="mailto:shavi@joinsocialcode.com" className="underline" style={{ color: "#00D9C0" }}>
                shavi@joinsocialcode.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">7. Your rights</h2>
            <p>
              You have the right to access, correct, or delete the personal data we hold about
              you. To exercise any of these rights, contact us at{" "}
              <a href="mailto:shavi@joinsocialcode.com" className="underline" style={{ color: "#00D9C0" }}>
                shavi@joinsocialcode.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">8. Cookies</h2>
            <p>
              Our app uses a single session cookie (<code className="text-xs bg-white/10 px-1 py-0.5 rounded">sc_admin</code> or{" "}
              <code className="text-xs bg-white/10 px-1 py-0.5 rounded">sc_client</code>) for authentication. It is
              strictly necessary for the service to function and does not track you across other websites.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">9. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We&apos;ll post the updated version
              here with a revised date. Continued use of our services after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">10. Contact</h2>
            <p>
              Questions? Email us at{" "}
              <a href="mailto:shavi@joinsocialcode.com" className="underline" style={{ color: "#00D9C0" }}>
                shavi@joinsocialcode.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
