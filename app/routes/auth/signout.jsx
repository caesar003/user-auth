import { signout } from "~/utils/session.server";
import { redirect } from "@remix-run/node";

export const action = async ({ request }) => {
  return signout(request);
};

export const loader = async () => redirect("/auth/signin");
