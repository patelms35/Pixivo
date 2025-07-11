import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import TemplateCard from '../../components/TemplateCard';
import { getTemplateById, getPublishedTemplates } from '../../services/templateService';

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [relatedTemplates, setRelatedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch template data
  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const templateId = parseInt(id);
        if (!templateId || isNaN(templateId)) {
          setError('Invalid template ID');
          return;
        }
        
        const [templateData, allTemplates] = await Promise.all([
          getTemplateById(templateId, false),
          getPublishedTemplates()
        ]);

        if (templateData) {
          const transformedTemplate = {
            id: templateData.id,
            title: templateData.title || 'Untitled Template',
            budget: templateData.budget || 0,
            rating: templateData.rating || 5,
            downloads: templateData.downloads || '0k',
            category: templateData.category || 'uncategorized',
            image: templateData.image_url || templateData.image || '/placeholder-image.svg',
            description: templateData.description || 'No description available',
            fullDescription: templateData.full_description || templateData.description || 'No detailed description available',
            features: Array.isArray(templateData.features) ? templateData.features : 
                     (templateData.features ? [templateData.features] : ['Standard features included']),
            technologies: Array.isArray(templateData.technologies) ? templateData.technologies : 
                         (templateData.technologies ? [templateData.technologies] : ['Modern technologies']),
            demoUrl: templateData.demo_url || templateData.demoUrl || '#',
            downloadUrl: templateData.download_url || templateData.downloadUrl || '#',
            lastUpdated: templateData.updated_at ? 
              new Date(templateData.updated_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Recently updated',
            version: templateData.version || '1.0.0',
            fileSize: templateData.file_size || templateData.fileSize || 'Optimized size',
            compatibleWith: Array.isArray(templateData.compatible_with) ? templateData.compatible_with :
                           (templateData.compatible_with ? [templateData.compatible_with] : ['All modern browsers'])
          };
          
          setTemplate(transformedTemplate);

          // Get related templates
          const related = allTemplates
            .filter(t => t.category === templateData.category && t.id !== templateData.id)
            .slice(0, 3)
            .map(t => ({
              id: t.id,
              title: t.title,
              budget: t.budget,
              rating: t.rating,
              downloads: t.downloads,
              category: t.category,
              image: t.image_url || t.image,
              technologies: t.technologies || []
            }));
          
          setRelatedTemplates(related);
        } else {
          setError('Template not found');
        }
      } catch (err) {
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplateData();
    }
  }, [id]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Template...</h3>
            <p className="text-gray-600">Please wait while we fetch the template details.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Template Not Found</h1>
            <p className="text-gray-600 mb-8">{error || "The template you're looking for doesn't exist."}</p>
            <Link 
              to="/templates" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section - Simple Layout */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-34 pb-12">
          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Side - Template Preview */}
            <div className="lg:col-span-2">
              {/* Template Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{template.title}</h1>
                <p className="text-gray-600 text-lg">{template.description}</p>
              </div>

              {/* Image Preview */}
              <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden group">
                <img
                  src={template.image}
                  alt={template.title}
                  className="w-full h-[400px] object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.svg';
                  }}
                />
                
                {/* Simple Hover Overlay */}
                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-800 px-4 py-2 rounded font-medium cursor-pointer"
                  >
                    Quick Preview
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Template Info */}
            <div>
              {/* Pricing Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {/* Rating & Downloads */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-1">
                    {renderStars(template.rating)}
                    <span className="text-sm text-gray-600 ml-2">({template.rating})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                    </svg>
                    <span className="text-sm">{template.downloads} downloads</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-gray-900">${template.budget}</span>
                  <span className="text-gray-600 ml-2">one-time</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  <button 
                    onClick={() => navigate(`/download-step-1/${id}`)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Download Now
                  </button>
                  
                  <button 
                    onClick={() => window.open(template.demoUrl, '_blank')}
                    className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded font-medium hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Live Preview
                  </button>
                </div>

                {/* Template Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Template Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{template.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium">{template.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">File Size:</span>
                      <span className="font-medium">{template.fileSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{template.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information - Simplified */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Description Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Template</h2>
            <div className="prose prose-lg text-gray-600 leading-relaxed mb-8">
              <p>{template.fullDescription}</p>
            </div>
            
           
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Template Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Technologies Used</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {template.technologies.map((tech, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">{tech}</span>
                </div>
              ))}
            </div>

            {/* Compatible With Section (Boxed) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compatible With</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.compatibleWith.map((item, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* About Developer - Moved to Last */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Developer</h2>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">PT</span>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">PixivoTheme</div>
                <div className="text-gray-600">Professional Developer</div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Creating high-quality, modern templates for businesses and developers worldwide. 
              With years of experience in web development and design, we focus on delivering 
              professional, responsive, and user-friendly templates that help businesses grow online.
            </p>
          </div>
        </div>
      </div>

      {/* Related Templates */}
      {relatedTemplates.length > 0 && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Related <span className="text-blue-600">Templates</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover more templates from the same category that might interest you
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedTemplates.map((relatedTemplate, index) => (
                <div key={relatedTemplate.id} className="group">
                  <TemplateCard template={relatedTemplate} index={index} />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link
                to="/templates"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer"
              >
                View All Templates
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button - Fixed positioning to always be visible */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="fixed top-4 right-4 z-[60] bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200 cursor-pointer shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={template.image}
                alt={template.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = '/placeholder-image.svg';
                }}
              />
            </div>
          </div>
          
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10 cursor-pointer"
            onClick={() => setIsImageModalOpen(false)}
          />
        </div>
      )}
        
        {/* Debug Info (Development Only) */}
        {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-md max-h-96 overflow-y-auto">
            <h4 className="font-bold mb-2">🐛 Debug Info</h4>
          <div className="space-y-2">
            <div><strong>URL ID:</strong> {id}</div>
            <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {error || 'None'}</div>
            <div><strong>Template exists:</strong> {template ? 'Yes' : 'No'}</div>
            {template && (
              <>
                <div><strong>Title:</strong> {template.title}</div>
                <div><strong>Image:</strong> {template.image}</div>
                <div><strong>Description:</strong> {template.description}</div>
                <div><strong>Full Description:</strong> {template.fullDescription}</div>
                <div><strong>Features:</strong> {JSON.stringify(template.features)}</div>
                <div><strong>Technologies:</strong> {JSON.stringify(template.technologies)}</div>
                <div><strong>Compatible With:</strong> {JSON.stringify(template.compatibleWith)}</div>
                <div><strong>Demo URL:</strong> {template.demoUrl}</div>
                <div><strong>Download URL:</strong> {template.downloadUrl}</div>
              </>
            )}
          </div>
          </div>
        )}
      </div>
  );
};

export default TemplateDetail; 