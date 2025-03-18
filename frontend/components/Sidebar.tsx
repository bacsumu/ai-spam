"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Sidebar() {
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-64 bg-gray-800 text-white p-6">
      <h1 className="text-xl font-bold mb-8">AI Spam Detection</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">학습</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/learning/upload"
                className="block hover:text-gray-300"
              >
                학습파일 업로드
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">테스트</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/testing/model" className="block hover:text-gray-300">
                모델 테스트
              </Link>
            </li>
          </ul>
        </div>

        <button
          onClick={logout}
          className="mt-8 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
