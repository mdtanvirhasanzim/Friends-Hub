import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  MapPin,
  MoreVertical,
  Trash2,
  Flag,
  Send,
  Pin,
  Sparkles,
  Calendar,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { store } from '../../lib/storage';
import { Post, PostComment } from '../../types';
import { timeAgo } from '../../lib/geoUtils';
import confetti from 'canvas-confetti';

interface CommunityFeedProps {
  onOpenMap?: (coords?: { lat: number; lng: number }) => void;
  onOpenProfile?: (userId: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onOpenMap, onOpenProfile }) => {
  const { currentUser, isAdmin } = useAuth();
  const { isSharing, userCoords } = useLocationContext();

  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'meetups' | 'discussions'>('all');

  // New Post Form
  const [content, setContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [locationTag, setLocationTag] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  // Comment input per post
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});

  // Report modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Load and subscribe to posts
  useEffect(() => {
    setPosts(store.getPosts());
    const unsub = store.subscribe(() => {
      setPosts(store.getPosts());
    });
    return () => unsub();
  }, []);

  // Set default location tag if user is sharing
  useEffect(() => {
    if (isSharing && userCoords && !locationTag) {
      setLocationTag('Live GPS Location');
    }
  }, [isSharing, userCoords]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && uploadedImages.length === 0) return;
    if (!currentUser) return;

    setIsPosting(true);
    store.createPost({
      user_id: currentUser.id,
      content,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      location_name: locationTag.trim() || undefined,
      post_type: uploadedImages.length > 0 ? 'photo_upload' : 'post',
    });

    // Reset Form
    setContent('');
    setUploadedImages([]);
    setLocationTag(isSharing ? 'Live GPS Location' : '');
    setShowImageInput(false);
    setIsPosting(false);
  };

  const handleAddImageUrl = () => {
    if (tempImageUrl.trim()) {
      setUploadedImages((prev) => [...prev, tempImageUrl.trim()]);
      setTempImageUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert to Data URLs for instant client-side preview and storage
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setUploadedImages((prev) => [...prev, loadEvt.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLike = (postId: string) => {
    if (!currentUser) return;
    const liked = store.toggleLike(postId, currentUser.id);
    if (liked) {
      // Trigger tiny confetti pop for satisfying engagement
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#10b981', '#14b8a6', '#f43f5e'],
      });
    }
  };

  const handleAddComment = (postId: string) => {
    const text = commentText[postId];
    if (!text || !text.trim() || !currentUser) return;

    store.addComment(postId, currentUser.id, text.trim());
    setCommentText((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      store.deletePost(postId);
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId || !currentUser) return;

    store.createReport({
      reporter_id: currentUser.id,
      reported_post_id: reportingPostId,
      reason: reportReason,
      details: reportDetails,
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportingPostId(null);
      setReportSuccess(false);
      setReportDetails('');
    }, 1500);
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'photos') return p.post_type === 'photo_upload' || (p.images && p.images.length > 0);
    if (activeFilter === 'meetups') return p.post_type === 'meetup_created';
    if (activeFilter === 'discussions') return p.post_type === 'post' || p.post_type === 'announcement';
    return true;
  });

  return (
    <div id="community-feed" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Pinned Community Announcement Banner */}
      {store.getSettings().announcement_active && (
        <div className="p-4 rounded-3xl bg-[#0e0e0e] border border-white/10 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Pin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-zinc-500">
                Community Broadcast
              </span>
              <p className="text-xs sm:text-sm text-zinc-200 font-medium mt-0.5">
                {store.getSettings().announcement_banner}
              </p>
            </div>
          </div>
          {onOpenMap && (
            <button
              onClick={() => onOpenMap()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shrink-0"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Radar</span>
            </button>
          )}
        </div>
      )}

      {/* Post Composer Card */}
      <div className="p-5 rounded-3xl bg-[#080808] border border-[#1a1a1a] shadow-xl">
        <div className="flex gap-3">
          <img
            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
            alt={currentUser?.full_name}
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <form onSubmit={handleCreatePost}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What is on your mind, ${currentUser?.full_name?.split(' ')[0] || 'Friend'}?`}
                rows={3}
                className="w-full bg-[#111111] border border-white/5 rounded-2xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />

              {/* Uploaded Images Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-white/10">
                      <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-black/80 text-rose-400 rounded-full hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add image URL input */}
              {showImageInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3 py-1.5 bg-[#111111] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-medium hover:bg-indigo-500/30"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Bottom Toolbar & Post Button */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {/* File Upload Trigger */}
                  <label className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 cursor-pointer transition-colors">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* URL image input toggle */}
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition-colors text-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline text-zinc-400">Add Photo</span>
                  </button>

                  {/* Location Tag */}
                  <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <input
                      type="text"
                      value={locationTag}
                      onChange={(e) => setLocationTag(e.target.value)}
                      placeholder="Add place..."
                      className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none w-24 sm:w-32"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPosting || (!content.trim() && uploadedImages.length === 0)}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Feed Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Updates' },
          { id: 'photos', label: 'Photos Only' },
          { id: 'meetups', label: 'Meetups' },
          { id: 'discussions', label: 'Discussions' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                : 'bg-[#080808] text-zinc-400 hover:text-white border border-[#1a1a1a]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-[#080808] rounded-3xl border border-[#1a1a1a] text-zinc-500 text-sm">
            No community updates yet in this category. Be the first to share something!
          </div>
        ) : (
          filteredPosts.map((post) => {
            const author = post.profile || store.getProfile(post.user_id);
            const isLiked = currentUser
              ? post.likes.some((l) => l.user_id === currentUser.id)
              : false;
            const canDelete = currentUser?.id === post.user_id || isAdmin;
            const showComments = activeCommentsPostId === post.id;

            return (
              <article
                key={post.id}
                className="p-5 rounded-3xl bg-[#080808] border border-[#1a1a1a] shadow-xl transition-all"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onOpenProfile && author && onOpenProfile(author.id)}
                  >
                    <img
                      src={
                        author?.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          author?.username || 'user'
                        )}`
                      }
                      alt={author?.full_name}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white hover:text-indigo-400 transition-colors">
                          {author?.full_name || 'Friend'}
                        </span>
                        {author?.role === 'admin' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-medium">
                            Admin
                          </span>
                        )}
                        {post.is_pinned && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-400 rounded font-medium flex items-center gap-0.5">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>@{author?.username}</span>
                        <span>•</span>
                        <span>{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Options Menu */}
                  <div className="flex items-center gap-1">
                    {canDelete && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setReportingPostId(post.id)}
                      className="p-1.5 text-zinc-500 hover:text-amber-400 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Report post"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location Badge */}
                {post.location_name && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 text-indigo-400 text-xs font-medium mb-3 border border-white/5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{post.location_name}</span>
                  </div>
                )}

                {/* Post Body Content */}
                <p className="text-sm text-zinc-200 whitespace-pre-line leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Images Grid */}
                {post.images && post.images.length > 0 && (
                  <div
                    className={`grid gap-2 mb-4 rounded-2xl overflow-hidden ${
                      post.images.length === 1
                        ? 'grid-cols-1'
                        : post.images.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-3'
                    }`}
                  >
                    {post.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Post media"
                        className="w-full h-64 object-cover rounded-xl hover:scale-101 transition-transform"
                      />
                    ))}
                  </div>
                )}

                {/* Action Bar (Like, Comment, Share) */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors font-medium ${
                        isLiked ? 'text-rose-400 font-semibold' : 'hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes.length} Likes</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentsPostId(showComments ? null : post.id)
                      }
                      className="flex items-center gap-1.5 hover:text-white transition-colors font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length} Comments</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-zinc-500">
                    {post.post_type === 'meetup_created'
                      ? '📅 Event Notice'
                      : post.post_type === 'photo_upload'
                      ? '📸 Photo Memory'
                      : '💬 Post'}
                  </span>
                </div>

                {/* Expanded Comments Section */}
                {showComments && (
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-3 animate-in fade-in duration-150">
                    {post.comments.length > 0 ? (
                      post.comments.map((comment) => {
                        const commentAuthor =
                          comment.profile || store.getProfile(comment.user_id);
                        return (
                          <div key={comment.id} className="flex gap-2.5 items-start text-xs">
                            <img
                              src={commentAuthor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                              alt=""
                              className="w-7 h-7 rounded-xl object-cover shrink-0 mt-0.5"
                            />
                            <div className="flex-1 bg-zinc-900 p-2.5 rounded-2xl border border-white/5">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-semibold text-zinc-200">
                                  {commentAuthor?.full_name || 'Friend'}
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  {timeAgo(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-zinc-300">{comment.content}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-500 py-1">No comments yet. Write one!</p>
                    )}

                    {/* Write Comment Box */}
                    <div className="flex gap-2 items-center pt-2">
                      <input
                        type="text"
                        value={commentText[post.id] || ''}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder="Write a comment..."
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Report Post Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-medium text-sm">
                <Flag className="w-4 h-4" />
                <span>Report Post to Admin</span>
              </div>
              <button
                onClick={() => setReportingPostId(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center text-emerald-400 text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <span>Thank you. Report forwarded to community moderators.</span>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Reason for report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Spam / Commercial">Spam / Unsolicited</option>
                    <option value="Privacy Violation">Location / Privacy Violation</option>
                    <option value="Harassment">Harassment or Offensive Language</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Additional notes (optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe what is wrong..."
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-lg shadow-rose-500/20"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
