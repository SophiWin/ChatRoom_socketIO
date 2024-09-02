import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRightCircleIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

export default function Room({ username, room, socket }) {
  const navigate = useNavigate();
  const [roomUsers, setRoomUsers] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [message, setMessage] = useState("");
  const boxDivRef = useRef(null);

  const getOldMessages = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER}/chat/${room}`);
    if (res.status === 403) {
      return navigate("/");
    }
    const data = await res.json();
    setReceivedMessages((prev) => [...prev, ...data]);
  };
  useEffect((_) => {
    getOldMessages();
  }, []);
  useEffect(
    (_) => {
      socket.emit("joined_room", { username, room });
      socket.on("message", (data) => {
        setReceivedMessages((prev) => [...prev, data]);
      });

      // get same room users from server
      socket.on("room_users", (data) => {
        let prevRoomUsers = [...roomUsers];
        data.forEach((user) => {
          const index = prevRoomUsers.findIndex(
            (prevUser) => prevUser.id === user.id
          );
          if (index !== -1) {
            prevRoomUsers[index] = { ...prevRoomUsers[index], ...data };
          } else {
            prevRoomUsers.push(user);
          }
        });
        setRoomUsers(prevRoomUsers);
      });
      return () => socket.disconnect();
    },
    [socket]
  );

  const leaveRoom = () => {
    navigate("/");
  };

  const sendMsg = () => {
    if (message.trim().length > 0) {
      socket.emit("message_send", message);
      setMessage("");
    }
  };

  useEffect(
    (_) => {
      if (boxDivRef.current) {
        boxDivRef.current.scrollTop = boxDivRef.current.scrollHeight;
      }
    },
    [receivedMessages]
  );
  return (
    <div className="flex gap-4 h-screen">
      {/* left side */}
      <div className="w-1/3 bg-blue-500 text-white font-medium relative">
        <p className="text-3xl font-bold text-center mt-5 ">Room.io</p>
        <div className="mt-10 ps-2">
          <p className="text-lg flex items-center gap-1">
            <ChatBubbleLeftRightIcon width={30} /> Room name
          </p>
          <p className="bg-white text-blue-500 ps-5 py-2 rounded-tl-full rounded-bl-full my-2">
            {room}
          </p>
        </div>
        <div className="mt-5 ps-2">
          <p className="flex gap-1 items-center text-lg mb-3">
            <UserGroupIcon width={30} />
            Users
          </p>
          {roomUsers.map((user, i) => (
            <p className="flex items-center gap-1 text-sm my-2" key={i}>
              <UserIcon width={24} />
              {user.username === username ? "You" : user.username}
            </p>
          ))}
        </div>
        <button
          onClick={leaveRoom}
          className="absolute bottom-0 p-2.5 flex items-center gap-1 w-full mx-2 mb-2"
        >
          <ArrowRightStartOnRectangleIcon width={30} />
          Leave Room
        </button>
      </div>
      {/* right side */}
      <div className="w-full pt-5 relative">
        <div className="h-[30rem] overflow-y-auto " ref={boxDivRef}>
          {receivedMessages.map((msg, i) => (
            <div
              key={i}
              className="text-white bg-blue-500 px-3 py-2 w-3/4 rounded-br-3xl rounded-tl-3xl mb-3"
            >
              <p className="text-sm font-medium font-mono">
                from {msg.username}
              </p>
              <p className="text-lg font-medium">{msg.message}</p>
              <p className="text-sm font-mono text-right font-medium">
                {formatDistanceToNow(new Date(msg.sent_at))}
              </p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 my-2 py-2.5 flex items-center w-full px-2 ">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            placeholder="type message here ..."
            className="w-full outline-none border-b text-lg me-2"
          />
          <button onClick={sendMsg} type="button">
            <PaperAirplaneIcon
              width={30}
              className="hover:text-blue-500 hover:-rotate-45 duration-200"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
