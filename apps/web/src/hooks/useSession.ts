import { authClient } from "@libs/auth";

const useSession = () => {
  const { data, ...rest } = authClient.useSession();
  return {
    user: data?.user,
    session: data?.session,
    ...rest,
  };
};

export default useSession;
