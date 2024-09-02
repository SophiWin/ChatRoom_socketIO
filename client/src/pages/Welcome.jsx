import React from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
export default function Welcome({
  username,
  setUsername,
  room,
  setRoom,
  setSocket,
}) {
  const navigate = useNavigate();
  const joinRoom = (e) => {
    e.preventDefault();
    if (
      username.trim().length > 0 &&
      room !== "select-room" &&
      room.trim().length > 0
    ) {
      const socket = io.connect("http://localhost:4000");
      setSocket(socket);
      navigate("/chat", { replace: true });
    } else {
      alert("Fill all info");
    }
  };
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-1/2 bg-gray-50 p-10 rounded-lg">
        <h2 className="text-5xl font-bold text-center text-blue-500 mb-6">
          Room.io
        </h2>
        <form onSubmit={joinRoom}>
          <div className="mb-3">
            <input
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              className="border-2 border-blue-500 outline-none p-2.5 rounded-lg w-full text-base font-medium"
              type="text"
              placeholder="username ..."
            />
          </div>
          {/* select options */}
          <div className="mb-3">
            <select
              onChange={(e) => setRoom(e.target.value)}
              className="border-2 border-blue-500 text-base font-medium rounded-lg block w-full text-center focus:ring-blue-500 p-2.5"
              name="room"
              id="room"
            >
              <option value="select-room">Select Room</option>
              <option value="react">React</option>
              <option value="node">Node</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full text-center text-white bg-blue-500 py-3.5 rounded-lg font-medium "
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
