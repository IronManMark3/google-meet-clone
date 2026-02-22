import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export default function Meeting() {
  const { roomId } = useParams(); // Grabs the room code from the URL
  const navigate = useNavigate();
  
  // A reference to our HTML video element so we can attach the stream to it
  const localVideoRef = useRef(null);
  
  // State to hold the stream and handle UI toggles
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    // 1. Ask the browser for camera and microphone access
    const startMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        setStream(mediaStream);
        
        // 2. Attach the live stream to the video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setError("Could not access camera and microphone. Please check your browser permissions.");
      }
    };

    startMedia();

    // 3. Cleanup: Turn off the camera when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty array means this runs once when the page loads

  // --- Media Controls ---
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const leaveMeeting = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/'); // Send them back to the home page
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center p-6">
      
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold tracking-widest text-white flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-glow shadow-neon flex items-center justify-center">
            <Video size={14} className="text-dark" />
          </div>
          NEXUS
        </h1>
        <div className="text-gray-400 font-mono bg-darker px-4 py-2 rounded-lg border border-gray-800">
          Room: <span className="text-glow">{roomId}</span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="w-full max-w-4xl aspect-video bg-darker rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden flex items-center justify-center">
        {error ? (
          <p className="text-red-400 p-4 text-center">{error}</p>
        ) : (
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted // CRITICAL: Always mute the local video so you don't hear your own echo!
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
          />
        )}
        
        {/* Placeholder avatar for when video is toggled off */}
        {isVideoOff && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-darker">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary shadow-neon">
              <span className="text-4xl text-primary">You</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="mt-8 flex gap-6 bg-darker p-4 rounded-2xl border border-gray-800 shadow-xl">
        <button 
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-all duration-300 ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-dark text-white border border-gray-700 hover:border-glow hover:text-glow hover:shadow-neon'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        
        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all duration-300 ${isVideoOff ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-dark text-white border border-gray-700 hover:border-glow hover:text-glow hover:shadow-neon'}`}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        
        <button 
          onClick={leaveMeeting}
          className="p-4 rounded-full bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:bg-red-700 transition-all duration-300"
        >
          <PhoneOff size={24} />
        </button>
      </div>
      
    </div>
  );
}