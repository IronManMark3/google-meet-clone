import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export default function Meeting() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // Video Elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // State
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // WebRTC & WebSocket Refs
  const wsRef = useRef(null);
  const peerRef = useRef(null);

  // Free Google STUN Server to bypass basic firewalls
  const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  // Main setup effect
  useEffect(() => {
    let localStream = null;

    const startCall = async () => {
      try {
        // 1. Get user media
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(localStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // 2. Connect to our Spring Boot WebSocket server
        wsRef.current = new WebSocket('ws://localhost:8080/signaling');
        
        wsRef.current.onopen = () => {
          console.log("Connected to Signaling Server");
          sendMessage({ type: 'join', roomId: roomId });
        };

        // 3. Handle incoming signaling messages
        wsRef.current.onmessage = async (event) => {
          const message = JSON.parse(event.data);
          
          if (message.type === 'join') {
            // Another user joined. We initiate the WebRTC Offer.
            createPeerConnection(localStream);
            const offer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(offer);
            sendMessage({ type: 'offer', sdp: offer.sdp, roomId: roomId });
          } 
          else if (message.type === 'offer') {
            // We received an Offer. We respond with an Answer.
            createPeerConnection(localStream);
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(message));
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            sendMessage({ type: 'answer', sdp: answer.sdp, roomId: roomId });
          } 
          else if (message.type === 'answer') {
            // The other user accepted our Offer.
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(message));
          } 
          else if (message.type === 'candidate') {
            // Network routing data received.
            if (peerRef.current) {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
          }
        };
      } catch (err) {
        console.error(err);
        setError("Could not access camera/microphone.");
      }
    };

    startCall();

    // Cleanup on unmount
    return () => {
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      if (peerRef.current) peerRef.current.close();
      if (wsRef.current) wsRef.current.close();
    };
  }, [roomId]);

  // Safely attach the remote stream to the DOM once React renders the <video> tag
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Helper to create the WebRTC connection
  const createPeerConnection = (currentStream) => {
    if (peerRef.current) return; 
    
    const peer = new RTCPeerConnection(configuration);
    peerRef.current = peer;

    // Send our video to the other person
    currentStream.getTracks().forEach(track => {
      peer.addTrack(track, currentStream);
    });

    // Receive the other person's video (with Safari fallback)
    peer.ontrack = (event) => {
      const incomingStream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
      setRemoteStream(incomingStream);
    };

    // Send our network routing data (ICE Candidates) to the server
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({ type: 'candidate', candidate: event.candidate, roomId: roomId });
      }
    };
  };

  const sendMessage = (msgObj) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msgObj));
    }
  };

  // --- UI Controls ---
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
    navigate('/'); 
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
      <div className="w-full max-w-5xl aspect-video bg-darker rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden flex items-center justify-center">
        {error && <p className="text-red-400 z-50 absolute">{error}</p>}

        {/* Remote User Video (Takes full screen if they exist) */}
        {remoteStream && (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Local User Video (Centered if alone, Picture-in-Picture if someone joins) */}
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`object-cover transition-all duration-500 shadow-2xl ${
            remoteStream 
              ? 'absolute bottom-6 right-6 w-48 h-32 rounded-xl border-2 border-gray-700 z-10' 
              : 'w-full h-full'
          } ${isVideoOff ? 'hidden' : 'block'}`}
        />

        {/* Local Video Placeholder */}
        {isVideoOff && !remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-darker">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary shadow-neon">
              <span className="text-4xl text-primary">You</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="mt-8 flex gap-6 bg-darker p-4 rounded-2xl border border-gray-800 shadow-xl">
        <button onClick={toggleAudio} className={`p-4 rounded-full transition-all duration-300 ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-dark text-white border border-gray-700 hover:border-glow hover:text-glow hover:shadow-neon'}`}>
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        
        <button onClick={toggleVideo} className={`p-4 rounded-full transition-all duration-300 ${isVideoOff ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-dark text-white border border-gray-700 hover:border-glow hover:text-glow hover:shadow-neon'}`}>
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        
        <button onClick={leaveMeeting} className="p-4 rounded-full bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:bg-red-700 transition-all duration-300">
          <PhoneOff size={24} />
        </button>
      </div>
      
    </div>
  );
}