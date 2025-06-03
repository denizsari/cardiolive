// Advanced File Upload Components with drag-and-drop, preview, and progress indicators
'use client';

import React, { useState, useRef, useCallback, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import { Upload, X, File, Image as ImageIcon, FileText, Video, Music, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Utility function for combining class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// File type utilities
const getFileTypeIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File upload interfaces
interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadError?: string;
  uploadSuccess?: boolean;
}

interface FileUploadProps {
  label?: string;
  helperText?: string;
  error?: FieldError;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  onFilesChange: (files: FileWithPreview[]) => void;
  value?: FileWithPreview[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowedTypes?: string[];
  uploadFunction?: (file: File) => Promise<string>; // Returns URL
}

// Basic File Upload Component
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({
    label,
    helperText,
    error,
    required,
    accept,
    multiple = false,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB default
    onFilesChange,
    value = [],
    className,
    disabled,
    showPreview = true,
    allowedTypes,
    uploadFunction,
    ...props
  }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const validateFile = useCallback((file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size must be less than ${formatFileSize(maxSize)}`;
      }
      
      if (allowedTypes && !allowedTypes.some(type => file.type.includes(type))) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
      }
      
      return null;
    }, [maxSize, allowedTypes]);

    const processFiles = useCallback(async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      
      if (!multiple && fileArray.length > 1) {
        return;
      }
      
      if (value.length + fileArray.length > maxFiles) {
        return;
      }

      const processedFiles: FileWithPreview[] = [];
      
      for (const file of fileArray) {
        const validationError = validateFile(file);
          const fileWithPreview: FileWithPreview = Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          uploadProgress: 0,
          uploadError: validationError || undefined,
          uploadSuccess: false
        });

        processedFiles.push(fileWithPreview);
      }

      // If upload function is provided, upload files
      if (uploadFunction && !processedFiles.some(f => f.uploadError)) {
        setIsUploading(true);
        
        for (let i = 0; i < processedFiles.length; i++) {
          const file = processedFiles[i];
          try {
            // Simulate progress
            for (let progress = 0; progress <= 100; progress += 10) {
              file.uploadProgress = progress;
              onFilesChange([...value, ...processedFiles]);
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const url = await uploadFunction(file);
            file.uploadSuccess = true;
            file.uploadProgress = 100;
          } catch (error) {
            file.uploadError = error instanceof Error ? error.message : 'Upload failed';
            file.uploadProgress = 0;
          }
        }
        
        setIsUploading(false);
      }

      onFilesChange([...value, ...processedFiles]);
    }, [value, multiple, maxFiles, validateFile, uploadFunction, onFilesChange]);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (disabled || isUploading) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    }, [disabled, isUploading, processFiles]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }, [processFiles]);

    const removeFile = useCallback((index: number) => {
      const newFiles = value.filter((_, i) => i !== index);
      onFilesChange(newFiles);
    }, [value, onFilesChange]);

    const openFileDialog = useCallback(() => {
      if (!disabled && !isUploading) {
        fileInputRef.current?.click();
      }
    }, [disabled, isUploading]);

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}

        {/* Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200",
            "hover:border-green-400 hover:bg-green-50 cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
            isDragging && "border-green-400 bg-green-50",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-red-300 bg-red-50",
            !error && !isDragging && "border-gray-300 bg-white"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFileDialog();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
            {...props}
          />

          <div className="text-center">
            <motion.div
              animate={{ 
                scale: isDragging ? 1.1 : 1,
                color: isDragging ? '#10B981' : '#6B7280'
              }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="mx-auto h-12 w-12 mb-4" />
            </motion.div>
            
            <div className="text-sm text-gray-600">
              <span className="font-medium text-green-600">Click to upload</span> or drag and drop
            </div>
            
            {accept && (
              <div className="text-xs text-gray-500 mt-1">
                Accepted formats: {accept}
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-1">
              Max size: {formatFileSize(maxSize)}
              {multiple && ` • Max files: ${maxFiles}`}
            </div>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            </div>
          )}
        </div>

        {/* File Preview List */}
        {showPreview && value.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence>
              {value.map((file, index) => {
                const FileIcon = getFileTypeIcon(file.type);
                
                return (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
                  >
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                          <FileIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      
                      {/* Upload Progress */}
                      {typeof file.uploadProgress === 'number' && file.uploadProgress < 100 && !file.uploadError && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <motion.div
                              className="bg-green-600 h-1 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${file.uploadProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {file.uploadProgress}% uploaded
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Icons */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {file.uploadError && (
                        <div className="flex items-center text-red-500" title={file.uploadError}>
                          <AlertCircle className="h-4 w-4" />
                        </div>
                      )}
                      
                      {file.uploadSuccess && (
                        <div className="flex items-center text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error.message}</p>
            </motion.div>
          )}
          {helperText && !error && (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

// Image Upload Component (specialized for images)
interface ImageUploadProps extends Omit<FileUploadProps, 'accept' | 'allowedTypes'> {
  aspectRatio?: number; // width/height ratio for cropping
  maxDimensions?: { width: number; height: number };
  showCropTool?: boolean;
}

export const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
  ({
    aspectRatio,
    maxDimensions,
    showCropTool = false,
    ...props
  }, ref) => {
    return (
      <FileUpload
        {...props}
        ref={ref}
        accept="image/*"
        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
      />
    );
  }
);

ImageUpload.displayName = 'ImageUpload';

// Document Upload Component (specialized for documents)
interface DocumentUploadProps extends Omit<FileUploadProps, 'accept' | 'allowedTypes'> {
  allowPdf?: boolean;
  allowWord?: boolean;
  allowExcel?: boolean;
  allowText?: boolean;
}

export const DocumentUpload = forwardRef<HTMLInputElement, DocumentUploadProps>(
  ({
    allowPdf = true,
    allowWord = true,
    allowExcel = false,
    allowText = false,
    ...props
  }, ref) => {
    const allowedTypes = [];
    const acceptTypes = [];

    if (allowPdf) {
      allowedTypes.push('application/pdf');
      acceptTypes.push('.pdf');
    }
    if (allowWord) {
      allowedTypes.push('application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      acceptTypes.push('.doc', '.docx');
    }
    if (allowExcel) {
      allowedTypes.push('application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      acceptTypes.push('.xls', '.xlsx');
    }
    if (allowText) {
      allowedTypes.push('text/plain');
      acceptTypes.push('.txt');
    }

    return (
      <FileUpload
        {...props}
        ref={ref}
        accept={acceptTypes.join(',')}
        allowedTypes={allowedTypes}
      />
    );
  }
);

DocumentUpload.displayName = 'DocumentUpload';

// Avatar Upload Component (single image with circular preview)
interface AvatarUploadProps extends Omit<ImageUploadProps, 'multiple' | 'maxFiles' | 'showPreview'> {
  currentAvatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  size = 'md',
  onFilesChange,
  value = [],
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40'
  };

  const previewImage = value[0]?.preview || currentAvatar;

  return (
    <div className="flex items-center space-x-4">
      <div className={cn(
        "relative rounded-full overflow-hidden bg-gray-100",
        sizeClasses[size]
      )}>
        {previewImage ? (
          <img
            src={previewImage}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <ImageUpload
          {...props}
          value={value}
          onFilesChange={onFilesChange}
          multiple={false}
          maxFiles={1}
          showPreview={false}
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default FileUpload;
