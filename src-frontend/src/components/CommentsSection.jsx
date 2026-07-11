// c:\xampp\htdocs\youtube-v2\src-frontend\src\components\CommentsSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2, Smile, Image, Play, ChevronDown, ChevronUp, Loader2, Paperclip, X } from 'lucide-react';

export function CommentsSection({ videoId, currentUser, onOpenAuth, onSeekVideo, onNavigateToProfile }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  // Emotes list
  const [emotes, setEmotes] = useState([]);
  const [showEmotePicker, setShowEmotePicker] = useState(null); // 'main' or reply_id/com_id

  // Attachments state
  const [mainAttachmentFile, setMainAttachmentFile] = useState(null);
  const [mainAttachmentUrl, setMainAttachmentUrl] = useState('');
  const [mainAttachmentPreview, setMainAttachmentPreview] = useState('');
  const [mainAttachmentType, setMainAttachmentType] = useState(''); // 'image' / 'video' / 'gif'

  // Mapped replies box attachments
  const [replyAttachmentFiles, setReplyAttachmentFiles] = useState({});
  const [replyAttachmentUrls, setReplyAttachmentUrls] = useState({});
  const [replyAttachmentPreviews, setReplyAttachmentPreviews] = useState({});
  const [replyAttachmentTypes, setReplyAttachmentTypes] = useState({});

  const formatNiceTime = (dateStr, timeStr) => {
    try {
      const then = new Date(dateStr + 'T' + (timeStr || '00:00:00'));
      const diffMs = Date.now() - then.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays > 365) return Math.floor(diffDays / 365) + ' years ago';
      if (diffDays > 30) return Math.floor(diffDays / 30) + ' months ago';
      if (diffDays > 0) return diffDays + ' days ago';
      if (diffHrs > 0) return diffHrs + ' hours ago';
      if (diffMins > 0) return diffMins + ' minutes ago';
      return 'just now';
    } catch {
      return dateStr;
    }
  };

  // Hover User Card state
  const [hoveredUser, setHoveredUser] = useState(null); // { username, x, y }
  const [userCardData, setUserCardData] = useState(null);
  const [userCardLoading, setUserCardLoading] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Reply text states mapped by reply target ID
  const [activeReplyBox, setActiveReplyBox] = useState(null); // 'com_12' or 'rep_34'
  const [replyTexts, setReplyTexts] = useState({});

  // Collapsed/expanded accordion state for comment threads
  const [expandedThreads, setExpandedThreads] = useState({});

  // Auto-resize input ref
  const mainInputRef = useRef(null);

  useEffect(() => {
    fetchComments();
    fetchEmotes();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`./api/index.php?action=get_comments&video_id=${videoId}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching comments:', e);
    }
  };

  const fetchEmotes = async () => {
    try {
      const res = await fetch('./api/index.php?action=get_emotes');
      const data = await res.json();
      setEmotes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching emotes:', e);
    }
  };

  // Adjust textarea height automatically
  const handleInputResize = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handlePostComment = async (e, parentComId = null, parentReplyId = null, repliedTo = '', targetKey = 'main') => {
    e.preventDefault();
    if (!currentUser.name) {
      onOpenAuth();
      return;
    }

    const text = targetKey === 'main' ? commentText : replyTexts[targetKey];
    if (!text || text.trim() === '') return;

    try {
      const formData = new FormData();
      formData.append('video_id', videoId);
      formData.append('comment_text', text);
      if (parentComId) formData.append('parent_com_id', parentComId);
      if (parentReplyId) formData.append('parent_reply_id', parentReplyId);
      if (repliedTo) formData.append('replied_to', repliedTo);

      if (targetKey === 'main') {
        if (mainAttachmentFile) {
          formData.append('attachment', mainAttachmentFile);
        } else if (mainAttachmentUrl) {
          formData.append('attachment_url', mainAttachmentUrl);
        }
      } else {
        if (replyAttachmentFiles[targetKey]) {
          formData.append('attachment', replyAttachmentFiles[targetKey]);
        } else if (replyAttachmentUrls[targetKey]) {
          formData.append('attachment_url', replyAttachmentUrls[targetKey]);
        }
      }

      const res = await fetch('./api/index.php?action=add_comment', {
        method: 'POST',
        body: formData
      });

      const newComment = await res.json();
      if (newComment && !newComment.error) {
        if (targetKey === 'main') {
          setCommentText('');
          setMainAttachmentFile(null);
          setMainAttachmentUrl('');
          setMainAttachmentPreview('');
          setMainAttachmentType('');
          if (mainInputRef.current) mainInputRef.current.style.height = 'auto';
        } else {
          setReplyTexts(prev => ({ ...prev, [targetKey]: '' }));
          setReplyAttachmentFiles(prev => { const n = { ...prev }; delete n[targetKey]; return n; });
          setReplyAttachmentUrls(prev => { const n = { ...prev }; delete n[targetKey]; return n; });
          setReplyAttachmentPreviews(prev => { const n = { ...prev }; delete n[targetKey]; return n; });
          setReplyAttachmentTypes(prev => { const n = { ...prev }; delete n[targetKey]; return n; });
          setActiveReplyBox(null);
        }

        // Auto expand replies accordion on posting reply
        if (parentComId) {
          setExpandedThreads(prev => ({ ...prev, [parentComId]: true }));
        }

        fetchComments();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleVote = async (targetType, targetId, currentVote) => {
    if (!currentUser.name) {
      onOpenAuth();
      return;
    }
    const nextVote = currentVote === 'upvote' ? 'none' : 'upvote';
    try {
      const res = await fetch('./api/index.php?action=vote_comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, vote_type: nextVote })
      });
      const data = await res.json();
      if (data && !data.error) fetchComments();
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleDownvote = async (targetType, targetId, currentVote) => {
    if (!currentUser.name) {
      onOpenAuth();
      return;
    }
    const nextVote = currentVote === 'downvote' ? 'none' : 'downvote';
    try {
      const res = await fetch('./api/index.php?action=vote_comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, vote_type: nextVote })
      });
      const data = await res.json();
      if (data && !data.error) fetchComments();
    } catch (err) {
      console.error('Error downvoting:', err);
    }
  };

  const handleDelete = async (targetType, targetId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch('./api/index.php?action=delete_comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId })
      });
      const data = await res.json();
      if (data && !data.error) fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const selectEmote = (emote, targetKey) => {
    const shortcut = ` :${emote.name}: `;
    if (targetKey === 'main') {
      setCommentText(prev => prev + shortcut);
      if (mainInputRef.current) {
        setTimeout(() => {
          mainInputRef.current.focus();
          mainInputRef.current.style.height = `${mainInputRef.current.scrollHeight}px`;
        }, 10);
      }
    } else {
      setReplyTexts(prev => ({
        ...prev,
        [targetKey]: (prev[targetKey] || '') + shortcut
      }));
    }
    setShowEmotePicker(null);
  };

  // Hover User Card Handlers
  const handleUserMouseEnter = (username, event) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = event.target.getBoundingClientRect();
    const x = rect.left + window.scrollX;
    const y = rect.bottom + window.scrollY + 8;

    setHoveredUser({ username, x, y });
    setUserCardLoading(true);
    setUserCardData(null);

    fetch(`./api/index.php?action=get_user_card&username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setUserCardData(data);
        setUserCardLoading(false);
      })
      .catch(() => setUserCardLoading(false));
  };

  const handleUserMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredUser(null);
      setUserCardData(null);
    }, 400);
  };

  const handleCardMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleCardMouseLeave = () => {
    handleUserMouseLeave();
  };

  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Parse Text: Emote shortcuts, Mentions (@username), Seek Timestamps, Media URLs
  const parseCommentContent = (text) => {
    if (!text) return '';

    // Create a local map of emotes by name
    const emoteMap = {};
    emotes.forEach(e => {
      emoteMap[e.name] = e.url;
    });

    let clean = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Parse legacy tags or replace new :emote: shortcuts
    clean = clean.replace(/:([a-zA-Z0-9_\-]+):/g, (match, emoteName) => {
      if (emoteMap[emoteName]) {
        return `<img class="com_emot" src="${emoteMap[emoteName]}" alt="${emoteName}" title="${emoteName}">`;
      }
      return match;
    });

    // Check for inline video/image urls
    const urlPattern = /(https?:\/\/[^\s<]+?\.(?:jpg|jpeg|png|gif|webp|mp4|webm))/gi;
    clean = clean.replace(urlPattern, (url) => {
      const ext = url.split('.').pop().toLowerCase();
      if (['mp4', 'webm'].includes(ext)) {
        return `<video class="com_video" src="${url}" controls preload="metadata" muted></video>`;
      } else {
        return `<img class="com_img" src="${url}" alt="user attachment">`;
      }
    });

    return clean;
  };

  const handleCommentContainerClick = (e) => {
    const timeMatch = e.target.closest('.timestamp-seek');
    if (timeMatch) {
      e.preventDefault();
      const seconds = parseInt(timeMatch.getAttribute('data-seconds'));
      if (onSeekVideo && !isNaN(seconds)) onSeekVideo(seconds);
      return;
    }

    const mentionMatch = e.target.closest('.user-mention');
    if (mentionMatch) {
      e.preventDefault();
      const username = mentionMatch.getAttribute('data-username');
      if (onNavigateToProfile) onNavigateToProfile(username);
    }
  };

  const enrichHtmlWithReactInterceptors = (html) => {
    if (!html) return '';
    let enriched = html;

    const timeRegex = /\b(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\b/g;
    enriched = enriched.replace(timeRegex, (match, hrs, mins, secs) => {
      const hours = hrs ? parseInt(hrs) : 0;
      const minutes = parseInt(mins);
      const seconds = parseInt(secs);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      return `<a href="#" class="timestamp-seek" data-seconds="${totalSeconds}"><span class="timestamp-play-icon">▶</span> ${match}</a>`;
    });

    const mentionRegex = /@(\w+)/g;
    enriched = enriched.replace(mentionRegex, (match, username) => {
      return `<span class="user-mention" data-username="${username}">${match}</span>`;
    });

    return enriched;
  };

  const toggleRepliesAccordion = (comId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [comId]: !prev[comId]
    }));
  };

  // Main file attachment choices
  const handleMainFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainAttachmentFile(file);
      setMainAttachmentPreview(URL.createObjectURL(file));
      const ext = file.name.split('.').pop().toLowerCase();
      if (['mp4', 'webm', 'ogg'].includes(ext)) {
        setMainAttachmentType('video');
      } else if (ext === 'gif') {
        setMainAttachmentType('gif');
      } else {
        setMainAttachmentType('image');
      }
    }
  };

  const handleReplyFileSelect = (e, targetKey) => {
    const file = e.target.files[0];
    if (file) {
      setReplyAttachmentFiles(prev => ({ ...prev, [targetKey]: file }));
      setReplyAttachmentPreviews(prev => ({ ...prev, [targetKey]: URL.createObjectURL(file) }));
      const ext = file.name.split('.').pop().toLowerCase();
      let type = 'image';
      if (['mp4', 'webm', 'ogg'].includes(ext)) {
        type = 'video';
      } else if (ext === 'gif') {
        type = 'gif';
      }
      setReplyAttachmentTypes(prev => ({ ...prev, [targetKey]: type }));
    }
  };

  const handleAddMediaUrl = (targetKey) => {
    const url = window.prompt("Enter media URL (image, video, gif):");
    if (url) {
      const ext = url.split('.').pop().toLowerCase();
      let type = 'image';
      if (['mp4', 'webm'].includes(ext)) {
        type = 'video';
      } else if (ext === 'gif') {
        type = 'gif';
      }

      if (targetKey === 'main') {
        setMainAttachmentUrl(url);
        setMainAttachmentPreview(url);
        setMainAttachmentType(type);
      } else {
        setReplyAttachmentUrls(prev => ({ ...prev, [targetKey]: url }));
        setReplyAttachmentPreviews(prev => ({ ...prev, [targetKey]: url }));
        setReplyAttachmentTypes(prev => ({ ...prev, [targetKey]: type }));
      }
    }
  };

  const renderCommentNode = (node, isReply = false, parentComId = null) => {
    const itemId = isReply ? `rep_${node.reply_id}` : `com_${node.com_id}`;
    const voteTargetType = isReply ? 'reply' : 'comment';
    const voteTargetId = isReply ? node.reply_id : node.com_id;
    const authorName = node.user_name;

    const isOwn = currentUser.name && currentUser.name.toLowerCase() === authorName.toLowerCase();
    const isAdmin = currentUser.privilege === 'ADMIN';

    const enrichedHtml = enrichHtmlWithReactInterceptors(parseCommentContent(isReply ? node.reply : node.comment));

    return (
      <div
        key={itemId}
        className={`comment-node ${isReply ? 'reply-node' : 'root-comment-node'}`}
        onClick={handleCommentContainerClick}
      >
        <div className="comment-layout-row">
          <img
            src={node.user_pic}
            alt={authorName}
            className="comment-user-avatar clickable"
            onClick={() => onNavigateToProfile && onNavigateToProfile(authorName)}
            onMouseEnter={(e) => handleUserMouseEnter(authorName, e)}
            onMouseLeave={handleUserMouseLeave}
          />
          <div className="comment-body-col">
            <div className="comment-meta-info">
              <span
                className="comment-author-name clickable"
                onClick={() => onNavigateToProfile && onNavigateToProfile(authorName)}
                onMouseEnter={(e) => handleUserMouseEnter(authorName, e)}
                onMouseLeave={handleUserMouseLeave}
              >
                {authorName}
              </span>
              <span className="comment-timestamp">
                {node.com_date ? formatNiceTime(node.com_date, node.com_time) : formatNiceTime(node.reply_date, node.reply_time)}
              </span>
              {node.edited === 'true' && <span className="comment-edited-label">(edited)</span>}
            </div>

            <div className="comment-text-wrapper">
              {node.replied_to && isReply && (
                <span
                  className="reply-to-mention"
                  onClick={() => onNavigateToProfile && onNavigateToProfile(node.replied_to)}
                  onMouseEnter={(e) => handleUserMouseEnter(node.replied_to, e)}
                  onMouseLeave={handleUserMouseLeave}
                >
                  @{node.replied_to}
                </span>
              )}
              <span className="comment-body-text" dangerouslySetInnerHTML={{ __html: enrichedHtml }} />
            </div>

            {node.attachment_url && (
              <div className="comment-attachment-display">
                {node.attachment_type === 'video' ? (
                  <video src={node.attachment_url} className="comment-att-media-v" controls preload="metadata" />
                ) : (
                  <img src={node.attachment_url} className="comment-att-media-i" alt="comment attachment" />
                )}
              </div>
            )}

            <div className="comment-actions-bar">
              <button
                className={`comment-action-btn ${node.user_vote === 'upvote' ? 'active-upvote' : ''}`}
                onClick={() => handleVote(voteTargetType, voteTargetId, node.user_vote)}
              >
                <ThumbsUp size={14} />
              </button>
              <span className="action-stat-count">{node.upvotes || 0}</span>

              <button
                className={`comment-action-btn ${node.user_vote === 'downvote' ? 'active-downvote' : ''}`}
                onClick={() => handleDownvote(voteTargetType, voteTargetId, node.user_vote)}
              >
                <ThumbsDown size={14} />
              </button>

              <button
                className="comment-action-btn reply-trigger"
                onClick={() => setActiveReplyBox(activeReplyBox === itemId ? null : itemId)}
              >
                Reply
              </button>

              {(isOwn || isAdmin) && (
                <button
                  className="comment-action-btn delete-btn"
                  onClick={() => handleDelete(voteTargetType, voteTargetId)}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Reply Input Box (Expands smoothly on focus) */}
            {activeReplyBox === itemId && (
              <form
                onSubmit={(e) => handlePostComment(e, parentComId || node.com_id, isReply ? node.reply_id : null, authorName, itemId)}
                className="inline-reply-form"
              >
                <div className="growing-input-wrapper">
                  <textarea
                    className="growing-textarea"
                    placeholder={`Reply to @${authorName}...`}
                    value={replyTexts[itemId] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [itemId]: e.target.value }))}
                    onInput={handleInputResize}
                    rows={1}
                    required
                  />
                  <span className="underline-focus" />
                </div>

                {/* Reply Attachments Previews */}
                {replyAttachmentPreviews[itemId] && (
                  <div className="attachment-preview-container">
                    {replyAttachmentTypes[itemId] === 'video' ? (
                      <video src={replyAttachmentPreviews[itemId]} className="preview-media" controls />
                    ) : (
                      <img src={replyAttachmentPreviews[itemId]} className="preview-media" alt="preview" />
                    )}
                    <button
                      type="button"
                      className="remove-preview-btn"
                      onClick={() => {
                        setReplyAttachmentFiles(prev => { const n = { ...prev }; delete n[itemId]; return n; });
                        setReplyAttachmentUrls(prev => { const n = { ...prev }; delete n[itemId]; return n; });
                        setReplyAttachmentPreviews(prev => { const n = { ...prev }; delete n[itemId]; return n; });
                        setReplyAttachmentTypes(prev => { const n = { ...prev }; delete n[itemId]; return n; });
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <div className="comment-form-actions">
                  <div className="comment-media-triggers">
                    <button
                      type="button"
                      className="icon-trigger-btn"
                      onClick={() => setShowEmotePicker(showEmotePicker === itemId ? null : itemId)}
                    >
                      <Smile size={18} />
                    </button>

                    <div className="file-upload-icon-trigger">
                      <Image size={18} />
                      <input type="file" accept="image/*,video/*" onChange={(e) => handleReplyFileSelect(e, itemId)} />
                    </div>

                    <button
                      type="button"
                      className="icon-trigger-btn"
                      onClick={() => handleAddMediaUrl(itemId)}
                      title="Link external media URL"
                    >
                      <Paperclip size={16} />
                    </button>

                    {showEmotePicker === itemId && (
                      <div className="emote-picker-popover replies-emotes">
                        {emotes.map((em, idx) => (
                          <button key={idx} type="button" onClick={() => selectEmote(em, itemId)}>
                            <img src={em.url} alt={em.name} title={em.name} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="comment-button-row">
                    <button type="button" className="action-cancel-btn" onClick={() => setActiveReplyBox(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="action-submit-btn" disabled={!(replyTexts[itemId] || '').trim()}>
                      Reply
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="native-comments-section">
      <div className="comments-section-header">
        <h3>{comments.length} Comments</h3>
      </div>

      {/* Main Comment Box (Resembles modern YouTube growing input) */}
      <form onSubmit={(e) => handlePostComment(e, null, null, '', 'main')} className="main-comment-form">
        <div className="comment-layout-row">
          <img
            src={currentUser.pic || '/youtube-v2/Userdatabase/ProfilePic/defaulta.jpg'}
            alt={currentUser.name || 'Guest'}
            className="comment-user-avatar clickable"
            onClick={() => currentUser.name && onNavigateToProfile && onNavigateToProfile(currentUser.name)}
          />
          <div className="comment-body-col">
            <div className="growing-input-wrapper">
              <textarea
                ref={mainInputRef}
                className="growing-textarea"
                placeholder={currentUser.name ? "Add a public comment..." : "Please log in to add comments..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onInput={handleInputResize}
                disabled={!currentUser.name}
                onClick={() => { if (!currentUser.name) onOpenAuth(); }}
                rows={1}
                required
              />
              <span className="underline-focus" />
            </div>

            {/* Attachments preview banner */}
            {mainAttachmentPreview && (
              <div className="attachment-preview-container">
                {mainAttachmentType === 'video' ? (
                  <video src={mainAttachmentPreview} className="preview-media" controls />
                ) : (
                  <img src={mainAttachmentPreview} className="preview-media" alt="preview" />
                )}
                <button
                  type="button"
                  className="remove-preview-btn"
                  onClick={() => {
                    setMainAttachmentFile(null);
                    setMainAttachmentUrl('');
                    setMainAttachmentPreview('');
                    setMainAttachmentType('');
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {currentUser.name && (
              <div className="comment-form-actions">
                <div className="comment-media-triggers">
                  <button
                    type="button"
                    className="icon-trigger-btn"
                    onClick={() => setShowEmotePicker(showEmotePicker === 'main' ? null : 'main')}
                    title="Emotes"
                  >
                    <Smile size={20} />
                  </button>

                  <div className="file-upload-icon-trigger">
                    <Image size={20} />
                    <input type="file" accept="image/*,video/*" onChange={handleMainFileSelect} />
                  </div>

                  <button
                    type="button"
                    className="icon-trigger-btn"
                    onClick={() => handleAddMediaUrl('main')}
                    title="Link external media URL"
                  >
                    <Paperclip size={18} />
                  </button>

                  {showEmotePicker === 'main' && (
                    <div className="emote-picker-popover">
                      {emotes.map((em, idx) => (
                        <button key={idx} type="button" onClick={() => selectEmote(em, 'main')}>
                          <img src={em.url} alt={em.name} title={em.name} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="comment-button-row">
                  <button
                    type="button"
                    className="action-cancel-btn"
                    onClick={() => {
                      setCommentText('');
                      setMainAttachmentFile(null);
                      setMainAttachmentUrl('');
                      setMainAttachmentPreview('');
                      setMainAttachmentType('');
                      if (mainInputRef.current) mainInputRef.current.style.height = 'auto';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="action-submit-btn"
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Accordion Threads List */}
      <div className="comments-list-wrapper">
        {comments.length > 0 ? (
          comments.map(com => {
            const hasReplies = com.replies && com.replies.length > 0;
            const isThreadExpanded = expandedThreads[com.com_id];
            return (
              <div key={`thread_${com.com_id}`} className="comment-thread-group">
                {renderCommentNode(com, false, com.com_id)}

                {hasReplies && (
                  <div className="thread-replies-accordion">
                    <button
                      onClick={() => toggleRepliesAccordion(com.com_id)}
                      className="accordion-toggle-btn"
                    >
                      {isThreadExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span>{isThreadExpanded ? "Hide" : `Show ${com.replies.length}`} replies</span>
                    </button>

                    {isThreadExpanded && (
                      <div className="accordion-content-panel">
                        {com.replies.map(child => renderCommentNode(child, true, com.com_id))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-comments-fallback">No comments yet. Start the discussion!</div>
        )}
      </div>

      {/* Floating Hover User Cards */}
      {hoveredUser && (
        <div
          className="user-card-tooltip"
          style={{ left: `${hoveredUser.x}px`, top: `${hoveredUser.y}px` }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          {userCardLoading ? (
            <div className="user-card-loader">
              <Loader2 className="animate-spin" size={16} /> Loading channel...
            </div>
          ) : userCardData ? (
            <div className="user-card-layout">
              <div className="user-card-header">
                <img src={userCardData.user_pic} alt={userCardData.user_name} className="user-card-avatar clickable" onClick={() => { setHoveredUser(null); onNavigateToProfile(userCardData.user_name); }} />
                <div className="user-card-title-info">
                  <h4 className="user-card-name clickable" onClick={() => { setHoveredUser(null); onNavigateToProfile(userCardData.user_name); }}>
                    {userCardData.first_name || userCardData.last_name ? `${userCardData.first_name} ${userCardData.last_name}`.trim() : userCardData.user_name}
                  </h4>
                  <div className="user-card-handle">@{userCardData.user_name}</div>
                  <div className="user-card-karma-badge">★ {userCardData.karma} Karma</div>
                </div>
              </div>
              <p className="user-card-bio">{userCardData.user_desc}</p>
              <div className="user-card-stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Comments</span>
                  <span className="stat-val">{userCardData.total_comments}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Uploads</span>
                  <span className="stat-val">{userCardData.total_uploads}</span>
                </div>
              </div>
              <div className="user-card-joined">
                Joined: {formatJoinedDate(userCardData.joined_date)}
              </div>
            </div>
          ) : (
            <div className="user-card-error">Failed to load user info</div>
          )}
        </div>
      )}
    </div>
  );
}
