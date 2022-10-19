import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getUser } from "~/utils/session.server";

export const loader = async ({ request }) => {
  const user = await getUser(request);
  if (!user) return redirect("/auth/signin");
  return { user };
};

const Profile = () => {
  const { user } = useLoaderData();
  return (
    <div className="h-screen w-full grid grid-cols-12">
      <div className="col-span-10 col-start-2 bg-white opacity-70 p-4">
        <h1 className="text-[25px]">Welcome back {user.name}</h1>
        <Form action="/auth/signout" method="post">
          <button type="submit" className="text-blue-400 hover:text-blue-500 ">
            Signout
          </button>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
