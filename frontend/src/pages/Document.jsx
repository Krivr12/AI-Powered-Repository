import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { thesisAPI } from '../services/api';

const Document = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thesis, setThesis] = useState(null);
  const [similarTheses, setSimilarTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadThesis();
    loadSimilarTheses();
  }, [id]);

  const loadThesis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await thesisAPI.getById(id);
      setThesis(result.data);
    } catch (err) {
      console.error('Error loading thesis:', err);
      setError('Failed to load thesis. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarTheses = async () => {
    try {
      const result = await thesisAPI.getSimilar(id, 3);
      setSimilarTheses(result.data || []);
    } catch (err) {
      console.error('Error loading similar theses:', err);
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading thesis...</p>
        </div>
      </div>
    );
  }

  if (error || !thesis) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thesis Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/search" className="btn-primary">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Thesis Card */}
        <div className="card mb-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {thesis.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {new Date(thesis.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {thesis.tags?.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  className="tag hover:bg-primary-200 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Abstract */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Abstract</h3>
            <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">
              {thesis.abstract}
            </p>
          </div>
        </div>

        {/* Similar Theses */}
        {similarTheses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Similar Theses</h2>
            <div className="space-y-4">
              {similarTheses.map((similar) => (
                <Link
                  key={similar._id}
                  to={`/document/${similar._id}`}
                  className="card block hover:border-primary-300"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-700 transition-colors">
                    {similar.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {similar.tags?.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {similar.score && (
                    <span className="text-sm text-primary-600 font-medium">
                      Similarity: {(similar.score * 100).toFixed(1)}%
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Document;

