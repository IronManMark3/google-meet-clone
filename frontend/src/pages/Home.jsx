import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Keyboard } from 'lucide-react';
import { v4 as uuidV4 } from 'uuid';

export default function Home() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  // Generates a random ID and pushes the user to that route
  const createNewMeeting = () => {
    const newRoomId = uuidV4();
    navigate(`/room/${newRoomId}`);
  };

  // Allows joining an existing room
  const joinMeeting = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/room/${roomCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 bg-gradient-to-br from-dark to-darker">
      
      {/* Header */}
      <div className="absolute top-6 left-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-glow shadow-neon flex items-center justify-center">
          <Video size={18} className="text-dark" />
        </div>
        <h1 className="text-2xl font-bold tracking-wider text-white">NEXUS</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center max-w-6xl w-full justify-around mt-16">
        
        {/* Left Side: Call to Action */}
        <div className="flex flex-col gap-6 max-w-md">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Premium video meetings. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-glow to-primary">
              Built for the future.
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Connect, collaborate, and celebrate from anywhere with Nexus.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button 
              onClick={createNewMeeting}
              className="bg-transparent border border-glow text-glow px-6 py-3 rounded-lg font-semibold shadow-neon hover:bg-glow hover:text-dark transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video size={20} />
              New Meeting
            </button>
            
            <form onSubmit={joinMeeting} className="relative flex items-center">
              <Keyboard size={20} className="absolute left-3 text-gray-400" />
              <input 
                type="text" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter a code or link" 
                className="bg-darker border border-gray-700 text-white px-10 py-3 rounded-lg focus:outline-none focus:border-glow focus:shadow-neon transition-all w-full"
              />
            </form>
          </div>
        </div>

        {/* Right Side: Hero Graphic */}
        <div className="w-full max-w-lg aspect-video bg-darker rounded-2xl border border-gray-800 shadow-2xl flex flex-col items-center justify-center overflow-hidden relative">
           <div className="absolute inset-0 bg-gradient-to-tr from-dark to-primary opacity-20"></div>
           <div className="text-glow flex flex-col items-center gap-4 z-10">
            <Video size={56} className="animate-pulse drop-shadow-[0_0_15px_rgba(102,252,241,0.8)]" />
            <p className="text-xl font-medium tracking-widest">READY</p>
          </div>
        </div>

      </div>
    </div>
  );
}