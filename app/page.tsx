import LoginButton from "@/components/ui/LoginLogoutButton";
import UserGreetText from "@/components/ui/UserGreetText";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <header className="flex justify-between w-full px-5 py-4">
        <UserGreetText />
        <LoginButton />
      </header>

      <main>
        <h2 className="text-2xl">Welcome to Notes Drop</h2>
      </main>
    </div>
  );
}
