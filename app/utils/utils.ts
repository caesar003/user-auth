import { json } from "@remix-run/node";
interface Fields {
  requestType: string;
  name: string;
  email: string;
  password: string;
  password2: string;
}
interface BadRequest {
  fields: Fields;
  fieldErrors: {
    name: string;
    email: string;
    password: string;
    password2: string;
  };
}
export const validateForm = (fields: Fields) => {
  const { requestType, name, email, password, password2 } = fields;

  const emailFilter =
    /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  const isValidEmail = (str: string) => emailFilter.test(str);
  const response = {
    email: "",
    password: "",
    name: "",
    password2: "",
  };
  switch (requestType) {
    case "signin": {
      if (!email || email.length === 0)
        return { email: "This field is required" };

      if (email && !isValidEmail(email))
        return { email: "Please provide a valid email!" };

      if (!password) return { password: "This field is required" };

      if (password && password.trim().length < 6)
        return { password: "Password must be at least six characters!" };
      return response;
    }
    case "signup": {
      if (!name) return { name: "this field is required" };

      if (!email || email.length === 0)
        return { email: "This field is required" };

      if (email && !emailFilter.test(email))
        return { email: "Please provide a valid email!" };

      if (!password) return { password: "This field is required" };

      if (password && password.trim().length < 6)
        return { password: "Password must be at least six characters!" };

      if (!password2 || password !== password2)
        return { password2: "Password don't match!" };
    }
  }

  return response;
};

export const badRequest = (data: BadRequest) => json(data, { status: 400 });
