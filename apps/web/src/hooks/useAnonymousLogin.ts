import { useMemo, useState } from "react";

import authClient from "../libs/auth";
import { isBotCheck } from "../utils/isbotcheck";

const useAnonymousLogin = () => {
  const { data: authData, isPending } = authClient.useSession();

  const [isSession, isSessionSet] = useState(false);

  const isBot = useMemo(() => isBotCheck(navigator.userAgent), []);
  if (!isBot && !isSession && !isPending && !authData) {
    isSessionSet(true);
    void authClient.signIn.anonymous();
  }
  return !!authData?.user;
};

export default useAnonymousLogin;
