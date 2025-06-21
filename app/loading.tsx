import { Button } from "@/components/ui/button";
import NotesContainerLoader from "@/components/ui/NotesContainerLoader";

const LoadingPage = () => {
  return (
    <>
      <header className="flex justify-between w-full px-5 py-4">
        <h1 className="text-2xl font-semibold">NotesDrop</h1>
        <Button>Login</Button>
      </header>

      <main className="flex items-center flex-col gap-5">
        <h2 className="text-2xl">Welcome to Notes Drop</h2>
        <NotesContainerLoader />
      </main>
    </>
  );
};

export default LoadingPage;
