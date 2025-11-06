import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500 rounded-full filter blur-3xl opacity-10"></div>

      <div className="relative z-10 text-center p-6 pt-24">
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
          Capture Ideas, Together.
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto pt-1 mb-8">
          Collabify is the collaborative workspace that brings your team's notes, docs, and projects into one shared space.
        </p>
        <div className="flex justify-center pt-2 items-center gap-4">
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg"
          >
            Get Started
          </Link>
          {/* We can link this to a features section later */}
          <a
            href="#features"
            className="bg-transparent border-2 border-gray-600 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Mockup of the app UI */}
      <div className="relative z-10 w-full max-w-4xl mt-16 px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-2">
           <div className="flex items-center space-x-2 mb-2 px-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
           </div>
           <div className="bg-gray-900 rounded-lg h-64 p-4 text-gray-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus quo voluptas nisi laudantium temporibus labore vel at! Veniam, quod incidunt.
           </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
