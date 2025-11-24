import React from 'react';

import OrganizerGuard from './OrganizerGuard';

const OrganizerLayout = ({ children }: { children: React.ReactNode }) => {
  return <OrganizerGuard>{children}</OrganizerGuard>;
};

export default OrganizerLayout;
