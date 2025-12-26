"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = useSession();

  return (
    <nav className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl normal-case">
          Better-Auth Server
        </Link>
      </div>

      <div className="flex-none">
        {isPending ? (
          <span className="loading loading-spinner loading-md"></span>
        ) : session ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-10">
                    <span className="text-lg">
                      {session.user.name?.[0] || session.user.email?.[0] || "U"}
                    </span>
                  </div>
                </div>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a className="justify-between">
                  {session.user.name || session.user.email}
                  <span className="badge badge-success">Logged in</span>
                </a>
              </li>
              <li>
                <button onClick={() => signOut()} className="text-error">
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link href="/auth" className="btn btn-primary">
            Sign in / Sign up
          </Link>
        )}
      </div>
    </nav>
  );
}