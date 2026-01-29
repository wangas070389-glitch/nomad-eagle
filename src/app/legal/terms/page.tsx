import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms of Service - Nomad Eagle",
    description: "Legal terms and conditions for using Nomad Eagle Systems."
}

export default function TermsPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <h1>Terms of Service</h1>
            <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 mt-8">
                <section>
                    <h3>1. Introduction</h3>
                    <p>
                        Welcome to Nomad Eagle Systems. By accessing or using our website and services, you agree to be bound by these Terms of Service and our Privacy Policy.
                    </p>
                </section>

                <section>
                    <h3>2. Use of Services</h3>
                    <p>
                        You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                    </p>
                </section>

                <section>
                    <h3>3. Financial Data</h3>
                    <p>
                        Nomad Eagle Systems is a financial planning tool. We do not provide financial advice. All data and projections are for informational purposes only. You should consult with a qualified financial advisor before making any investment decisions.
                    </p>
                </section>

                <section>
                    <h3>4. User Content</h3>
                    <p>
                        You retain ownership of the data you input into the system. By using the service, you grant us a license to process and store this data solely for the purpose of providing the service to you.
                    </p>
                </section>

                <section>
                    <h3>5. Limitation of Liability</h3>
                    <p>
                        To the maximum extent permitted by law, Nomad Eagle Systems shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                    </p>
                </section>

                <section>
                    <h3>6. Contact</h3>
                    <p>
                        If you have any questions about these Terms, please contact us at support@nomadeagle.com.
                    </p>
                </section>
            </div>
        </div>
    )
}
