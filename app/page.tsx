import { TypingTest } from "@/components/typing-test"

const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing speed improves with consistent practice.",
  "JavaScript is a versatile programming language.",
  "Vercel makes deploying web apps incredibly easy.",
  "Cursor helps developers write code faster."
];

const startChallenge = () => {
  const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
  setTargetText(randomSentence); // ← ランダム文章をセット
  setUserInput("");
  setTimeLeft(10); // 制限時間
  setIsRunning(true);
};

export default function Home() {
  return <TypingTest />
}
