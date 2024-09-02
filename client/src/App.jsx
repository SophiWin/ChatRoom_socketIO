import React, { useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Room from "./pages/Room";

export default function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState(null);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Welcome
          username={username}
          setUsername={setUsername}
          setRoom={setRoom}
          room={room}
          setSocket={setSocket}
        />
      ),
    },
    {
      path: "/chat",
      element: <Room room={room} username={username} socket={socket} />,
    },
  ]);
  return <RouterProvider router={router} />;
}
