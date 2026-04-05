import ChatArea from "@/components/Chat/Chat";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/auth.context";
import { useChatContext } from "@/contexts/chat_context";
import type { Chat } from "@/types/message";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

export default function Main() {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const { userId } = useAuth()
  const { setChats } = useChatContext()
  const wsRef = useRef<WebSocket | null>(null)
  const token = localStorage.getItem("token_chat")
  if (!userId) return <Navigate to="/login" />

  useEffect(() => {
    let ws = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`ws://10.7.0.38:8080/api/ws/connect/chat?token=${token}`);

        ws.onopen = () => {
          console.log("websocket conectado. Usuario en línea:)");
        };

        ws.onmessage = (event) => {
          console.log("Mensaje recibido (raw):", event.data);

          try {
            const data = JSON.parse(event.data);
            if (data.code) {
              switch(data.code) {
                case "delete":
                  setChats((prev) => prev.filter((chat) => chat.id !== data.chat.id));
                  break
                case "message":
                  setChats((prev) => prev.map((chat) => 
                    chat.id === data.message.chatId ? {...chat, lastMessage: data.message} : chat 
                  ))
                  break
                default:
                  console.log("Otro código recibido:", data.code);
              }
            } else {
              console.log("Agregando nuevo chat:", data.Chat);
              setChats((prev) => [...prev, data.Chat]);
            }
          } catch (parseError) {
            console.error("Error parseando mensaje:", parseError);
            console.log("Raw data que causó error:", event.data);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          // Intentar reconectar después de 10 segundos si no fue un cierre limpio
          if (event.code !== 1000) {
            setTimeout(connectWebSocket, 10000);
          }
        };

        wsRef.current = ws;
      } catch (e) {
        console.error("Error creando WebSocket:", e);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [userId, token]);

  return (
    <div className="relative flex min-h-screen font-sans overflow-hidden"
      style={{
        backgroundImage: `url('/aperture-vintage-Z6EpCdMcoUU-unsplash.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <Sidebar setCurrent={setCurrentChat} />
      <div className="relative flex-1 p-4 mr-100 overflow-hidden">
        {currentChat ? <ChatArea chat={currentChat} userId={userId} /> : (
          <div className="bg-[#a7b7da10] rounded-lg p-4 h-full">
            <p className="flex h-full justify-center items-center text-xl" >Abre un chat para empezar</p>
          </div>
        )}
      </div>
    </div>
  );
}
