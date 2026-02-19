import { Outlet } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-left">
          <h1>Exercise, yet?</h1>
        </div>

        <div className="navbar-right">
          {/* <span>Welcome</span> */}
          <a
            className="pe-auto"
            onClick={() => handleNavigate("/")}
          >
            Home
          </a>
        </div>
      </div>

      <div className="container mt-4">
        <Outlet />
      </div>
    </>
  );
}


export default Layout;
