import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getUser } from "~/utils/session.server";

export const loader = async ({ request }) => {
  const user = await getUser(request);
  if (!user) return redirect("/auth/signin");
  return { user };
};

const Index = () => {
  const data = useLoaderData();
  return (
    <div className="main">
      <Outlet />
    </div>
  );
};

export default Index;
