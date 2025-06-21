"use client";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";

const UserGreetText = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);
  if (user !== null) {
    return (
      <p className="sm:text-lg">
        Hello&nbsp;
        <span className="font-semibold">
          {user.user_metadata.full_name ?? "user"}
        </span>
      </p>
    );
  }
  return <p>Not signed in</p>;
};

export default UserGreetText;
