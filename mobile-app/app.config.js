import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    // Merge existing extras so we don't drop values like eas.projectId or router
    extra: {
      ...(config.extra || {}),
      // Expose EXPO_PUBLIC_API_URL to the app via Constants.expoConfig.extra
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || null,
    },
  };
};
