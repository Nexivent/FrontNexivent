import React from "react";

export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-2xl bg-gray-800 p-6 shadow-lg border border-gray-700">
      {children}
    </div>
  );
};

export const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-2">{children}</div>;
};
