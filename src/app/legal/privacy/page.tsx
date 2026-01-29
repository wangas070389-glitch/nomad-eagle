import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Policy - Nomad Eagle",
    description: "How we collect, use, and protect your data."
}

export default function PrivacyPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <h1>Privacy Policy</h1>
            <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 mt-8">
                <section>
                    <h3>1. Data Collection</h3>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, input financial data, or communicate with us. This may include:
                    </p>
                    <ul>
                        <li>Account information (name, email)</li>
                        <li>Financial data (transactions, balances, investments)</li>
                        <li>Usage data and device information</li>
                    </ul>
                </section>

                <section>
                    <h3>2. Use of Information</h3>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul>
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send you technical notices, updates, and support messages</li>
                        <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                    </ul>
                </section>

                <section>
                    <h3>3. Data Security</h3>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                </section>

                <section>
                    <h3>4. Data Sharing</h3>
                    <p>
                        We do not sell your personal data. We may share your information with third-party service providers who perform services on our behalf, such as hosting and analytics.
                    </p>
                </section>

                <section>
                    <h3>5. Your Rights</h3>
                    <p>
                        You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing of your data.
                    </p>
                </section>

                <section>
                    <h3>6. Contact</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at privacy@nomadeagle.com.
                    </p>
                </section>
            </div>
        </div>
    )
}
