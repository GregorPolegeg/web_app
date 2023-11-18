import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { SocketProvider } from "./api/providers/socket-provider";


const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SocketProvider>
      <SessionProvider session={session}>
        <link rel="manifes" href="/manifest.json"/>
        <Component {...pageProps} />
      </SessionProvider>
    </SocketProvider>
  );
};

export default api.withTRPC(MyApp);
