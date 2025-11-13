<script setup>
// SEO
useSeoMeta({
    title: 'Privacy Policy - Mappic',
    ogTitle: 'Privacy Policy - Mappic',
    description: 'Learn how Mappic collects, uses, and protects your personal data. GDPR compliant privacy policy.',
    ogDescription: 'Mappic privacy policy. Learn about data collection, usage, and your rights under GDPR.',
    ogImage: '/og-image.png',
    ogUrl: 'https://mappic.app/info/privacy-policy',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Privacy Policy - Mappic',
    twitterDescription: 'How Mappic handles your personal data and protects your privacy.',
    twitterImage: '/og-image.png',
    keywords: 'privacy policy, GDPR, data protection, personal data, Mappic, privacy rights',
    author: 'Bas Bravo',
    robots: 'index, follow',
    canonical: 'https://mappic.app/info/privacy-policy',
});
</script>

<template>
    <div class="w-full text-black">
        <!-- Espacio inicial -->
        <div class="h-22 md:h-46" />

        <section>
            <div class="mx-auto max-w-3xl flex flex-col justify-center md:items-center">
                <h1 class="mt-4 text-5xl md:text-7xl font-medium tracking-tight text-balance text-gray-900">Privacy Policy</h1>
                <p class="mt-4 text-sm text-gray-600">Last updated: November 13, 2024</p>
            </div>
        </section>

        <section class="mx-auto max-w-2xl py-10 space-y-6">
            <p>
                At Mappic, we are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy
                explains how we collect, use, store, and protect your information in compliance with the General Data Protection Regulation
                (GDPR) and other applicable data protection laws.
            </p>

            <div>
                <h2 class="text-2xl font-semibold mb-3">1. Data Controller</h2>
                <p>The data controller responsible for your personal data is:</p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                    <li>
                        <strong>Name:</strong>
                        Bas Bravo / Mappic
                    </li>
                    <li>
                        <strong>Contact:</strong>
                        mappic@basezero.dev
                    </li>
                    <li>
                        <strong>Website:</strong>
                        https://mappic.app
                    </li>
                </ul>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">2. Data We Collect</h2>
                <p>We collect the following types of personal data:</p>

                <h3 class="text-xl font-semibold mt-4 mb-2">2.1 Account Information</h3>
                <ul class="list-disc pl-6 space-y-1">
                    <li>Email address</li>
                    <li>Name (if provided)</li>
                    <li>Profile picture (if provided)</li>
                    <li>Authentication credentials (managed by Firebase Authentication)</li>
                </ul>

                <h3 class="text-xl font-semibold mt-4 mb-2">2.2 Usage Data</h3>
                <ul class="list-disc pl-6 space-y-1">
                    <li>Maps created and customized</li>
                    <li>Credit purchases and usage history</li>
                    <li>Map purchases from other users</li>
                    <li>Preferences and settings</li>
                </ul>

                <h3 class="text-xl font-semibold mt-4 mb-2">2.3 Technical Data</h3>
                <ul class="list-disc pl-6 space-y-1">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Cookies and similar tracking technologies</li>
                </ul>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">3. Purpose of Data Processing</h2>
                <p>We use your personal data for the following purposes:</p>
                <ul class="list-disc pl-6 space-y-2 mt-2">
                    <li>
                        <strong>Service Provision:</strong>
                        To provide access to our map creation and customization services
                    </li>
                    <li>
                        <strong>Account Management:</strong>
                        To create and manage your user account
                    </li>
                    <li>
                        <strong>Payment Processing:</strong>
                        To process credit purchases and transactions
                    </li>
                    <li>
                        <strong>Service Improvement:</strong>
                        To analyze usage patterns and improve our services
                    </li>
                    <li>
                        <strong>Communication:</strong>
                        To send service-related notifications and updates
                    </li>
                    <li>
                        <strong>Security:</strong>
                        To protect against fraud and unauthorized access
                    </li>
                    <li>
                        <strong>Analytics:</strong>
                        To understand how users interact with our platform using Google Analytics
                    </li>
                </ul>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">4. Legal Basis for Processing</h2>
                <p>We process your personal data based on the following legal grounds:</p>
                <ul class="list-disc pl-6 space-y-2 mt-2">
                    <li>
                        <strong>Consent:</strong>
                        When you create an account and accept our terms
                    </li>
                    <li>
                        <strong>Contract Performance:</strong>
                        To provide the services you requested
                    </li>
                    <li>
                        <strong>Legitimate Interest:</strong>
                        To improve our services, prevent fraud, and ensure security
                    </li>
                    <li>
                        <strong>Legal Obligation:</strong>
                        To comply with applicable laws and regulations
                    </li>
                </ul>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">5. Data Sharing and Third Parties</h2>
                <p>We share your data with the following third-party services:</p>

                <h3 class="text-xl font-semibold mt-4 mb-2">5.1 Firebase (Google LLC)</h3>
                <ul class="list-disc pl-6 space-y-1">
                    <li>Authentication services</li>
                    <li>Cloud database (Firestore)</li>
                    <li>File storage (Firebase Storage)</li>
                    <li>
                        Privacy Policy:
                        <a
                            href="https://firebase.google.com/support/privacy"
                            class="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener">
                            https://firebase.google.com/support/privacy
                        </a>
                    </li>
                </ul>

                <h3 class="text-xl font-semibold mt-4 mb-2">5.2 Google Analytics</h3>
                <ul class="list-disc pl-6 space-y-1">
                    <li>Website analytics and usage statistics</li>
                    <li>
                        Privacy Policy:
                        <a href="https://policies.google.com/privacy" class="text-blue-600 hover:underline" target="_blank" rel="noopener">
                            https://policies.google.com/privacy
                        </a>
                    </li>
                </ul>

                <h3 class="text-xl font-semibold mt-4 mb-2">5.3 Payment Processors</h3>
                <ul class="list-disc pl-6 space-y-1">
                    <li>Stripe for payment processing</li>
                    <li>We do not store credit card information</li>
                </ul>

                <p class="mt-4">We do not sell your personal data to third parties.</p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">6. International Data Transfers</h2>
                <p>
                    Your data may be transferred to and processed in countries outside the European Economic Area (EEA), including the
                    United States, where our service providers (Firebase, Google Analytics) operate. These transfers are protected by:
                </p>
                <ul class="list-disc pl-6 space-y-1 mt-2">
                    <li>Standard Contractual Clauses approved by the European Commission</li>
                    <li>Adequacy decisions by the European Commission</li>
                    <li>Other appropriate safeguards as required by GDPR</li>
                </ul>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">7. Your Rights Under GDPR</h2>
                <p>You have the following rights regarding your personal data:</p>
                <ul class="list-disc pl-6 space-y-2 mt-2">
                    <li>
                        <strong>Right of Access:</strong>
                        Request a copy of your personal data
                    </li>
                    <li>
                        <strong>Right to Rectification:</strong>
                        Correct inaccurate or incomplete data
                    </li>
                    <li>
                        <strong>Right to Erasure:</strong>
                        Request deletion of your personal data ("right to be forgotten")
                    </li>
                    <li>
                        <strong>Right to Restriction:</strong>
                        Limit how we use your data
                    </li>
                    <li>
                        <strong>Right to Data Portability:</strong>
                        Receive your data in a structured, machine-readable format
                    </li>
                    <li>
                        <strong>Right to Object:</strong>
                        Object to processing based on legitimate interests
                    </li>
                    <li>
                        <strong>Right to Withdraw Consent:</strong>
                        Withdraw consent at any time
                    </li>
                    <li>
                        <strong>Right to Lodge a Complaint:</strong>
                        File a complaint with your local data protection authority
                    </li>
                </ul>
                <p class="mt-4">
                    To exercise any of these rights, please contact us at
                    <a href="mailto:mappic@basezero.dev" class="text-blue-600 hover:underline">mappic@basezero.dev</a>
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">8. Data Retention</h2>
                <p>We retain your personal data for as long as necessary to:</p>
                <ul class="list-disc pl-6 space-y-1 mt-2">
                    <li>Provide our services to you</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes and enforce our agreements</li>
                </ul>
                <p class="mt-4">
                    When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are
                    required to retain it by law.
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">9. Data Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized
                    access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul class="list-disc pl-6 space-y-1 mt-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments</li>
                    <li>Access controls and authentication</li>
                    <li>Secure cloud infrastructure (Firebase)</li>
                </ul>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">10. Cookies and Tracking</h2>
                <p>
                    We use cookies and similar tracking technologies to enhance your experience. For detailed information about the cookies
                    we use, please see our
                    <a href="/info/cookie-policy" class="text-blue-600 hover:underline">Cookie Policy</a>
                    .
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">11. Children's Privacy</h2>
                <p>
                    Our services are not intended for children under 16 years of age. We do not knowingly collect personal data from
                    children. If you believe we have collected data from a child, please contact us immediately.
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">12. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new
                    policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">13. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                <ul class="list-none pl-0 mt-2 space-y-1">
                    <li>
                        <strong>Email:</strong>
                        <a href="mailto:mappic@basezero.dev" class="text-blue-600 hover:underline">mappic@basezero.dev</a>
                    </li>
                    <li>
                        <strong>Website:</strong>
                        <a href="https://mappic.app" class="text-blue-600 hover:underline">https://mappic.app</a>
                    </li>
                </ul>
            </div>
        </section>
    </div>
    <div class="w-full my-10">
        <ElementsFooterLinks />
    </div>
</template>

<style scoped></style>
