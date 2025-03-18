"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 로그인 상태 확인 후 리다이렉트
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8000/auth/check", {
          credentials: "include",
        });

        if (response.ok) {
          router.push("/testing/model");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/testing/model"
            className="text-2xl font-bold hover:text-blue-600 transition-colors"
          >
            AI 스팸 필터링 시스템
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl mb-4">로그인이 필요합니다</h2>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
