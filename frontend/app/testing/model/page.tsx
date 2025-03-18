"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface TestResult {
  text: string;
  is_spam: boolean;
}

export default function ModelTestPage() {
  const { token } = useAuth();
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchModels();
  }, [token]);

  const fetchModels = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/testing/models", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setModels(data.models);
      if (data.models.length > 0) {
        setSelectedModel(data.models[0]);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setError("모델 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleTextTest = async () => {
    if (!selectedModel || !inputText) {
      setError("모델과 테스트할 텍스트를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/testing/predict-text",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_name: selectedModel,
            text: inputText,
          }),
        }
      );

      const result = await response.json();
      setResults([result]);
      setError("");
    } catch (error) {
      console.error("Error testing text:", error);
      setError("텍스트 테스트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileTest = async () => {
    if (!selectedModel || !file) {
      setError("모델과 테스트할 파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `http://localhost:8000/api/testing/predict-file?model_name=${selectedModel}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      setResults(data.results);
      setError("");
    } catch (error) {
      console.error("Error testing file:", error);
      setError("파일 테스트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">모델 테스트</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            테스트할 모델 선택
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            {models?.length > 0 &&
              models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">텍스트 테스트</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 border rounded-md p-2"
              placeholder="테스트할 텍스트를 입력하세요..."
            />
            <button
              onClick={handleTextTest}
              disabled={loading || !selectedModel || !inputText}
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              테스트하기
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">파일 테스트</h2>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-2"
            />
            <button
              onClick={handleFileTest}
              disabled={loading || !selectedModel || !file}
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              파일 테스트하기
            </button>
          </div>
        </div>

        {results?.length > 0 && results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">테스트 결과</h2>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">텍스트</th>
                    <th className="px-4 py-2 text-left">결과</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{result.text}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded ${
                            result.is_spam
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {result.is_spam ? "스팸" : "정상"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
