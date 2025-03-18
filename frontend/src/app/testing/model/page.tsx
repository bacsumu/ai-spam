"use client";

import Link from "next/link";
import { useState } from "react";

export default function ModelTestPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (!inputText.trim()) {
      return;
    }

    setTesting(true);
    try {
      const response = await fetch("http://localhost:8000/testing/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("테스트 실패");
      }

      const data = await response.json();
      setResult(data.result ? "스팸" : "정상");
    } catch (error: unknown) {
      console.error("Error during spam test:", error);
      setResult("오류가 발생했습니다.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">AI 스팸 필터링 시스템</h1>
          <Link
            href="/upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            학습 데이터 업로드
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테스트할 텍스트 입력
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="테스트하고 싶은 텍스트를 입력하세요..."
            />
          </div>

          <button
            onClick={handleTest}
            disabled={!inputText.trim() || testing}
            className={`w-full py-3 px-4 rounded-md text-white font-medium mb-4
              ${
                !inputText.trim() || testing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {testing ? "분석 중..." : "스팸 분석하기"}
          </button>

          {result && (
            <div
              className={`p-4 rounded-md text-center text-lg font-medium ${
                result === "스팸"
                  ? "bg-red-100 text-red-700"
                  : result === "정상"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              분석 결과: {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
