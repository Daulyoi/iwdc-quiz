import Image from 'next/image';
import React from 'react';

interface QuizStartFormProps {
  name: string;
  onNameChange: (name: string) => void;
  onStartQuiz: () => void;
}

export default function QuizStartForm({ name, onNameChange, onStartQuiz }: QuizStartFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartQuiz();
  };

  return (
    <div className="lg:col-span-4 bg-[var(--color-iwdc-white)] p-10 text-[var(--color-iwdc-purple)] rounded-3xl flex flex-col gap-10 justify-center items-center shadow-xl">
      <div className="flex flex-col gap-4 justify-center items-center">
        <h1 className="text-5xl font-bold tracking-tight">Quiz IWDC</h1>
        <p className="text-[var(--color-iwdc-purple)] text-xl text-center font-semibold opacity-90">
          Seberapa tahu kamu tentang web development?
        </p>
      </div>
      
      <div className='relative w-44 h-44'>
          <Image src="/iwdc-logo.png" alt='logo iwdc' fill={true} />
      </div>
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 items-center font-semibold">
        <p className="text-lg font-semibold whitespace-nowrap">
          Masukkan nama untuk memulai
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full text-center border-2 text-[var(--color-iwdc-purple)] border-[var(--color-iwdc-purple)] p-3 rounded-lg text-xl outline-none focus:ring-2 focus:ring-[var(--color-iwdc-purple)] transition-all"
          placeholder="Enter your name"
          required
        />
        <button
          type="submit"
          className="w-full bg-[var(--color-iwdc-purple)] text-[var(--color-iwdc-white)] p-3 rounded-lg text-lg font-bold transition-all hover:bg-opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={name.trim() === ""}
        >
          Mulai
        </button>
      </form>
    </div>
  );
}