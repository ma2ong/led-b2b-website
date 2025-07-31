import React, { forwardRef, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FormField from './FormField';
import { formatFileSize } from '@/lib/utils';
import type { FileUploadProps } from '@/types/components';

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      error,
      helperText,
      accept,
      maxSize,
      maxFiles = 1,
      onFilesChange,
      preview = false,
      dragAndDrop = true,
      className,
      multiple,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

    const validateFile = useCallback((file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size must be less than ${formatFileSize(maxSize)}`;
      }
      
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        
        const isAccepted = acceptedTypes.some(acceptedType => {
          if (acceptedType.startsWith('.')) {
            return fileName.endsWith(acceptedType.toLowerCase());
          }
          if (acceptedType.includes('*')) {
            const baseType = acceptedType.split('/')[0];
            return fileType.startsWith(baseType);
          }
          return fileType === acceptedType;
        });
        
        if (!isAccepted) {
          return `File type not accepted. Accepted types: ${accept}`;
        }
      }
      
      return null;
    }, [accept, maxSize]);

    const handleFiles = useCallback((newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach(file => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        console.warn('File validation errors:', errors);
      }

      const totalFiles = multiple ? [...files, ...validFiles] : validFiles;
      const limitedFiles = totalFiles.slice(0, maxFiles);
      
      setFiles(limitedFiles);
      if (onFilesChange) {
        onFilesChange(limitedFiles);
      }
    }, [files, multiple, maxFiles, validateFile, onFilesChange]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files: inputFiles } = event.target;
      if (inputFiles && inputFiles.length > 0) {
        handleFiles(inputFiles);
      }
    };

    const handleDragOver = (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      
      const { files: droppedFiles } = event.dataTransfer;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      if (onFilesChange) {
        onFilesChange(newFiles);
      }
    };

    const openFileDialog = () => {
      fileInputRef.current?.click();
    };

    const renderFilePreview = (file: File, index: number) => {
      const isImage = file.type.startsWith('image/');
      
      return (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {isImage && preview ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-10 h-10 object-cover rounded"
                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
              />
            ) : (
              <DocumentIcon className="w-10 h-10 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeFile(index)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      );
    };

    const uploadArea = (
      <div className="space-y-4">
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors',
            dragOver
              ? 'border-primary-500 bg-primary-50'
              : error
              ? 'border-error-300 bg-error-50'
              : 'border-gray-300 hover:border-gray-400',
            dragAndDrop && 'cursor-pointer'
          )}
          onDragOver={dragAndDrop ? handleDragOver : undefined}
          onDragLeave={dragAndDrop ? handleDragLeave : undefined}
          onDrop={dragAndDrop ? handleDrop : undefined}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple || maxFiles > 1}
            onChange={handleInputChange}
            className="sr-only"
            {...props}
          />
          
          <div className="text-center">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                {dragAndDrop ? 'Drop files here or click to upload' : 'Click to upload'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {accept && `Accepted formats: ${accept}`}
                {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
                {maxFiles > 1 && ` • Max files: ${maxFiles}`}
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => renderFilePreview(file, index))}
          </div>
        )}
      </div>
    );

    if (label || error || helperText) {
      return (
        <FormField
          label={label}
          error={error}
          helperText={helperText}
        >
          {uploadArea}
        </FormField>
      );
    }

    return uploadArea;
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;