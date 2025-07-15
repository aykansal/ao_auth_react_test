import { NavLink, Outlet } from "react-router";
import "./index.css";

export default function App() {
  return (
    <div>
      <nav className="flex gap-4 p-4 bg-gray-800 text-white">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/wander">Wander</NavLink>
        <NavLink to="/wauth">Wauth</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
