import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '../auth/authContext';

function randomID(len) {
  let result = '';
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr || '');
}



// Configuration ZEGOCLOUD - Remplacer par vos identifiants réels
const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET;


const MeetingRoom = ({ roomID, meetingTitle, onClose }) => {
  const containerRef = React.useRef(null);
  const [isConnecting, setIsConnecting] = React.useState(true);
  const {user}=useAuth();
  React.useEffect(() => {
    let zegoInstance = null;
    
    const initializeZegoCloud = async () => {
      if (!containerRef.current) return;
      
      try {
        setIsConnecting(true);
        
        // Générer un token pour la session
        const userID = randomID(5);
        //const userName = `Utilisateur_${userID}`;
        const userName = `${user.name}`;

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_APP_ID,
          ZEGO_SERVER_SECRET,
          roomID,
          userID,
          userName
        );
        
        // Créer l'instance ZegoUIKit
        zegoInstance = ZegoUIKitPrebuilt.create(kitToken);
        
        // Rejoindre la salle
        await zegoInstance.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Copier le lien',
              url: `${window.location.origin}${window.location.pathname}?roomID=${roomID}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          showScreenSharingButton: true,
          showRoomDetailsButton: true,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          layout: "Grid",
          showLayoutButton: true,
          branding: {
            logoURL: "", // URL de votre logo si nécessaire
          },
          onJoinRoom: () => {
            setIsConnecting(false);
          },
          onLeaveRoom: () => {
            if (onClose) onClose();
          }
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation de ZEGOCLOUD:", error);
        setIsConnecting(false);
      }
    };
    
    initializeZegoCloud();
    
    // Nettoyage à la destruction du composant
    return () => {
      if (zegoInstance) {
        try {
          zegoInstance.destroy();
        } catch (error) {
          console.error("Erreur lors de la destruction de l'instance ZEGOCLOUD:", error);
        }
      }
    };
  }, [roomID, onClose]);
  
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header avec titre et bouton de fermeture */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <h2 className="font-medium">{meetingTitle || "Réunion"}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-800"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Conteneur pour ZEGOCLOUD */}
      <div className="flex-1 relative">
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-white rounded-full mb-4"></div>
              <p className="text-white">Connexion à la réunion...</p>
            </div>
          </div>
        )}
        <div 
          ref={containerRef} 
          className="w-full h-full"
        ></div>
      </div>
    </div>
  );
};

export default MeetingRoom;