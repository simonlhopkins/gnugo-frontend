import Peer, { DataConnection, PeerError, PeerErrorType } from "peerjs";
import { useEffect, useRef, useState } from "react";
import { GameModel } from "./GameManager";
import { Move } from "./Helpers";

interface Callbacks {
  onAddStone(row: number, col: number): void;
  onConnection(): void;
  onDisconnection(): void;
  onColorAssign(color: WGo.B | WGo.W): void;
  onSyncBoard(moveList: Move[], endWithPass: boolean): void;
  onPass(): void;
}
export function useWebRTCClient(callbacks: Callbacks) {
  const {
    onAddStone,
    onPass,
    onConnection,
    onColorAssign,
    onDisconnection,
    onSyncBoard,
  } = callbacks;
  const peerRef = useRef<Peer | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [peerID, setPeerID] = useState<string | null>(null);
  const [otherID, setOtherID] = useState<string | null>(null);

  const getPeer = () => {
    if (!peerRef.current) {
      peerRef.current = new Peer({
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun.l.google.com:5349" },
            { urls: "stun:stun1.l.google.com:3478" },
            { urls: "stun:stun1.l.google.com:5349" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:5349" },
            { urls: "stun:stun3.l.google.com:3478" },
            { urls: "stun:stun3.l.google.com:5349" },
            { urls: "stun:stun4.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:5349" },
          ],
        },
      });
    }
    return peerRef.current;
  };

  useEffect(() => {
    if (connection) {
      connection.on("open", function () {
        // here you have conn.id
        //success
        onConnection();
        console.log("success");
      });
      connection.on("close", () => {
        console.log("Connection closed.");
        onDisconnection();
        setConnection(null);
      });

      connection.on("data", (data: any) => {
        const { message, payload } = data;
        console.log("Data received:", data);
        switch (message) {
          case "addStone":
            onAddStone(payload.row, payload.col);
            break;
          case "pass":
            console.log("receive pass");
            onPass();
            break;
          case "colorAssign":
            console.log("receive pass");
            onColorAssign(payload.color);
            break;
          case "syncBoard":
            onSyncBoard(payload.moveList, payload.pass);
            break;
          default:
            console.log("Unknown message:", message);
        }
      });
    }
    return () => {
      if (connection) {
        connection.off("open");
        connection.off("close");
        connection.off("data");
      }
    };
  }, [connection]);

  useEffect(() => {
    const peer = getPeer();
    peer.on("open", (id) => {
      console.log("My peer ID is: " + id);
      setPeerID(id);
    });

    peer.on("connection", (conn) => {
      console.log("New connection established with peer:", conn.peer);
      setConnection(conn);
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    return () => {
      console.log("Cleaning up peer listeners");
      peer.off("open");
      peer.off("connection");
      peer.off("error");
    };
  }, []);
  const connectPeer = (id: string) =>
    //https://github.com/chidokun/p2p-file-transfer/blob/main/src/helpers/peer.ts
    new Promise<DataConnection>((resolve, reject) => {
      const peer = getPeer();
      try {
        let conn = peer.connect(id, { reliable: true });
        if (!conn) {
          reject(new Error("Connection can't be established"));
        } else {
          conn
            .on("open", function () {
              console.log("Connect to: " + id);
              peer?.removeListener("error", handlePeerError);
              resolve(conn);
            })
            .on("error", function (err) {
              console.log(err);
              peer?.removeListener("error", handlePeerError);
              reject(err);
            });

          // When the connection fails due to expiry, the error gets emmitted
          // to the peer instead of to the connection.
          // We need to handle this here to be able to fulfill the Promise.
          const handlePeerError = (err: PeerError<`${PeerErrorType}`>) => {
            if (err.type === "peer-unavailable") {
              const messageSplit = err.message.split(" ");
              const peerId = messageSplit[messageSplit.length - 1];
              if (id === peerId) reject(err);
            }
          };
          peer.on("error", handlePeerError);
        }
      } catch (err) {
        reject(err);
      }
    });
  const connectToOther = async (otherID: string) => {
    return connectPeer(otherID).then((conn) => {
      setConnection(conn);
      return conn;
    });
  };

  return {
    peerID,
    connection,
    connectToOther,
  };
}

export default useWebRTCClient;
