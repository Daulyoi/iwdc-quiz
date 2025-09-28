"use client";

import React from "react";
import { useRouter } from "next/navigation";
import QuizStartForm from "../components/QuizStartForm";
import Leaderboard from "../components/Leaderboard";

export default function Home() {
  const [name, setName] = React.useState("");
  const router = useRouter();

  const handleStartQuiz = () => {
    if (name.trim() === "") {
      alert("Please enter your name to start the quiz.");
      return;
    }
    
    // Store the user's name in localStorage for the quiz
    localStorage.setItem("quizUserName", name.trim());
    
    // Navigate to the quiz page (we'll create this next)
    router.push("/quiz");
  };

  return (
      <div className="w-full h-full min-h-screen lg:grid lg:grid-cols-6 flex flex-col gap-10 lg:pl-32 p-12 items-start bg-[var(--color-iwdc-purple)]">
        <QuizStartForm
          name={name}
          onNameChange={setName}
          onStartQuiz={handleStartQuiz}
        />
        <Leaderboard />
    </div>
  );
}
