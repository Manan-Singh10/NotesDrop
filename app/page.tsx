import LoginButton from "@/components/ui/LoginLogoutButton";
import UserGreetText from "@/components/ui/UserGreetText";

export default function Home() {
  return (
    <div className="flex justify-between w-full px-5 py-4">
      <UserGreetText />
      <LoginButton />
    </div>
  );
}
