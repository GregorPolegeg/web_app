import { useEffect } from "react";

export function soundEffect(){
    const notificationSound = '/sounds/danny.mp3'; 

    const playSound = () => {
        const audio = new Audio(notificationSound);
        audio.play();
      };
    
      const triggerVibration = () => {
        if (navigator.vibrate) {
            navigator.vibrate(250);
            setTimeout(() => {
              navigator.vibrate(250);
            }, 400);
          }
      };
    
      useEffect(() => {
        playSound();
        triggerVibration();
      },[])
}