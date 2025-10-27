import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdAccountBalance,
  MdLogout,
  MdArrowBack,
  MdCloudUpload,
  MdDescription,
  MdDownload,
  MdDelete,
  MdVerified,
} from 'react-icons/md';
import { mockDocuments } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Documents = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'Portfolio', 'Tax', 'Planning', 'Legal'

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleUpload = () => {
    toast.info('Document upload coming soon!');
  };

  const handleDownload = (doc) => {
    toast.success(`Downloading ${doc.name}`);
  };

  const handleDelete = (doc) => {
    toast.info(`Delete functionality coming soon for ${doc.name}`);
  };

  const getDocumentIcon = (type) => {
    return <MdDescription className="text-primary-600" size={40} />;
  };

  const filteredDocuments = filter === 'all'
    ? mockDocuments
    : mockDocuments.filter((doc) => doc.category === filter);

  const categories = ['all', ...new Set(mockDocuments.map((doc) => doc.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900">
                <MdArrowBack size={24} />
              </button>
              <div className="flex items-center gap-3">
                <MdDescription className="text-primary-600 text-3xl" />
                <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">{currentUser?.displayName}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <MdLogout size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <button
            onClick={handleUpload}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            <MdCloudUpload className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-700 font-medium mb-1">Click to upload documents</p>
            <p className="text-sm text-gray-500">PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</p>
          </button>
        </div>

        {/* Category Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                filter === category ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category === 'all' ? 'All Documents' : category}
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
              <MdDescription className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No documents found</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  {getDocumentIcon(doc.type)}
                  {doc.status === 'verified' && (
                    <MdVerified className="text-green-500" size={24} />
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={doc.name}>
                  {doc.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900">{doc.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold text-gray-900">{doc.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-semibold text-gray-900">{doc.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-semibold text-gray-900">{formatDate(doc.uploadDate)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    <MdDownload size={18} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-lg font-medium opacity-90 mb-4">Document Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-75 mb-1">Total Documents</p>
              <p className="text-3xl font-bold">{mockDocuments.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Verified Documents</p>
              <p className="text-3xl font-bold">
                {mockDocuments.filter((doc) => doc.status === 'verified').length}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Categories</p>
              <p className="text-3xl font-bold">{new Set(mockDocuments.map((doc) => doc.category)).size}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
