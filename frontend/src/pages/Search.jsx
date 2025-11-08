import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { searchAPI, thesisAPI } from '../services/api';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      // Load all theses if no query
      loadAllTheses();
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchAPI.semantic(query, 20, 0.1);
      setTheses(result.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search theses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllTheses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await thesisAPI.getAll(1, 20);
      setTheses(result.data || []);
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load theses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for theses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchParams.get('q')
              ? `Search Results for "${searchParams.get('q')}"`
              : 'All Theses'}
          </h2>
          <p className="text-gray-600 mt-1">
            {loading ? 'Searching...' : `Found ${theses.length} ${theses.length === 1 ? 'thesis' : 'theses'}`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Results List */}
        {!loading && !error && (
          <div className="space-y-4">
            {theses.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">No theses found. Try a different search term.</p>
              </div>
            ) : (
              theses.map((thesis) => (
                <Link
                  key={thesis._id}
                  to={`/document/${thesis._id}`}
                  className="card block hover:border-primary-300 cursor-pointer"
                >
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-700 transition-colors">
                    {thesis.title}
                  </h3>

                  {/* Abstract Preview */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {thesis.abstract}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {thesis.tags?.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {new Date(thesis.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {thesis.score && (
                      <span className="text-primary-600 font-medium">
                        Relevance: {(thesis.score * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

