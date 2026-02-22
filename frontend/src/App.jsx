import { Video, Keyboard } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 bg-gradient-to-br from-dark to-darker">
      
      {/* Header */}
      <div className="absolute top-6 left-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-glow shadow-neon flex items-center justify-center">
          <Video size={18} className="text-dark" />
        </div>
        <h1 className="text-2xl font-bold tracking-wider text-white">AURA</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center max-w-6xl w-full justify-around mt-16">
        
        {/* Left Side: Call to Action */}
        <div className="flex flex-col gap-6 max-w-md">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Premium video meetings. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-glow to-primary">
              Now with a darker vibe.
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Connect, collaborate, and celebrate from anywhere with Aura.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button className="bg-transparent border border-glow text-glow px-6 py-3 rounded-lg font-semibold shadow-neon hover:bg-glow hover:text-dark transition-all duration-300 flex items-center justify-center gap-2">
              <Video size={20} />
              New Meeting
            </button>
            
            <div className="relative flex items-center">
              <Keyboard size={20} className="absolute left-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Enter a code or link" 
                className="bg-darker border border-gray-700 text-white px-10 py-3 rounded-lg focus:outline-none focus:border-glow focus:shadow-neon transition-all w-full"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Video Preview Placeholder */}
        <div className="w-full max-w-lg aspect-video bg-darker rounded-2xl border border-gray-800 shadow-2xl flex flex-col items-center justify-center overflow-hidden relative">
          <div className="text-gray-500 flex flex-col items-center gap-4">
            <Video size={48} className="opacity-50" />
            <p className="text-lg">Camera is starting...</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;