const About = () => {
  const techStack = {
    frontend: [
      { name: 'React', description: 'UI Library' },
      { name: 'Vite', description: 'Build Tool' },
      { name: 'Tailwind CSS', description: 'Styling' },
      { name: 'React Router', description: 'Routing' },
      { name: 'Axios', description: 'HTTP Client' },
    ],
    backend: [
      { name: 'Node.js', description: 'Runtime' },
      { name: 'Express.js', description: 'Web Framework' },
      { name: 'MongoDB Atlas', description: 'Database' },
      { name: 'Mongoose', description: 'ODM' },
    ],
    ai: [
      { name: 'LLAMA 3.2', description: 'AI Model' },
      { name: 'Ollama', description: 'Local AI (Development)' },
      { name: 'Groq', description: 'Cloud AI (Production)' },
      { name: 'Vector Embeddings', description: 'Semantic Search' },
      { name: 'RAG', description: 'Retrieval Augmented Generation' },
    ],
  };

  const features = [
    {
      title: 'Semantic Search',
      description:
        'Advanced search powered by vector embeddings that understand the meaning and context of your queries.',
    },
    {
      title: 'AI-Generated Tags',
      description:
        'Automatic categorization using LLAMA 3.2 to generate 3-5 relevant tags for each thesis.',
    },
    {
      title: 'Smart Document Processing',
      description:
        'Each thesis is converted to high-dimensional vectors (3072 dimensions) for intelligent matching.',
    },
    {
      title: 'RAG Chatbot',
      description:
        'Ask questions about theses and get AI-powered answers with source citations.',
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About This Project
          </h1>
          <p className="text-lg text-gray-600">
            An AI-powered thesis repository demonstrating advanced semantic search and document understanding
          </p>
        </div>

        {/* Project Description */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is this?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This is an AI-powered thesis repository that allows users to search and discover academic theses 
            using advanced semantic search technology. Unlike traditional keyword-based search, our system 
            understands the meaning and context of your queries to deliver more relevant results.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Built as a demonstration project, it showcases how modern AI models like LLAMA 3.2 can be 
            integrated into real-world applications to enhance user experience and make information 
            discovery more intuitive and efficient.
          </p>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technology Stack</h2>

          {/* Frontend Technologies */}
          <div className="card mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Frontend
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {techStack.frontend.map((tech, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-900">{tech.name}</div>
                  <div className="text-sm text-gray-600">{tech.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Technologies */}
          <div className="card mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
              Backend
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {techStack.backend.map((tech, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-900">{tech.name}</div>
                  <div className="text-sm text-gray-600">{tech.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Technologies */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AI & Machine Learning
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {techStack.ai.map((tech, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-900">{tech.name}</div>
                  <div className="text-sm text-gray-600">{tech.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Document Input</h4>
                <p className="text-gray-600 text-sm">
                  When a thesis is added, the system stores the title and abstract.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">AI Processing</h4>
                <p className="text-gray-600 text-sm">
                  LLAMA 3.2 analyzes the content to generate vector embeddings (3072 dimensions) and 3-5 relevant tags.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Semantic Search</h4>
                <p className="text-gray-600 text-sm">
                  When you search, your query is converted to a vector and compared against all thesis vectors using cosine similarity.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Ranked Results</h4>
                <p className="text-gray-600 text-sm">
                  Results are ranked by relevance score, showing you the most semantically similar theses first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

