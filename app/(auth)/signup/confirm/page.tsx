import Link from "next/link";
import React from "react";

const SignupConfirm = () => {
  return (
    <div className="p-3 flex flex-col justify-center items-center">
      <p>
        An confirmation mail has been sent to your email. Please confirm your
        email, then proceed to login.
      </p>
      <Link className="underline" href="/login">
        Go to login page
      </Link>
    </div>
  );
};

export default SignupConfirm;
