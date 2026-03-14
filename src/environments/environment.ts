export const environment = {
    production: false,
    apiUrl: 'http://localhost:8081/api/products',
    apiTimeout: 10000,
    enableLogging: true,
    appVersion: '1.0.0-dev',
    features: {
        enableImageUpload: true,
        enableAdvancedSearch: true,
        maxImageSize: 5242880, // 5MB
    }
};