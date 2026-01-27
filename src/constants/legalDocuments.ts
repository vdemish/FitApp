export type LegalDocument = {
    key: 'privacy' | 'terms';
    title: string;
    updatedAt: string;
    paragraphs: string[];
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [
    {
        key: 'privacy',
        title: 'Privacy Policy',
        updatedAt: 'Last updated: January 27, 2026',
        paragraphs: [
            'We collect the minimum information required to provide the app, such as account details, workout history, and device identifiers for security and analytics.',
            'We use your data to sync workouts, improve features, and provide support. We do not sell your personal information.',
            'We may share data with trusted service providers that help us operate the app. They are required to protect your information and use it only for the services they provide.',
            'You can request access, correction, or deletion of your data by contacting support. Some information may be retained for legal or security reasons.',
            'By using the app, you consent to this policy. We may update this policy from time to time and will post the latest version here.'
        ],
    },
    {
        key: 'terms',
        title: 'Terms of Service',
        updatedAt: 'Last updated: January 27, 2026',
        paragraphs: [
            'By using the app, you agree to these terms. If you do not agree, do not use the app.',
            'The app provides fitness tracking and educational content. It is not medical advice. Always consult a qualified professional before starting a new exercise program.',
            'You are responsible for maintaining the confidentiality of your account and for all activity under your account.',
            'All content, trademarks, and materials in the app are owned by FitApp or its licensors. You may not copy, modify, or distribute them without permission.',
            'We may suspend or terminate access if you violate these terms or misuse the app. We may update these terms and will post the latest version here.'
        ],
    },
];
