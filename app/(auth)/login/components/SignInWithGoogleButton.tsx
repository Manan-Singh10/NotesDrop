"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-actions";
import React from "react";

const SignInWithGoogleButton = () => {
  return (
    <Button
      onClick={() => {
        signInWithGoogle();
      }}
      type="button"
      variant="outline"
      className="w-full"
    >
      Login with Google
    </Button>
  );
};

export default SignInWithGoogleButton;
