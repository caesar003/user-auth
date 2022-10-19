import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignIn, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { validateForm, badRequest } from "~/utils/utils";
import {
  createUserSession,
  getUser,
  signin,
  signup,
} from "~/utils/session.server";
import { db } from "~/utils/db.server";

export const loader = async ({ request }) => {
  const user = await getUser(request);
  if (user) return redirect("/profile");
  return null;
};

export const action = async ({ request }) => {
  const form = await request.formData();
  const requestType = form.get("requestType");
  const email = form.get("email");
  const name = form.get("name");
  const password = form.get("password");
  const password2 = form.get("password2");

  const fields = {
    requestType,
    name,
    email,
    password,
    password2,
  };

  const fieldErrors = validateForm(fields);

  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  switch (requestType) {
    case "signin": {
      const user = await signin({ email, password });
      if (!user)
        return badRequest({
          fields,
          fieldErrors: { formErrors: "Invalid credentials!" },
        });
      return createUserSession(user.id, "/profile");
    }
    case "signup": {
      const userExists = await db.user.findFirst({
        where: { name },
      });

      const emailExists = await db.user.findFirst({
        where: { email },
      });

      if (userExists)
        return badRequest({
          fields,
          fieldErrors: {
            name: `User ${name} already used! Please choose another one.`,
          },
        });
      if (emailExists)
        return badRequest({
          fields,
          fieldErrors: { email: `Email ${email} already registered!` },
        });

      const user = await signup({ name, email, password });

      if (!user)
        return badRequest({
          fields,
          fieldErrors: { formErrors: "Something went wrong! Try again later." },
        });
      return createUserSession(user.id, "/profile");
    }
  }

  return null;
};

const SignIn = () => {
  const [isSignInFormShown, showSignInForm] = useState(true);
  const actionData = useActionData();
  console.log(actionData);
  return (
    <>
      {isSignInFormShown ? (
        <div className="grid grid-cols-11 gap-4 ">
          <div className="col-start-2 col-end-11 md:col-start-5 lg:col-start-6 xl:col-start-7 xl:col-end-10 border p-6 rounded bg-white mt-12 shadow-lg">
            <h3 className="text-[25px]">Please Sign in to Continue</h3>
            <Form method="post">
              <div className="form-group mb-6">
                <label
                  htmlFor="email"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Email address
                </label>
                <input
                  type="text"
                  name="email"
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  defaultValue={
                    actionData?.fieldErrors?.email && actionData?.fields?.email
                  }
                  id="email"
                  placeholder="yourname@domain"
                />
                <p className="text-sm px-2 text-red-500">
                  {actionData?.fieldErrors?.email &&
                    actionData?.fieldErrors.email}
                </p>
              </div>
              <div className="form-group mb-6">
                <label
                  htmlFor="password"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  id="password"
                  placeholder="Password"
                  defaultValue={
                    actionData?.fieldErrors?.password &&
                    actionData?.fields.password
                  }
                />

                <p className="text-sm px-2 text-red-500">
                  {actionData?.fieldErrors?.password &&
                    actionData?.fieldErrors.password}
                </p>
              </div>
              <input type="hidden" name="requestType" value="signin" />

              <p className="text-red-400">
                {actionData?.fieldErrors?.formErrors &&
                  actionData?.fieldErrors?.formErrors}
              </p>
              <button
                type="submit"
                className="flex justify-center items-baseline w-full px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
              >
                <FontAwesomeIcon icon={faSignIn} />{" "}
                <span className="ml-1">Sign in</span>
              </button>
              <p className="text-gray-800 mt-6 text-center">
                Don't have an account yet?{" "}
                <button
                  onClick={() => showSignInForm(false)}
                  className="text-blue-600 hover:text-blue-700 focus:text-blue-700 transition duration-200 ease-in-out"
                >
                  Register
                </button>
              </p>
            </Form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-11 gap-4 ">
          <div className="col-start-2 col-end-11 md:col-start-5 lg:col-start-6 xl:col-start-7 xl:col-end-10 border p-6 rounded bg-white mt-12 shadow-lg">
            <h3 className="text-[25px]">Create an account!</h3>
            <Form method="post">
              <div className="form-group mb-6">
                <label
                  htmlFor="name"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Username
                </label>
                <input
                  name="name"
                  type="text"
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  id="username"
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                  defaultValue={
                    actionData?.fieldErrors?.name && actionData?.fields?.name
                  }
                />
                <p className="text-sm px-2 text-red-500">
                  {actionData?.fieldErrors?.name &&
                    actionData?.fieldErrors.name}
                </p>
              </div>
              <div className="form-group mb-6">
                <label
                  htmlFor="email"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Email address
                </label>
                <input
                  type="text"
                  name="email"
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  id="email"
                  defaultValue={
                    actionData?.fieldErrors?.email && actionData?.fields?.email
                  }
                  placeholder="Enter email"
                />
                <p className="text-sm px-2 text-red-500">
                  {actionData?.fieldErrors?.email &&
                    actionData?.fieldErrors.email}
                </p>
              </div>
              <div className="form-group mb-6">
                <label
                  htmlFor="password"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  id="password"
                  placeholder="Password"
                  defaultValue={
                    actionData?.fieldErrors?.password &&
                    actionData?.fields?.password
                  }
                />
                <p className="text-sm px-2 text-red-500">
                  {actionData?.fieldErrors?.password &&
                    actionData?.fieldErrors.password}
                </p>
              </div>
              <div className="form-group mb-6">
                <label
                  htmlFor="password2"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Verify password
                </label>
                <input
                  type="password"
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  id="password2"
                  name="password2"
                  defaultValue={
                    actionData?.fieldErrors?.password2 &&
                    actionData?.fields?.password2
                  }
                  placeholder="Retype password"
                />
                <p className="text-sm px-2 text-red-500">
                  {actionData?.fieldErrors?.password2 &&
                    actionData?.fieldErrors.password2}
                </p>
              </div>

              <input type="hidden" name="requestType" value="signup" />
              <button
                type="submit"
                className="flex justify-center items-baseline w-full px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
              >
                <FontAwesomeIcon icon={faUserPlus} />{" "}
                <span className="ml-1">Sign Up</span>
              </button>
              <p className="text-gray-800 mt-6 text-center">
                Already have an account?{" "}
                <button
                  onClick={() => showSignInForm(true)}
                  className="text-blue-600 hover:text-blue-700 focus:text-blue-700 transition duration-200 ease-in-out"
                >
                  Sign In
                </button>
              </p>
            </Form>
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;
