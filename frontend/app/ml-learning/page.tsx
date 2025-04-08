"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface FileData {
  filename: string;
  data: {
    text: string;
    label: number;
  }[];
  total: number;
}

export default function UploadPage() {
  const { token } = useAuth();
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const [fileData, setFileData] = useState<FileData | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { fetchWithAuth } = useApiClient();

  useEffect(() => {
    fetchFiles();
  }, [token]);

  useEffect(() => {
    setPage(1);
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      fetchFileData();
    }
  }, [selectedFile, page, pageSize]);

  const fetchFiles = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/learning/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchFileData = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/learning/data/${selectedFile}?page=${page}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setFileData({
        filename: selectedFile,
        data: data.data,
        total: data.total,
      });
    } catch (error) {
      console.error("Error fetching file data:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/learning/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        fetchFiles();
        setMessage("파일이 성공적으로 업로드되었습니다.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("파일 업로드에 실패했습니다.");
    }
  };

  const handleDeleteFiles = async () => {
    if (!selectedFiles.length) {
      setMessage("삭제할 파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/learning/deleteFiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filenames: selectedFiles }),
        }
      );

      if (response.ok) {
        fetchFiles();
        setSelectedFiles([]);
        setMessage("삭제 완료되었습니다.");
      }
    } catch (error) {
      console.error("Error training model:", error);
      setMessage("파일 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!selectedFiles.length) {
      setMessage("학습할 파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/learning/train`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filenames: selectedFiles }),
        }
      );

      if (response.ok) {
        setMessage("모델 학습이 완료되었습니다.");
      }
    } catch (error) {
      console.error("Error training model:", error);
      setMessage("모델 학습에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div>
            <h2 className="text-xl font-semibold mb-4">모델 선택</h2>
            <div className="space-y-2">
              {models?.length > 0 &&
                models.map((model) => (
                  <div key={model} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(model)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, model]);
                        } else {
                          setSelectedFiles(
                            selectedFiles.filter((f) => f !== model)
                          );
                        }
                      }}
                    />
                    <button
                      onClick={() => setSelectedFile(model)}
                      className={`p-2 rounded ${
                        selectedModel === model
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {model}
                    </button>
                  </div>
                ))}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">학습데이터 목록</h2>
              <div className="space-y-2">
                {files?.length > 0 &&
                  files.map((file) => (
                    <div key={file} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles([...selectedFiles, file]);
                          } else {
                            setSelectedFiles(
                              selectedFiles.filter((f) => f !== file)
                            );
                          }
                        }}
                      />
                      <button
                        onClick={() => setSelectedFile(file)}
                        className={`p-2 rounded ${
                          selectedFile === file
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {file}
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={handleTrain}
              disabled={loading || !selectedFiles.length}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? "학습 중..." : "선택한 파일로 학습하기"}
            </button>
          </div>

          {fileData && (
            <div>
              <h2 className="text-xl font-semibold mb-4">파일 내용</h2>
              <div className="mb-4 space-x-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="border rounded p-1"
                >
                  <option value="10">10개씩 보기</option>
                  <option value="20">20개씩 보기</option>
                  <option value="50">50개씩 보기</option>
                  <option value="100">100개씩 보기</option>
                  <option value="200">200개씩 보기</option>
                </select>
              </div>

              <div className="border rounded overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2">텍스트</th>
                      <th className="px-4 py-2">레이블</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.data &&
                      fileData.data.map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{row.text}</td>
                          <td className="px-4 py-2">{row.label}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:bg-gray-100"
                >
                  이전
                </button>
                <span>
                  페이지 {page} / {Math.ceil(fileData.total / pageSize)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * pageSize >= fileData.total}
                  className="px-4 py-2 bg-gray-200 rounded disabled:bg-gray-100"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
