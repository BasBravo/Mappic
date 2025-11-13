<script setup>
// SEO
useSeoMeta({
    title: 'Cookie Policy - Mappic',
    ogTitle: 'Cookie Policy - Mappic',
    description: 'Learn about the cookies used by Mappic and how to manage your cookie preferences.',
    ogDescription: 'Mappic cookie policy. Information about cookies, tracking, and how to manage your preferences.',
    ogImage: '/og-image.png',
    ogUrl: 'https://mappic.app/info/cookie-policy',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Cookie Policy - Mappic',
    twitterDescription: 'How Mappic uses cookies and tracking technologies.',
    twitterImage: '/og-image.png',
    keywords: 'cookie policy, cookies, tracking, analytics, Mappic, privacy',
    author: 'Bas Bravo',
    robots: 'index, follow',
    canonical: 'https://mappic.app/info/cookie-policy',
});
</script>

<template>
    <div class="w-full text-black">
        <!-- Espacio inicial -->
        <div class="h-22 md:h-46" />

        <section>
            <div class="mx-auto max-w-3xl flex flex-col justify-center md:items-center">
                <h1 class="mt-4 text-5xl md:text-7xl font-medium tracking-tight text-balance text-gray-900">Cookie Policy</h1>
                <p class="mt-4 text-sm text-gray-600">Last updated: November 13, 2024</p>
            </div>
        </section>

        <section class="mx-auto max-w-2xl py-10 space-y-6">
            <p>
                This Cookie Policy explains how Mappic uses cookies and similar tracking technologies on our website. By using our services,
                you consent to the use of cookies as described in this policy.
            </p>

            <div>
                <h2 class="text-2xl font-semibold mb-3">1. What Are Cookies?</h2>
                <p>
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They
                    help websites remember your preferences and improve your browsing experience. Cookies can be "session cookies" (deleted
                    when you close your browser) or "persistent cookies" (remain on your device for a set period).
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">2. Types of Cookies We Use</h2>

                <h3 class="text-xl font-semibold mt-4 mb-2">2.1 Strictly Necessary Cookies</h3>
                <p>
                    These cookies are essential for the website to function properly. They enable core functionality such as security,
                    authentication, and session management.
                </p>
                <div class="mt-3 overflow-x-auto">
                    <table class="min-w-full border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">firebase-auth-*</td>
                                <td class="border border-gray-300 px-4 py-2">Authentication and session management</td>
                                <td class="border border-gray-300 px-4 py-2">Session</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">cookie-consent</td>
                                <td class="border border-gray-300 px-4 py-2">Stores your cookie preferences</td>
                                <td class="border border-gray-300 px-4 py-2">1 year</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 class="text-xl font-semibold mt-6 mb-2">2.2 Analytics Cookies</h3>
                <p>
                    These cookies help us understand how visitors interact with our website by collecting and reporting information
                    anonymously. We use Google Analytics for this purpose.
                </p>
                <div class="mt-3 overflow-x-auto">
                    <table class="min-w-full border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">_ga</td>
                                <td class="border border-gray-300 px-4 py-2">Distinguishes unique users</td>
                                <td class="border border-gray-300 px-4 py-2">2 years</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">_gid</td>
                                <td class="border border-gray-300 px-4 py-2">Distinguishes unique users</td>
                                <td class="border border-gray-300 px-4 py-2">24 hours</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">_gat</td>
                                <td class="border border-gray-300 px-4 py-2">Throttles request rate</td>
                                <td class="border border-gray-300 px-4 py-2">1 minute</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="mt-3">
                    For more information about Google Analytics cookies, visit:
                    <a
                        href="https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage"
                        class="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener">
                        Google Analytics Cookie Usage
                    </a>
                </p>

                <h3 class="text-xl font-semibold mt-6 mb-2">2.3 Preference Cookies</h3>
                <p>
                    These cookies allow the website to remember choices you make (such as language or region) and provide enhanced,
                    personalized features.
                </p>
                <div class="mt-3 overflow-x-auto">
                    <table class="min-w-full border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">user-preferences</td>
                                <td class="border border-gray-300 px-4 py-2">Stores UI preferences and settings</td>
                                <td class="border border-gray-300 px-4 py-2">1 year</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">locale</td>
                                <td class="border border-gray-300 px-4 py-2">Stores language preference</td>
                                <td class="border border-gray-300 px-4 py-2">1 year</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">3. Third-Party Cookies</h2>
                <p>Some cookies are placed by third-party services that appear on our pages. We use the following third-party services:</p>
                <ul class="list-disc pl-6 space-y-2 mt-2">
                    <li>
                        <strong>Google Analytics:</strong>
                        For website analytics and usage statistics
                        <br />
                        <a
                            href="https://policies.google.com/privacy"
                            class="text-blue-600 hover:underline text-sm"
                            target="_blank"
                            rel="noopener">
                            Google Privacy Policy
                        </a>
                    </li>
                    <li>
                        <strong>Firebase (Google):</strong>
                        For authentication and data storage
                        <br />
                        <a
                            href="https://firebase.google.com/support/privacy"
                            class="text-blue-600 hover:underline text-sm"
                            target="_blank"
                            rel="noopener">
                            Firebase Privacy Policy
                        </a>
                    </li>
                    <li>
                        <strong>Stripe:</strong>
                        For payment processing
                        <br />
                        <a href="https://stripe.com/privacy" class="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener">
                            Stripe Privacy Policy
                        </a>
                    </li>
                </ul>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">4. How to Manage Cookies</h2>
                <p>You have the right to accept or reject cookies. You can manage your cookie preferences in several ways:</p>

                <h3 class="text-xl font-semibold mt-4 mb-2">4.1 Cookie Consent Banner</h3>
                <p>When you first visit our website, you will see a cookie consent banner. You can choose to:</p>
                <ul class="list-disc pl-6 space-y-1 mt-2">
                    <li>Accept all cookies</li>
                    <li>Reject non-essential cookies</li>
                    <li>Customize your cookie preferences</li>
                </ul>

                <h3 class="text-xl font-semibold mt-4 mb-2">4.2 Browser Settings</h3>
                <p>Most web browsers allow you to control cookies through their settings. You can:</p>
                <ul class="list-disc pl-6 space-y-1 mt-2">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies</li>
                    <li>Delete cookies after each session</li>
                    <li>Set exceptions for specific websites</li>
                </ul>
                <p class="mt-3">
                    Please note that blocking or deleting cookies may affect your experience on our website and limit certain features.
                </p>

                <h3 class="text-xl font-semibold mt-4 mb-2">4.3 Opt-Out of Google Analytics</h3>
                <p>
                    You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on:
                    <br />
                    <a href="https://tools.google.com/dlpage/gaoptout" class="text-blue-600 hover:underline" target="_blank" rel="noopener">
                        https://tools.google.com/dlpage/gaoptout
                    </a>
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">5. Browser-Specific Cookie Management</h2>
                <p>For detailed instructions on managing cookies in your browser, please visit:</p>
                <ul class="list-disc pl-6 space-y-1 mt-2">
                    <li>
                        <a
                            href="https://support.google.com/chrome/answer/95647"
                            class="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener">
                            Google Chrome
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                            class="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener">
                            Mozilla Firefox
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                            class="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener">
                            Safari
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                            class="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener">
                            Microsoft Edge
                        </a>
                    </li>
                </ul>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">6. Do Not Track Signals</h2>
                <p>
                    Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked.
                    Currently, there is no industry standard for how to respond to DNT signals. We do not currently respond to DNT signals,
                    but we respect your privacy choices through our cookie consent banner.
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">7. Changes to This Cookie Policy</h2>
                <p>
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or
                    regulatory reasons. We will notify you of any material changes by posting the updated policy on this page with a new
                    "Last updated" date.
                </p>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-3">8. Contact Us</h2>
                <p>If you have any questions about our use of cookies or this Cookie Policy, please contact us:</p>
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

            <div>
                <h2 class="text-2xl font-semibold mb-3">9. More Information</h2>
                <p>For more information about cookies and how they work, visit:</p>
                <ul class="list-disc pl-6 space-y-1 mt-2">
                    <li>
                        <a href="https://www.allaboutcookies.org/" class="text-blue-600 hover:underline" target="_blank" rel="noopener">
                            All About Cookies
                        </a>
                    </li>
                    <li>
                        <a href="https://www.youronlinechoices.com/" class="text-blue-600 hover:underline" target="_blank" rel="noopener">
                            Your Online Choices
                        </a>
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
