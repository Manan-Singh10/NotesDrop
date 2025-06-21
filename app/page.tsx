import LoginButton from "@/components/ui/LoginLogoutButton";
import NotesContainer from "./components/NotesContainer";

export default function Home() {
  return (
    <>
      <header className="flex justify-between w-full px-5 py-4">
        <h1 className="text-2xl font-semibold">NotesDrop</h1>
        <LoginButton />
      </header>

      <main className="flex items-center flex-col gap-5">
        <h2 className="text-2xl">Welcome to Notes Drop</h2>
        <NotesContainer />
      </main>
    </>
  );
}
