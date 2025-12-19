
import ShareIcon from '@mui/icons-material/Share';
import { useState } from 'react';
import './ShareButton.css';

function ShareButton({ title, text, url, className = '' }) {
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareText = text || 'Check out this story I just read!';
    const shareTitle = title || 'Journals';

    const copyToClipboard = () => {
        // Try modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                })
                .catch(() => fallbackCopy());
        } else {
            fallbackCopy();
        }
    };

    const fallbackCopy = () => {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
    };

    const handleShare = async () => {
        if (sharing) return;
        setSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            } else {
                copyToClipboard();
            }
        } catch (err) {
            // User cancelled share or share failed; fallback to copy
            console.log('Share cancelled or unavailable, using clipboard:', err.message);
            copyToClipboard();
        } finally {
            setSharing(false);
        }
    };

    return (
        <button
            className={`share-btn ${copied ? 'copied' : ''} ${sharing ? 'disabled' : ''} ${className}`}
            onClick={handleShare}
            disabled={sharing}
            title={copied ? 'Link copied!' : 'Share this story'}
        >
            <ShareIcon className="share-icon" />
            <span className="share-label">{copied ? 'Copied!' : 'Share'}</span>
        </button>
    );
}

export default ShareButton;
