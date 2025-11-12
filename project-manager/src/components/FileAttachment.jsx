import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';
import { FaFile, FaTrash, FaDownload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function FileAttachment({ attachments = [], onAttachmentsChange, entityType, entityId }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newAttachments = [...attachments];

    try {
      for (const file of files) {
        // Create a unique file path
        const timestamp = Date.now();
        const fileName = `${entityType}/${entityId}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        // Upload file
        await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Add to attachments array
        newAttachments.push({
          id: timestamp.toString(),
          name: file.name,
          url: downloadURL,
          path: fileName,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });
      }

      onAttachmentsChange(newAttachments);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (attachment) => {
    try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, attachment.path);
      await deleteObject(storageRef);

      // Remove from attachments array
      const updatedAttachments = attachments.filter(a => a.id !== attachment.id);
      onAttachmentsChange(updatedAttachments);
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          {uploading ? (
            <>
              <FaSpinner className="animate-spin text-blue-600" />
              <span className="text-sm text-blue-600">Uploading...</span>
            </>
          ) : (
            <>
              <FaFile className="text-gray-400" />
              <span className="text-sm text-gray-600">Click to upload files</span>
            </>
          )}
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept="*/*"
          />
        </label>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FaFile className="text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)}
                    {attachment.uploadedAt && (
                      <span className="ml-2">
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Download"
                >
                  <FaDownload size={14} />
                </a>
                <button
                  onClick={() => handleDelete(attachment)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Delete"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
