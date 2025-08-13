import Chat from './api/components/Chat';

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Clarity</h1>
      <p className="mb-4 text-gray-600">
        Calm, structured guidance for your symptoms.
      </p>
      <Chat />
    </main>
  );
}
