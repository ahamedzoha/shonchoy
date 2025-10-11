const defaultPath = "/";

export const authPaths = {
  default: defaultPath,
  login: `${defaultPath}login`,
  register: `${defaultPath}register`,
  verifyEmail: `${defaultPath}verify-email`,
  verifyEmailPending: `${defaultPath}verify-email-pending`,
} as const;
