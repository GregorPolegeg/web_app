import React, { useState, useRef, useEffect } from 'react';
import { CiMicrophoneOn } from 'react-icons/ci';

interface MicrophoneRecorderProps {
  conversationId: string;
  memberId: string;
}

const MicrophoneRecorder: React.FC<MicrophoneRecorderProps> = ({ conversationId, memberId }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [startTimestamp, setStartTimestamp] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const recordingTimeoutRef = useRef<number | null>(null);
  

    useEffect(() => {
        return () => {
          if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
          }
        };
      }, []);
      
  const onSendAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice_message.mp3");
    formData.append("conversationId", conversationId);
    formData.append("memberId", memberId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/chat/sendAudioMessage", true);
    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log("Audio sent successfully");
      } else {
        console.error("Failed to send audio", xhr.responseText);
      }
    };
    xhr.onerror = () => {
      console.error("Network error while sending audio");
    };
    xhr.send(formData);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !MediaRecorder) {
      console.error("Recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });



      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        onSendAudio(audioBlob);
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStartTimestamp(Date.now());
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {

    const recordingLength = Date.now() - startTimestamp;
    if (recordingLength < 2000) {
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      }, 2000 - recordingLength);
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="microphone-recorder">
      <button
        onClick={toggleRecording}
        disabled={isRecording && (Date.now() - startTimestamp) < 2000}
        className={`text-2xl flex items-center cursor-pointer ${isRecording ? 'recording' : ''}`}
      >
        {isRecording ? <CiMicrophoneOn className=' text-blue-600'/> : <CiMicrophoneOn/>}
      </button>
    </div>
  );
};

export default MicrophoneRecorder;
