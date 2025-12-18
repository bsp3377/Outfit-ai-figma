import { useState } from 'react';
import { Search, Filter, Heart, Download, Trash2, Grid3x3, List, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type FilterType = 'all' | 'fashion' | 'jewellery' | 'flatlay' | 'liked';
type ViewMode = 'grid' | 'list';

interface LibraryImage {
  id: string;
  url: string;
  type: 'fashion' | 'jewellery' | 'flatlay';
  timestamp: Date;
  liked: boolean;
}

export function Library() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<LibraryImage | null>(null);

  // Mock library images
  const [images, setImages] = useState<LibraryImage[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1684836341651-4b38c1c04d67?w=800',
      type: 'fashion',
      timestamp: new Date(Date.now() - 3600000),
      liked: true,
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1708245917025-439f493d6571?w=800',
      type: 'jewellery',
      timestamp: new Date(Date.now() - 7200000),
      liked: false,
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1630331384146-a8b2a79a9558?w=800',
      type: 'flatlay',
      timestamp: new Date(Date.now() - 10800000),
      liked: true,
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1704775988759-16fdeb0a2235?w=800',
      type: 'fashion',
      timestamp: new Date(Date.now() - 14400000),
      liked: false,
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1687078426457-89ce2b562eaf?w=800',
      type: 'jewellery',
      timestamp: new Date(Date.now() - 18000000),
      liked: true,
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1754639347079-d8d8aa8c99f6?w=800',
      type: 'flatlay',
      timestamp: new Date(Date.now() - 21600000),
      liked: false,
    },
  ]);

  const filteredImages = images.filter(img => {
    if (filter === 'liked') return img.liked;
    if (filter !== 'all') return img.type === filter;
    return true;
  });

  const toggleLike = (id: string) => {
    setImages(prev =>
      prev.map(img => img.id === id ? { ...img, liked: !img.liked } : img)
    );
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    toast.success('Image deleted');
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const downloadImage = (url: string) => {
    toast.success('Download started', {
      description: 'Your image is being downloaded',
    });
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'jewellery', label: 'Jewellery' },
    { id: 'flatlay', label: 'Flatlay' },
    { id: 'liked', label: 'Liked' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl mb-2">Your Library</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-all ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-all ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-600 dark:hover:border-purple-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Images Grid/List */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="mb-2">No images found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or generate some new images
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map(img => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-purple-600 dark:hover:border-purple-600 transition-all cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.url}
                alt="Generated result"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(img.id);
                  }}
                  className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg hover:scale-110 transition-all"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      img.liked ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(img.url);
                  }}
                  className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg hover:scale-110 transition-all"
                >
                  <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(img.id);
                  }}
                  className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg hover:scale-110 transition-all"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
              {img.liked && (
                <div className="absolute top-2 right-2">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-all">
                <p className="text-xs text-white capitalize">{img.type}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredImages.map(img => (
            <div
              key={img.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center gap-4 hover:border-purple-600 dark:hover:border-purple-600 transition-all"
            >
              <img
                src={img.url}
                alt="Generated result"
                className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                onClick={() => setSelectedImage(img)}
              />
              <div className="flex-1">
                <p className="capitalize mb-1">{img.type}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {img.timestamp.toLocaleDateString()} at {img.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLike(img.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      img.liked ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                </button>
                <button
                  onClick={() => downloadImage(img.url)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                >
                  <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => deleteImage(img.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-0 lg:p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-t-2xl lg:rounded-2xl w-full lg:max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
              <h3>Image Details</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <img
                src={selectedImage.url}
                alt="Generated result"
                className="w-full rounded-lg mb-6"
              />

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="capitalize">{selectedImage.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span>{selectedImage.timestamp.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadImage(selectedImage.url)}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    toggleLike(selectedImage.id);
                    setSelectedImage({
                      ...selectedImage,
                      liked: !selectedImage.liked,
                    });
                  }}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      selectedImage.liked
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                  <span>{selectedImage.liked ? 'Liked' : 'Like'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
