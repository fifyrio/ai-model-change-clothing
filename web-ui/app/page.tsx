'use client';

import { useState } from 'react';

interface FilePreview {
  file: File;
  preview: string;
}

interface GeneratedImage {
  name: string;
  path: string;
  timestamp: number;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [character, setCharacter] = useState<string>('lin');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [generateStatus, setGenerateStatus] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const processFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadStatus('');

      const filesArray = Array.from(files);
      const promises = filesArray.map((file) => {
        return new Promise<FilePreview>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              file,
              preview: reader.result as string,
            });
          };
          reader.onerror = () => {
            reject(new Error(`Failed to read file: ${file.name}`));
          };
          reader.readAsDataURL(file);
        });
      });

      // Wait for all files to be processed
      Promise.all(promises)
        .then((newFilePreviews) => {
          setSelectedFiles((prev) => [...prev, ...newFilePreviews]);
        })
        .catch((error) => {
          console.error('Error processing files:', error);
          setUploadStatus('Error processing some files');
        });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus('Please select at least one file first');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    try {
      const formData = new FormData();
      selectedFiles.forEach((filePreview) => {
        formData.append('files', filePreview.file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        let message = `Successfully uploaded ${data.uploadedCount} of ${data.totalCount} file(s)`;
        if (data.errors && data.errors.length > 0) {
          message += `\n\nErrors:\n${data.errors.map((e: { filename: string; error: string }) => `- ${e.filename}: ${e.error}`).join('\n')}`;
        }
        setUploadStatus(message);
      } else {
        setUploadStatus(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus(`Upload error: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const fetchGeneratedImages = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();

      if (response.ok && data.images) {
        setGeneratedImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching generated images:', error);
    }
  };

  const handleGenerate = async () => {
    if (selectedFiles.length === 0) {
      setGenerateStatus('Please upload files first');
      return;
    }

    setGenerating(true);
    setGenerateStatus('Generating images... This may take a while.');
    setGeneratedImages([]); // Clear previous results

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ character }),
      });

      const data = await response.json();

      if (response.ok) {
        setGenerateStatus(`Generation completed successfully for character: ${data.character}`);
        // Fetch and display generated images
        await fetchGeneratedImages();
      } else {
        setGenerateStatus(`Generation failed: ${data.error}`);
      }
    } catch (error) {
      setGenerateStatus(`Generation error: ${error}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AI Fashion Image Generator
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-700">
                1. Upload Images ({selectedFiles.length} selected)
              </h2>
              {selectedFiles.length > 0 && (
                <button
                  onClick={clearAllFiles}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Clear All
                </button>
              )}
            </div>

            <div
              className="flex flex-col items-center justify-center w-full"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50 scale-105'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                  <svg
                    className={`w-12 h-12 mb-4 transition-colors ${
                      isDragging ? 'text-purple-500' : 'text-gray-400'
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className={`mb-2 text-sm ${isDragging ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>
                    {isDragging ? (
                      'Drop files here'
                    ) : (
                      <>
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF (MAX. 10MB each) - Multiple files supported
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Preview Grid */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {selectedFiles.map((filePreview, index) => (
                  <div
                    key={index}
                    className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-400 transition-colors"
                  >
                    <img
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <button
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-600 truncate">
                        {filePreview.file.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {uploading
                ? 'Uploading...'
                : `Upload ${selectedFiles.length} file(s) to chuandai folder`}
            </button>

            {uploadStatus && (
              <div
                className={`p-4 rounded-lg whitespace-pre-line ${
                  uploadStatus.includes('Successfully')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {uploadStatus}
              </div>
            )}
          </div>

          {/* Character Selection Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              2. Select Character
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {['lin', 'Qiao', 'lin_home_1'].map((char) => (
                <button
                  key={char}
                  onClick={() => setCharacter(char)}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all ${
                    character === char
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              3. Generate Images
            </h2>

            <button
              onClick={handleGenerate}
              disabled={selectedFiles.length === 0 || generating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 disabled:scale-100"
            >
              {generating ? 'Generating... Please wait' : 'Generate Images'}
            </button>

            {generateStatus && (
              <div
                className={`p-4 rounded-lg ${
                  generateStatus.includes('successfully')
                    ? 'bg-green-100 text-green-800'
                    : generateStatus.includes('Generating')
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {generateStatus}
              </div>
            )}
          </div>

          {/* Generated Results Section */}
          {generatedImages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">
                Generated Results ({generatedImages.length} images)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-400 transition-colors shadow-md"
                  >
                    <img
                      src={`/api/image/${encodeURIComponent(image.name)}`}
                      alt={image.name}
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                    <div className="p-3 bg-white">
                      <p className="text-xs text-gray-600 truncate font-medium">
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(image.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <a
                        href={`/api/image/${encodeURIComponent(image.name)}`}
                        download={image.name}
                        className="bg-white hover:bg-green-50 text-green-600 p-2 rounded-full shadow-lg transition-colors"
                        title="Download image"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Upload one or more fashion images to the chuandai directory</li>
              <li>Select a character model (lin, Qiao, or lin_home_1)</li>
              <li>Click Generate to run: npm run batch random [character]</li>
              <li>Wait for the AI to generate new images with your selected character</li>
              <li>Generated images will appear below with download buttons</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
