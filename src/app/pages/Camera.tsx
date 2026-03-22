import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Camera() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Request camera access
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(mediaStream => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(err => {
        console.error('Camera access error:', err);
        setError('Kunne ikke få tilgang til kameraet');
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Navigate to processing screen with photo data
      navigate('/processing', { state: { photoData } });
    }
  };

  const selectFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoData = event.target?.result as string;
          
          // Stop camera stream
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          
          navigate('/processing', { state: { photoData } });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <Button
          onClick={() => {
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            navigate(-1);
          }}
          variant="ghost"
          size="icon"
          className="bg-black/50 text-white hover:bg-black/70 rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="h-full flex items-center justify-center text-white px-6 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Instruction Text */}
        <div className="absolute top-1/4 left-0 right-0 text-center">
          <p className="text-white text-sm bg-black/40 inline-block px-4 py-2 rounded-full">
            Ta bilde av gjenstanden
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-8 flex items-center justify-between">
        <Button
          onClick={selectFromGallery}
          variant="ghost"
          size="icon"
          className="bg-white/20 text-white hover:bg-white/30 rounded-full h-12 w-12"
        >
          <ImageIcon className="h-6 w-6" />
        </Button>

        <button
          onClick={capturePhoto}
          disabled={!!error}
          className="h-20 w-20 rounded-full bg-white border-4 border-white/30 disabled:opacity-50 hover:scale-105 transition-transform active:scale-95"
        />

        <div className="w-12" /> {/* Spacer for alignment */}
      </div>
    </div>
  );
}