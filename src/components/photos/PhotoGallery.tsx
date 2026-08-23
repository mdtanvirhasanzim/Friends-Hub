import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Upload,
  Image as ImageIcon,
  Download,
  Trash2,
  MapPin,
  Calendar,
  X,
  Plus,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../lib/storage';
import { Album, Photo } from '../../types';
import { timeAgo } from '../../lib/geoUtils';

export const PhotoGallery: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadAlbumId, setUploadAlbumId] = useState<string>('');
  const [uploadLocation, setUploadLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // New Album modal
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumCover, setNewAlbumCover] = useState('');

  // Lightbox Modal
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const refresh = () => {
      setAlbums(store.getAlbums());
      setPhotos(store.getPhotos(selectedAlbumId || undefined));
    };

    refresh();
    const unsub = store.subscribe(refresh);
    return () => unsub();
  }, [selectedAlbumId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setSelectedFiles((prev) => [...prev, loadEvt.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !currentUser) return;

    setIsUploading(true);

    selectedFiles.forEach((fileUrl, index) => {
      store.addPhoto({
        user_id: currentUser.id,
        album_id: uploadAlbumId || undefined,
        title: selectedFiles.length > 1 ? `${uploadTitle} (${index + 1})` : uploadTitle || 'Snapshot',
        description: uploadDesc,
        image_url: fileUrl,
        location_name: uploadLocation || undefined,
      });
    });

    setIsUploading(false);
    setShowUploadModal(false);
    setSelectedFiles([]);
    setUploadTitle('');
    setUploadDesc('');
    setUploadLocation('');
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim() || !currentUser) return;

    const alb = store.createAlbum(
      newAlbumTitle.trim(),
      newAlbumDesc.trim() || undefined,
      newAlbumCover.trim() || undefined,
      currentUser.id
    );

    setNewAlbumTitle('');
    setNewAlbumDesc('');
    setNewAlbumCover('');
    setShowNewAlbumModal(false);
    setSelectedAlbumId(alb.id);
  };

  const handleDeletePhoto = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this photo from community gallery?')) {
      store.deletePhoto(photoId);
      if (activeLightboxIndex !== null) {
        setActiveLightboxIndex(null);
      }
    }
  };

  const handleDownload = (imageUrl: string, title?: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title || 'friendshub-photo'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeAlbum = albums.find((a) => a.id === selectedAlbumId);

  return (
    <div id="photo-gallery-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Photo Memories</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-white/5">
              {photos.length} Photos
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Shared photo albums, roadtrip dumps & high-res group memories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewAlbumModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/5 text-xs font-medium transition-all"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span>New Album</span>
          </button>

          <button
            id="upload-photos-btn"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photos</span>
          </button>
        </div>
      </div>

      {/* Albums Horizontal Reel */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            Featured Albums ({albums.length})
          </span>
          {selectedAlbumId && (
            <button
              onClick={() => setSelectedAlbumId(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Show All Photos
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* "All Photos" Card */}
          <div
            onClick={() => setSelectedAlbumId(null)}
            className={`p-3 rounded-2xl cursor-pointer transition-all border text-left group ${
              selectedAlbumId === null
                ? 'bg-zinc-800/80 border-white/20 ring-1 ring-white/20'
                : 'bg-[#080808] hover:bg-[#111111] border-[#1a1a1a]'
            }`}
          >
            <div className="w-full aspect-video rounded-xl bg-zinc-900 flex items-center justify-center mb-2 overflow-hidden">
              <ImageIcon className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-semibold text-xs text-white truncate">All Memories</div>
            <div className="text-[10px] text-zinc-400">Complete Gallery</div>
          </div>

          {/* Album items */}
          {albums.map((alb) => {
            const isSelected = selectedAlbumId === alb.id;
            return (
              <div
                key={alb.id}
                onClick={() => setSelectedAlbumId(alb.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-all border text-left group ${
                  isSelected
                    ? 'bg-zinc-800/80 border-white/20 ring-1 ring-white/20'
                    : 'bg-[#080808] hover:bg-[#111111] border-[#1a1a1a]'
                }`}
              >
                <div className="w-full aspect-video rounded-xl bg-zinc-900 mb-2 overflow-hidden relative">
                  <img
                    src={alb.cover_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800'}
                    alt={alb.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/80 backdrop-blur-sm rounded text-[9px] font-medium text-white">
                    {alb.photo_count || 0} pics
                  </span>
                </div>
                <div className="font-semibold text-xs text-white truncate">{alb.title}</div>
                <div className="text-[10px] text-zinc-400 truncate">{alb.description || 'Album'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Album Banner Filter */}
      {activeAlbum && (
        <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-indigo-400 font-medium uppercase tracking-widest">
              Album View
            </div>
            <h3 className="text-lg font-serif font-bold text-white">{activeAlbum.title}</h3>
            {activeAlbum.description && (
              <p className="text-xs text-zinc-400 mt-0.5">{activeAlbum.description}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedAlbumId(null)}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Photos Masonry/Grid */}
      <div>
        {photos.length === 0 ? (
          <div className="p-16 text-center bg-[#080808] rounded-3xl border border-[#1a1a1a] text-zinc-400 text-sm">
            <ImageIcon className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
            <p className="font-semibold text-zinc-300">No photos in this album yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Upload pictures to share with the group!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, idx) => {
              const author = photo.profile || store.getProfile(photo.user_id);
              const canDelete = currentUser?.id === photo.user_id || isAdmin;

              return (
                <div
                  key={photo.id}
                  onClick={() => setActiveLightboxIndex(idx)}
                  className="group relative rounded-2xl overflow-hidden bg-[#080808] border border-[#1a1a1a] cursor-pointer shadow-lg hover:border-white/20 transition-all aspect-square"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.title || 'Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(photo.image_url, photo.title);
                        }}
                        className="p-1.5 rounded-lg bg-black/80 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {canDelete && (
                        <button
                          onClick={(e) => handleDeletePhoto(photo.id, e)}
                          className="p-1.5 rounded-lg bg-black/80 text-rose-400 hover:bg-rose-950 transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-xs text-white truncate">
                        {photo.title || 'Memory'}
                      </div>
                      {photo.location_name && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-300 truncate">
                          <MapPin className="w-3 h-3" />
                          <span>{photo.location_name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[9px] text-zinc-400 mt-1">
                        <span>by {author?.full_name?.split(' ')[0] || 'Friend'}</span>
                        <span>{timeAgo(photo.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && photos[activeLightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-900/80 text-white hover:bg-zinc-800 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Nav arrows */}
          {activeLightboxIndex > 0 && (
            <button
              onClick={() => setActiveLightboxIndex(activeLightboxIndex - 1)}
              className="absolute left-4 p-3 rounded-full bg-zinc-900/80 text-white hover:bg-zinc-800 transition-colors z-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {activeLightboxIndex < photos.length - 1 && (
            <button
              onClick={() => setActiveLightboxIndex(activeLightboxIndex + 1)}
              className="absolute right-4 p-3 rounded-full bg-zinc-900/80 text-white hover:bg-zinc-800 transition-colors z-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {(() => {
            const currentPhoto = photos[activeLightboxIndex];
            const author = currentPhoto.profile || store.getProfile(currentPhoto.user_id);

            return (
              <div className="max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row bg-[#0c0c0c] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-[500px]">
                  <img
                    src={currentPhoto.image_url}
                    alt={currentPhoto.title || 'Preview'}
                    className="max-h-[85vh] w-auto object-contain"
                  />
                </div>

                <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-[#0c0c0c] border-t md:border-t-0 md:border-l border-white/10">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-white">{author?.full_name}</h4>
                        <p className="text-xs text-zinc-500">@{author?.username}</p>
                      </div>
                    </div>

                    <h3 className="text-base font-serif font-bold text-white mb-1">
                      {currentPhoto.title || 'Untitled Snapshot'}
                    </h3>

                    {currentPhoto.description && (
                      <p className="text-xs text-zinc-400 mb-3">{currentPhoto.description}</p>
                    )}

                    {currentPhoto.location_name && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{currentPhoto.location_name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(currentPhoto.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <button
                      onClick={() => handleDownload(currentPhoto.image_url, currentPhoto.title)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      <Download className="w-4 h-4" />
                      Download High-Res
                    </button>

                    {(currentUser?.id === currentPhoto.user_id || isAdmin) && (
                      <button
                        onClick={(e) => handleDeletePhoto(currentPhoto.id, e)}
                        className="w-full py-2 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Upload Photos Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-base text-white">Upload Photos to Gallery</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Select Images
                </label>
                <label className="border-2 border-dashed border-zinc-800 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors">
                  <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Click to browse or drop images
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">
                    Supports JPG, PNG, WEBP (Multiple allowed)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Selected Previews */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-square border border-white/10">
                      <img src={file} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-0.5 bg-black/80 text-rose-400 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Title / Caption</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Afternoon Tea by the lake"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Select Album</label>
                  <select
                    value={uploadAlbumId}
                    onChange={(e) => setUploadAlbumId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">General Feed</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Location Tag</label>
                  <input
                    type="text"
                    value={uploadLocation}
                    onChange={(e) => setUploadLocation(e.target.value)}
                    placeholder="e.g. Dhanmondi, Dhaka"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : `Upload (${selectedFiles.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Album Modal */}
      {showNewAlbumModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-base text-white">Create New Album</h3>
              <button
                onClick={() => setShowNewAlbumModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Album Title</label>
                <input
                  type="text"
                  required
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="e.g. Summer Roadtrip 2026"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="What is this album about?"
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={newAlbumCover}
                  onChange={(e) => setNewAlbumCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAlbumModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
