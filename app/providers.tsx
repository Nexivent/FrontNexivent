'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from '@contexts/UserContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn(
      'Google Client ID no está definido. El inicio de sesión con Google no funcionará.'
    );
    return <UserProvider>{children}</UserProvider>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <UserProvider>{children}</UserProvider>
    </GoogleOAuthProvider>
  );
};

export default Providers;
