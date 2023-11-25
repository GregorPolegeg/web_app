import React, { useEffect, useState } from 'react';

import { FaPause, FaPlay } from "react-icons/fa";

interface VoiceMessageProps {
  src: string;
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ src }) => {
  const [audio] = useState(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Function to format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Function to toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Update the current time of the audio
  useEffect(() => {
    const interval = setInterval(() => {
      if(isPlaying)
      setCurrentTime(audio.currentTime);
    }, 1000);

    // Cleanup the interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, [audio]);

  // Effect to handle play/pause
  useEffect(() => {
    isPlaying ? audio.play() : audio.pause();
  }, [isPlaying, audio]);

  // Effect to set the duration
  useEffect(() => {
    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    // Remove event listeners on cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audio]);

  return (
    <button
      type="button"
      onClick={togglePlayPause}
      className="inline-flex items-center justify-center p-2 my-1 bg-blue-500 text-white rounded-full cursor-pointer shadow-md"
    >
      {isPlaying ? <FaPause /> : <FaPlay />} <p className='px-2'>{formatTime(currentTime)} / {formatTime(duration)}</p>
    </button>
  );
};

export default VoiceMessage;
