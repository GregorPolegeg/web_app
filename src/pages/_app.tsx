import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { SocketProvider } from "./api/providers/socket-provider";
import { NotificationProvider } from "./api/providers/notification-provider";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SocketProvider>
      <SessionProvider session={session}>
        <NotificationProvider>
          <link rel="manifes" href="/manifest.json" />
          <Component {...pageProps} />
        </NotificationProvider>
      </SessionProvider>
    </SocketProvider>
  );
};

export default api.withTRPC(MyApp);
