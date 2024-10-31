import Signin from "@/components/Signin";
import { getServerSession } from "next-auth";
import { Redirect } from "@/components/Redirect";

const SigninPage = async () => {
  const session = await getServerSession();
  if (session) {
    <p>session.user</p>;
    return <Redirect to={"/dashboard"} />;
  }
  return <Signin />;
};

export default SigninPage;
